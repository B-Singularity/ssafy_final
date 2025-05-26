<template>
  <div class="google-login-container">
    <GoogleLogin :callback="handleGoogleLogin" prompt auto-select />
    <p v-if="loginStatus" :class="{ 'success': loggedIn, 'error': !loggedIn }">
      {{ loginStatus }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth'; // auth 스토어 임포트
// import { decodeCredential } from 'vue3-google-login'; // 직접 디코딩 불필요

const authStore = useAuthStore();

const loginStatus = ref('');
const loggedIn = ref(authStore.isLoggedIn); // 스토어의 isLoggedIn 상태와 동기화

const handleGoogleLogin = async (response) => {
  console.log("Google Login Response:", response);

  if (response.credential) {
    const idToken = response.credential;
    console.log("Google ID Token:", idToken);

    try {
      // Pinia 스토어의 Django 연동 로그인 액션 호출
      await authStore.loginWithDjango(idToken); // Django 백엔드로 ID 토큰 전송
      
      loginStatus.value = `환영합니다, ${authStore.userName}님!`; // 스토어에서 사용자 이름 가져오기
      loggedIn.value = true;
    } catch (error) {
      loginStatus.value = '백엔드 로그인 처리 중 오류가 발생했습니다.';
      loggedIn.value = false;
      console.error("Backend login failed:", error);
    }
  } else {
    loginStatus.value = 'Google 로그인 실패!';
    loggedIn.value = false;
    console.error("Google login failed:", response);
  }
};

// 스토어 상태 변경 감지하여 UI 업데이트 (선택 사항)
authStore.$subscribe((mutation, state) => {
  loggedIn.value = state.isLoggedIn;
  if (state.isLoggedIn && state.user) {
    loginStatus.value = `환영합니다, ${state.user.name}님!`;
  } else if (!state.isLoggedIn && loginStatus.value.startsWith('환영합니다')) {
    // 로그아웃 시 메시지 초기화 또는 변경
    loginStatus.value = '로그아웃되었습니다.';
  }
});
</script>

<style scoped>
.google-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.2);
}

.google-login-container >>> .g_id_signin {
  margin-bottom: 1rem;
}

p { /* loginStatus에 대한 스타일 일관성 유지 */
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.success {
  color: #4CAF50;
}

.error {
  color: #f44336;
}
</style>