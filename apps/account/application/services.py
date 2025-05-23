from typing import Optional
from datetime import datetime
# import uuid # UserAccount에서 사용되므로 해당 파일에 있어야 함

from django.utils import timezone # timezone 임포트 추가

from apps.account.domain.repositories import UserAccountRepository
# Email, Nickname, SocialLink, UserAccount는 실제 정의된 경로에서 임포트
from apps.account.domain.aggregates.user_account import UserAccount 
from apps.account.domain.value_objects.email import Email
from apps.account.domain.value_objects.nickname import NickName # 또는 NickName
from apps.account.domain.value_objects.socialLink import SocialLink # SocialLink 임포트 경로 확인
from .dtos import SocialLoginRequestDto, UserAccountDto, UpdateNicknameRequestDto, UserSocialLinkDto, AuthResponseDto


class UserAuthAppService:
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

    def login_or_register_with_google(self, request_dto: SocialLoginRequestDto):
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
        
        access_token = f"mock_access_token_for_id_{saved_user_account_domain.account_id}"
        
        user_dto = self._map_domain_to_dto(saved_user_account_domain)
        return AuthResponseDto(access_token=access_token, user=user_dto, is_new_user=is_new_user)

class UserProfileAppService:
    def __init__(self, user_account_repository):
        self.user_account_repository = user_account_repository

    def _map_domain_to_dto(self, user_account):
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

    def get_user_profile(self, account_id):
        user_account_domain = self.user_account_repository.find_by_id(account_id)
        if not user_account_domain:
            return None
        return self._map_domain_to_dto(user_account_domain)
    
    def update_user_nickname(self, account_id, request_dto):
        user_account_domain = self.user_account_repository.find_by_id(account_id)
        if not user_account_domain:
            raise ValueError("사용자를 찾을 수 없습니다.")

        new_nickname_vo = NickName(request_dto.nickname)

        def nickname_uniqueness_checker(nickname_to_check, current_account_id):
            existing_user = self.user_account_repository.find_by_nickname(nickname_to_check)
            return not (existing_user and existing_user.account_id != current_account_id)
    
        user_account_domain.update_nickname(new_nickname_vo, nickname_uniqueness_checker)

        updated_user_account_domain = self.user_account_repository.save(user_account_domain)
        return self._map_domain_to_dto(updated_user_account_domain)
    
class UserAccountDeactivationAppService:
    def __init__(self, user_account_repository):
        self.user_account_repository = user_account_repository
    
    def deactivate_account(self, account_id):
        self.user_account_repository.delete(account_id)


