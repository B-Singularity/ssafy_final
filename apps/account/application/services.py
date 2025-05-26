from typing import Optional

from django.utils import timezone
from django.conf import settings # Google Client ID를 사용하기 위해 추가

from apps.account.domain.repositories import UserAccountRepository
from apps.account.domain.aggregates.user_account import UserAccount
from apps.account.domain.value_objects.email import Email
from apps.account.domain.value_objects.nickname import NickName
from apps.account.domain.value_objects.social_link import SocialLink
from .dtos import UserAccountDto, UpdateNicknameRequestDto, UserSocialLinkDto, AuthResponseDto, SocialLoginRequestDto # SocialLoginRequestDto 추가
from apps.account.infrastructure.token_services import TokenService
from apps.account.models import Users # Django User 모델
# from rest_framework_simplejwt.tokens import RefreshToken # TokenService가 처리하므로 직접 사용 안 함
from rest_framework_simplejwt.exceptions import TokenError

# Google ID 토큰 검증을 위한 라이브러리
from google.oauth2 import id_token as google_id_token_verifier
from google.auth.transport import requests as google_auth_requests


class UserAuthAppService:
    def __init__(self, user_account_repository: UserAccountRepository, token_service: TokenService):
        self.user_account_repository = user_account_repository
        self.token_service = token_service

    def _map_domain_to_dto(self, user_account: UserAccount) -> UserAccountDto:
        social_links_dto = [
            UserSocialLinkDto(provider_name=social_link.provider_name, social_id=social_link.social_id)
            for social_link in user_account.social_links
        ]
        return UserAccountDto(
            account_id=user_account.account_id,
            email=user_account.email.address,
            nickname=user_account.nickname.name,
            social_links=social_links_dto,
            created_at=user_account.created_at,
            last_login_at=user_account.last_login_at
        )

    # request_dto 타입을 명확히 하기 위해 SocialLoginRequestDto 사용
    def login_or_register_with_google(self, request_dto: SocialLoginRequestDto) -> AuthResponseDto:
        # 1. Google ID 토큰 검증
        received_google_id_token = request_dto.id_token
        try:
            # GOOGLE_CLIENT_ID는 settings.py 또는 환경 변수에서 가져와야 합니다.
            # settings.py에 GOOGLE_CLIENT_ID = "YOUR_WEB_CLIENT_ID" 와 같이 설정되어 있어야 합니다.
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            if not client_id:
                # 로깅을 추가하는 것이 좋습니다. 예: logger.error("Google Client ID is not configured.")
                raise ValueError("Google Client ID가 서버에 설정되지 않았습니다.") # 또는 다른 적절한 예외

            id_info = google_id_token_verifier.verify_oauth2_token(
                received_google_id_token,
                google_auth_requests.Request(),
                client_id # Audience 검증을 위해 Client ID 전달
            )

            # 검증된 정보 추출
            verified_google_user_id = id_info.get('sub')
            verified_email = id_info.get('email')
            # is_email_verified = id_info.get('email_verified') # 이메일 검증 여부
            # name_from_google = id_info.get('name') # Google 계정 이름
            # profile_picture_url_from_google = id_info.get('picture') # 프로필 사진 URL

            if not verified_google_user_id or not verified_email:
                raise ValueError("Google 토큰에서 필수 사용자 정보를 얻을 수 없습니다.")
            
            # (선택) 요청으로 받은 이메일과 토큰에서 나온 이메일이 같은지 확인할 수 있습니다.
            # if request_dto.email.lower() != verified_email.lower():
            #     raise ValueError("요청된 이메일과 Google 토큰의 이메일이 일치하지 않습니다.")

        except ValueError as e: # id_token.verify_oauth2_token 에서 발생하는 오류 포함
            # 로깅 추가 권장
            raise ValueError(f"Google ID 토큰 검증 실패: {str(e)}") # 에러 메시지를 좀 더 구체적으로 전달
        except Exception as e:
            # 로깅 추가 권장
            raise Exception(f"Google 토큰 처리 중 예상치 못한 오류 발생: {str(e)}")


        # 2. 도메인 객체 생성 및 사용자 조회/등록 로직
        #    이제 `verified_google_user_id`와 `verified_email`을 사용합니다.
        social_link_vo = SocialLink(provider_name="google", social_id=verified_google_user_id)
        email_vo = Email(verified_email) # Google에서 검증된 이메일 사용

        existing_account_domain = self.user_account_repository.find_by_social_link(social_link_vo)
        is_new_user = False
        user_account_domain: UserAccount

        current_time = timezone.now()

        if existing_account_domain:
            user_account_domain = existing_account_domain
            user_account_domain.record_login(current_time)
            # (선택) Google에서 받은 이메일이 기존 이메일과 다르면 업데이트할지 정책 결정
            if user_account_domain.email != email_vo:
                # 예: user_account_domain.update_email(email_vo, some_verification_process)
                # 여기서는 간단히 업데이트한다고 가정 (실제로는 주의 필요)
                user_account_domain._email = email_vo 
        else:
            # 신규 사용자
            is_new_user = True
            
            # 닉네임 결정: 요청에 제안이 있으면 사용, 없으면 Google 이름 사용, 그것도 없으면 이메일 앞부분
            nickname_str = request_dto.nickname_suggestion or id_info.get('name') or verified_email.split('@')[0]
            suggested_nickname_vo = NickName(nickname_str)

            # 닉네임 중복 검사 (신규 사용자에 대해서만)
            if self.user_account_repository.find_by_nickname(suggested_nickname_vo):
                # 닉네임 자동 생성 로직 또는 사용자에게 다른 닉네임 요청
                # 여기서는 간단히 에러 발생
                raise ValueError(f"닉네임 '{suggested_nickname_vo.name}'은 이미 사용 중이거나 형식에 맞지 않습니다. 다른 닉네임을 사용해주세요.")
            
            # (선택) 이메일 중복 검사: 다른 소셜 계정이나 일반 가입으로 이미 사용 중인 이메일인지 확인
            existing_user_by_email = self.user_account_repository.find_by_email(email_vo)
            if existing_user_by_email:
                # 이미 해당 이메일로 가입된 사용자가 있지만, 현재 Google 계정과는 연결되지 않은 경우
                # -> 기존 계정에 현재 Google 소셜 링크를 추가하는 로직 필요
                # 여기서는 간단히 에러로 처리하거나, 해당 사용자에게 소셜 계정 연결을 유도할 수 있음
                raise ValueError(f"이메일 '{email_vo.address}'은 이미 다른 계정으로 사용 중입니다. 해당 계정에 Google 연결을 시도해주세요.")


            temp_account_id_for_new_user = 0 # 저장 시 실제 ID 할당됨
            user_account_domain = UserAccount(
                account_id=temp_account_id_for_new_user,
                email=email_vo,
                nickname=suggested_nickname_vo,
                social_links=[social_link_vo], # 초기 소셜 링크
                created_at=current_time,
                last_login_at=current_time,
                # is_active=True 등 UserAccount 도메인 객체에 필요한 초기값 설정
            )
            # (선택) Users 모델에 profile_picture_url 필드가 있고, UserAccount 도메인 객체도 이를 관리한다면
            # profile_picture_url_from_google 값을 UserAccount에 설정

        # 3. 저장 (UserAccountRepository의 save 메소드가 Users 모델과 UserSocialAccounts 모델을 함께 처리해야 함)
        saved_user_account_domain = self.user_account_repository.save(user_account_domain)

        # 4. Django User 모델 인스턴스 가져오기 (토큰 발급용)
        try:
            # UserAccountRepository.save()가 반환하는 domain 객체의 account_id는 Django Users 모델의 id와 일치해야 함
            user_model_instance = Users.objects.get(id=saved_user_account_domain.account_id)
        except Users.DoesNotExist:
            # 로깅 추가 권장
            raise Exception("계정 저장 후 Django 사용자 모델을 찾을 수 없습니다. (ID 불일치 가능성)")

        # 5. JWT 토큰 발급
        tokens = self.token_service.create_token_for_user(user_model_instance) # TokenService 사용
        access_token = tokens['access']
        refresh_token = tokens['refresh']

        # 6. 응답 DTO 생성
        user_dto = self._map_domain_to_dto(saved_user_account_domain)
        return AuthResponseDto(access_token=access_token, refresh_token=refresh_token, user=user_dto, is_new_user=is_new_user)

    # (logout_user 메소드는 이전과 거의 동일하게 사용 가능)
    def logout_user(self, request_dto): # request_dto 타입 명시 (예: LogoutRequestDto)
        try:
            refresh_token_str = request_dto.refresh_token
            # self.token_service.blacklist_token(refresh_token_str) # TokenService에 위임 가능
            token = RefreshToken(refresh_token_str)
            token.blacklist()
        except TokenError as e:
            # 이미 블랙리스트에 있거나 유효하지 않은 토큰일 수 있음. 로그만 남기고 성공 처리도 가능.
            # 로깅 추가 권장
            pass # 또는 raise ValueError(f"Refresh 토큰 처리 오류: {str(e)}")
        except Exception as e:
            # 로깅 추가 권장
            raise Exception(f"로그아웃 처리 중 예기치 않은 오류 발생: {str(e)}")


