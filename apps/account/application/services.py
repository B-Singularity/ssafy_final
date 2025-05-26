from typing import Optional

from django.utils import timezone

from apps.account.domain.repositories import UserAccountRepository
from apps.account.domain.aggregates.user_account import UserAccount
from apps.account.domain.value_objects.email import Email
from apps.account.domain.value_objects.nickname import NickName
from apps.account.domain.value_objects.social_link import SocialLink
from .dtos import UserAccountDto, UpdateNicknameRequestDto, UserSocialLinkDto, AuthResponseDto
from apps.account.infrastructure.token_services import TokenService
from apps.account.models import Users
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


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

    def login_or_register_with_google(self, request_dto):
        google_user_id_from_token = f"google_id_for_{request_dto.email}"

        social_link_vo = SocialLink(provider_name="google", social_id=google_user_id_from_token)
        email_vo = Email(request_dto.email)

        existing_account_domain = self.user_account_repository.find_by_social_link(social_link_vo)
        is_new_user = False
        user_account_domain: UserAccount

        current_time = timezone.now()

        if existing_account_domain:
            user_account_domain = existing_account_domain
            user_account_domain.record_login(current_time)
            if user_account_domain.email != email_vo:
                user_account_domain._email = email_vo
        else:
            is_new_user = True
            suggested_nickname_vo = NickName(request_dto.nickname_suggestion)

            if self.user_account_repository.find_by_nickname(suggested_nickname_vo):
                raise ValueError(f"닉네임 '{suggested_nickname_vo.name}'은 이미 사용 중입니다.")

            temp_account_id_for_new_user = 0
            user_account_domain = UserAccount(
                account_id=temp_account_id_for_new_user,
                email=email_vo,
                nickname=suggested_nickname_vo,
                social_links=[social_link_vo],
                created_at=current_time,
                last_login_at=current_time
            )

        saved_user_account_domain = self.user_account_repository.save(user_account_domain)

        try:
            user_model_instance = Users.objects.get(id=saved_user_account_domain.account_id)
        except Users.DoesNotExist:
            raise Exception("계정 저장 후 사용자 모델을 찾을 수 없습니다.")

        tokens = self.token_service.create_token_for_user(user_model_instance)
        access_token = tokens['access']
        refresh_token = tokens['refresh']

        user_dto = self._map_domain_to_dto(saved_user_account_domain)
        return AuthResponseDto(access_token=access_token, refresh_token=refresh_token, user=user_dto, is_new_user=is_new_user)

    def logout_user(self, request_dto):
        try:
            refresh_token = request_dto.refresh_token
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            pass
        except Exception as e:
            raise Exception(f"로그아웃 처리 중 예기치 않은 오류 발생: {str(e)}")


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
        self.user_account_repository.delete(account_id)