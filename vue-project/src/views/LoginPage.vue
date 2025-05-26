<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="login-title">로그인</h1>
      <p class="login-subtitle">소셜 계정으로 간편하게 로그인하세요.</p>

      <div class="social-login-section">
        <h2 class="social-login-title">소셜 계정 연동</h2>
        <GoogleLoginButton />
        </div>

      <div class="login-info">
        <p v-if="authStore.isLoggedIn">
          이미 로그인되어 있습니다: <span class="welcome-name">{{ authStore.userName }}</span>님!
        </p>
        <p v-else-if="loginError" class="error-message">
          {{ loginError }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import GoogleLoginButton from '@/components/common/GoogleLoginButton.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'; // 라우터 사용

const authStore = useAuthStore();
const router = useRouter();
const loginError = ref('');

// 로그인 상태 변경 감지하여 홈으로 리다이렉트
watch(() => authStore.isLoggedIn, (newVal) => {
  if (newVal) {
    router.push('/'); // 로그인 성공 시 홈으로 리다이렉트
  }
});

// GoogleLoginButton의 callback에서 에러 발생 시 여기서 처리할 수도 있습니다.
// 현재는 GoogleLoginButton 내부에서 상태를 관리합니다.
// 만약 로그인 실패 시 LoginPage에서 특정 메시지를 보여주고 싶다면
// GoogleLoginButton에서 이벤트를 emit하고 여기서 listen하면 됩니다.
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
  padding: 2rem;
}

.login-container {
  background-color: rgba(20, 20, 20, 0.9);
  padding: 3rem 4rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subtitle {
  font-size: 1.1rem;
  color: #b0b0b0;
  margin-bottom: 2.5rem;
}

.social-login-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.social-login-title {
  font-size: 1.4rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

/* GoogleLoginButton은 자체 스타일을 가집니다. */
/* 추가적인 소셜 로그인 버튼 스타일 (예시) */
.social-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.8rem 1.5rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.social-login-btn.kakao {
  background-color: #FEE500;
  color: #3C1E1E;
}

.social-login-btn.kakao:hover {
  background-color: #e6d300;
  transform: translateY(-2px);
}

.social-login-btn.naver {
  background-color: #03C75A;
  color: #fff;
}

.social-login-btn.naver:hover {
  background-color: #02a04a;
  transform: translateY(-2px);
}

.login-info {
  margin-top: 2.5rem;
  font-size: 0.95rem;
  color: #b0b0b0;
}

.welcome-name {
  color: #4ecdc4;
  font-weight: bold;
}

.error-message {
  color: #ff6b6b;
  font-weight: bold;
}

@media (max-width: 600px) {
  .login-container {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 2rem;
  }
}
</style>