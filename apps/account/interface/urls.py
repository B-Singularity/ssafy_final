from django.urls import path
from .views import SocialLoginAPIView, UserProfileAPIView, UserDeactivationAPIView

urlpatterns = [
    path('auth/login', SocialLoginAPIView.as_view(), name='social_login_register'), # <--- 이 부분 확인!
    path('users/me/profile', UserProfileAPIView.as_view(), name='user_profile'),
    path('users/me', UserDeactivationAPIView.as_view(), name='user_deactivate'),
]