# (UserProfileAppService 와 UserAccountDeactivationAppService 는 이전 코드 유지)
class UserProfileAppService:
    def __init__(self, user_account_repository: UserAccountRepository):
        self.user_account_repository = user_account_repository

    def _map_domain_to_dto(self, user_account: UserAccount) -> UserAccountDto:
        social_links_dto = [
            UserSocialLinkDto(provider_name=social_link.provider_name, social_id=social_link.social_id)
            for social_link in user_account.social_links
        ]
        return UserAccountDto(
            account_id=user_account.account_id,
            email=user_account.email.address,
            nickname=user_account.nickname.name,
            social_links=social_links_dto,
            created_at=user_account.created_at,
            last_login_at=user_account.last_login_at
        )

    def get_user_profile(self, account_id: int) -> Optional[UserAccountDto]:
        user_account_domain = self.user_account_repository.find_by_id(account_id)
        if not user_account_domain:
            return None
        return self._map_domain_to_dto(user_account_domain)

    def update_user_nickname(self, account_id: int, request_dto: UpdateNicknameRequestDto) -> UserAccountDto:
        user_account_domain = self.user_account_repository.find_by_id(account_id)
        if not user_account_domain:
            raise ValueError("사용자를 찾을 수 없습니다.")

        new_nickname_vo = NickName(request_dto.nickname)

        def nickname_uniqueness_checker(nickname_to_check: NickName, current_account_id: int):
            existing_user = self.user_account_repository.find_by_nickname(nickname_to_check)
            return not (existing_user and existing_user.account_id != current_account_id)

        user_account_domain.update_nickname(new_nickname_vo, nickname_uniqueness_checker)

        updated_user_account_domain = self.user_account_repository.save(user_account_domain)
        return self._map_domain_to_dto(updated_user_account_domain)


class UserAccountDeactivationAppService:
    def __init__(self, user_account_repository: UserAccountRepository):
        self.user_account_repository = user_account_repository

    def deactivate_account(self, account_id: int) -> None:
        # UserAccountRepository.delete()가 실제로는 is_active=False로 처리하거나
        # 관련 데이터를 익명화하는 등의 로직을 수행해야 할 수 있음
        self.user_account_repository.delete(account_id)