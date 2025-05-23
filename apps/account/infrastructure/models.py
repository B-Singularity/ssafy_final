import uuid
from django.db import models

class Users(models.Model):
    id = models.AutoField(primary_key=True)
    email_address = models.EmailField(unique=True, max_length=254)
    nickname = models.CharField(max_length=100, unique=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"
        verbose_name =  "사용자"
        verbose_name_plural = "사용자 목록"
    
    def __str__(self):
        return self.nickname
    
class UserSocialAccounts(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name="social_accounts")
    PROVIDER_CHOICES = [
        ('google', 'Google'),
    ]
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    provider_account_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_social_account"
        unique_together = (('user', 'provider'), ('provider', 'provider_account_id'))
        verbose_name = "사용자 소셜 계정"
        verbose_name_plural = "사용자 소셜 계정 목록"

    def __str__(self):
        return f"{self.user.nickname} - {self.provider}"
    
    

