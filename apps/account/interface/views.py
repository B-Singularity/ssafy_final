from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    SocialLoginRequestSerializer,
    AuthResponseSerializer,
    UserAccountResponseSerializer,
    UpdateNicknameRequestSerializer
)

from apps.account.application.dtos import SocialLoginRequestDto, UpdateNicknameRequestDto
from apps.account.application.services import (
    UserAuthAppService, 
    UserProfileAppService, 
    UserAccountDeactivationAppService
)

from apps.account.infrastructure.repositories import DjangoUserAccountRepository

class SocialLoginAPIView(APIView):
    def post(self, request):
        serializer = SocialLoginRequestSerializer(data=request.data)
        if serializer.is_valid():
            request_dto = SocialLoginRequestDto(
                provider="google",
                id_token=serializer.validated_data['id_token'],
                email=serializer.validated_data['email'],
                nickname_suggestion=serializer.validated_data.get('nickname_suggestion')
            )

            repository = DjangoUserAccountRepository()
            service = UserAuthAppService(user_account_repository=repository)

            try:
                auth_response_dto = service.login_or_register_with_google(request_dto)
                response_serializer = AuthResponseSerializer(auth_response_dto)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            except ValueError as e: # 값 객체 생성 오류, 닉네임 중복 등
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": "인증 처리 중 오류가 발생했습니다."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_profile_service(self):
        repo = DjangoUserAccountRepository()
        return UserProfileAppService(user_account_repository=repo)

    def get(self, request):
        service = self.get_user_profile_service()
        account_id = request.user.id 
        
        profile_dto = service.get_user_profile(account_id)
        if profile_dto:
            serializer = UserAccountResponseSerializer(profile_dto)
            return Response(serializer.data)
        return Response({"error": "프로필을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        service = self.get_user_profile_service()
        account_id = request.user.id 

        serializer = UpdateNicknameRequestDto(data=request.data)
        if serializer.is_valid():
            request_dto = UpdateNicknameRequestDto(nickname=serializer.validated_data['nickname'])
            try:
                updated_profile_dto = service.update_user_nickname(account_id, request_dto)
                response_serializer = UserAccountResponseSerializer(updated_profile_dto)
                return Response(response_serializer.data)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                 return Response({"error": "프로필 업데이트 중 오류가 발생했습니다."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserDeactivationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_deactivation_service(self):
        repo = DjangoUserAccountRepository()
        return UserAccountDeactivationAppService(user_account_repository=repo)

    def delete(self, request):
        service = self.get_user_deactivation_service()
        account_id = request.user.id
        try:
            service.deactivate_account(account_id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": "회원 탈퇴 처리 중 오류가 발생했습니다."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)