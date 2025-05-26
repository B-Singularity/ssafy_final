<template>
  <div class="google-login-container">
    <GoogleLogin :callback="callback" prompt auto-select />
    <p v-if="loginStatus" :class="{ 'success': loggedIn, 'error': !loggedIn }">
      {{ loginStatus }}
    </p>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'; // watchEffect는 스토어 상태 변경을 UI에 반영하기 위해 사용
import { useAuthStore } from '@/stores/auth';
import { decodeCredential } from 'vue3-google-login';

const authStore = useAuthStore();

const loginStatus = ref('');
const loggedIn = ref(authStore.isLoggedIn); // 초기 loggedIn 상태를 스토어와 동기화

// 스토어의 로그인 상태 변경을 감지하여 loggedIn ref와 loginStatus 메시지를 업데이트
watchEffect(() => {
  loggedIn.value = authStore.isLoggedIn;
  if (authStore.isLoggedIn && authStore.user) {
    loginStatus.value = `환영합니다, ${authStore.userName}님!`;
  } else if (!authStore.isLoggedIn && loginStatus.value.startsWith('환영합니다')) {
    // 로그아웃되었거나 초기 상태일 때 메시지 변경 (필요에 따라)
    // loginStatus.value = '로그인이 필요합니다.';
  }
});

const callback = async (response) => { // async 키워드 추가
  console.log("Google Login Response:", response);

  if (response.credential) {
    const idToken = response.credential;
    console.log("Google ID Token:", idToken);

    const profile = decodeCredential(idToken); // 여기서 profile에 email, name 등이 들어있음
    console.log("Decoded Profile:", profile);

    try {
      // ⭐️ 수정된 부분: authStore.loginWithDjango 호출 시 profile.email도 전달
      await authStore.loginWithDjango(idToken, profile.name, profile.email); 

      // 성공 메시지는 watchEffect가 처리하거나, 여기서 직접 설정할 수도 있습니다.
      // loginStatus.value = `환영합니다, ${authStore.userName}님!`; 
      // loggedIn.value = true; // 이 값도 watchEffect가 authStore.isLoggedIn을 보고 업데이트
    } catch (error) {
      // 실패 시 메시지 (이미 스토어에서 로깅하고 있을 수 있음)
      loginStatus.value = '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
      // loggedIn.value = false; // watchEffect가 처리
      console.error("Login attempt failed in component callback:", error);
    }
  } else {
    loginStatus.value = 'Google 로그인에 실패했습니다 (no credential).';
    // loggedIn.value = false; // watchEffect가 처리
    console.error("Google login failed (no credential):", response);
  }
};
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

/* :deep()은 Vue 3에서 하위 컴포넌트의 스타일에 접근할 때 사용 */
:deep(.google-login-container .g_id_signin) {
  margin-bottom: 1rem;
}

p { /* loginStatus를 위한 p 태그 스타일 */
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