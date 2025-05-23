from rest_framework import serializers
from apps.account.application.dtos import UserSocialLinkDto, UserAccountDto


class SocialLoginRequestSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    nickname_suggestion = serializers.CharField(required=False, allow_blank=True, max_length=15, allow_null=True)

class UpdateNicknameRequestSerializer(serializers.Serializer):
    nickname = serializers.CharField(required=True, min_length=2, max_length=15)

class UserSocialLinkResponseSerializer(serializers.Serializer):
    provider_name = serializers.CharField()
    social_id = serializers.CharField()

class UserAccountResponseSerializer(serializers.Serializer):
    account_id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    nickname = serializers.CharField(read_only=True)
    social_links = UserSocialLinkResponseSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    last_login_at = serializers.DateTimeField(read_only=True, allow_null=True)

class AuthResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    user = UserAccountResponseSerializer()
    is_new_user = serializers.BooleanField()