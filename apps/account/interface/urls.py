from django.urls import path
from .views import SocialLoginAPIView, UserProfileAPIView, UserDeactivationAPIView, LogoutAPIView

urlpatterns = [
    path('auth/login', SocialLoginAPIView.as_view(), name='social_login_register'),
    path('auth/logout', LogoutAPIView.as_view(), name='user_logout'),
    path('users/me/profile', UserProfileAPIView.as_view(), name='user_profile'),
    path('users/me', UserDeactivationAPIView.as_view(), name='user_deactivate'),
]