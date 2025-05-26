<template>
  <div class="notification-settings-container">
    <AppHeader />
    <div class="content-wrapper">
      <h1 class="page-title">알림 설정</h1>

      <div class="settings-section">
        <h2 class="section-title">이메일 알림</h2>
        <div class="setting-item">
          <label for="email-notifications">신규 영화 추천 알림 받기</label>
          <input type="checkbox" id="email-notifications" v-model="emailNotificationsEnabled" @change="saveSettings">
        </div>
        <div class="setting-item">
          <label for="newsletter">뉴스레터 구독</label>
          <input type="checkbox" id="newsletter" v-model="newsletterEnabled" @change="saveSettings">
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">앱 푸시 알림 (추후 지원 예정)</h2>
        <div class="setting-item disabled">
          <label>새로운 업데이트 알림</label>
          <input type="checkbox" disabled>
          <span class="disabled-text"> (준비 중)</span>
        </div>
      </div>

      <div v-if="saveMessage" :class="['save-message', saveMessageType]">
        {{ saveMessage }}
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';

const authStore = useAuthStore();
const router = useRouter();

const emailNotificationsEnabled = ref(false);
const newsletterEnabled = ref(false);
const saveMessage = ref('');
const saveMessageType = ref(''); // 'success' or 'error'

// 로그인되지 않은 경우 로그인 페이지로 리다이렉트
if (!authStore.isLoggedIn) {
  router.replace('/login');
}

// 백엔드에서 사용자 알림 설정 로드 (초기 로드)
const loadSettings = async () => {
  if (!authStore.user?.appUserId) return;
  console.log("Loading notification settings...");
  // 실제 백엔드 API 호출: GET /api/users/{userId}/notification-settings
  // try {
  //   const response = await fetch(`/api/users/${authStore.user.appUserId}/notification-settings`);
  //   if (response.ok) {
  //     const data = await response.json();
  //     emailNotificationsEnabled.value = data.emailNotificationsEnabled;
  //     newsletterEnabled.value = data.newsletterEnabled;
  //     console.log("Settings loaded:", data);
  //   } else {
  //     console.error("Failed to load settings:", response.statusText);
  //   }
  // } catch (error) {
  //   console.error("Error loading settings:", error);
  // }

  // 임시 데이터 로드
  emailNotificationsEnabled.value = localStorage.getItem('emailNotificationsEnabled') === 'true';
  newsletterEnabled.value = localStorage.getItem('newsletterEnabled') === 'true';
};

// 알림 설정 저장 (백엔드 연동 필요)
const saveSettings = async () => {
  if (!authStore.user?.appUserId) return;
  console.log("Saving notification settings...");
  const settings = {
    emailNotificationsEnabled: emailNotificationsEnabled.value,
    newsletterEnabled: newsletterEnabled.value,
    userEmail: authStore.userEmail // 이메일 알림을 위해 사용자 이메일 전달
  };

  // 실제 백엔드 API 호출: PUT /api/users/{userId}/notification-settings
  // try {
  //   const response = await fetch(`/api/users/${authStore.user.appUserId}/notification-settings`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(settings)
  //   });
  //   if (response.ok) {
  //     saveMessage.value = '설정이 성공적으로 저장되었습니다!';
  //     saveMessageType.value = 'success';
  //     console.log("Settings saved:", settings);
  //   } else {
  //     saveMessage.value = '설정 저장에 실패했습니다.';
  //     saveMessageType.value = 'error';
  //     console.error("Failed to save settings:", response.statusText);
  //   }
  // } catch (error) {
  //   saveMessage.value = '설정 저장 중 오류가 발생했습니다.';
  //   saveMessageType.value = 'error';
  //   console.error("Error saving settings:", error);
  // }

  // 임시 처리: localStorage에 저장
  localStorage.setItem('emailNotificationsEnabled', emailNotificationsEnabled.value);
  localStorage.setItem('newsletterEnabled', newsletterEnabled.value);
  saveMessage.value = '설정이 성공적으로 저장되었습니다!';
  saveMessageType.value = 'success';

  setTimeout(() => {
    saveMessage.value = '';
  }, 3000); // 3초 후 메시지 사라짐
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.notification-settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
  padding-top: 6rem;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex-grow: 1;
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: rgba(20, 20, 20, 0.8);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.page-title {
  font-size: 2.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2.5rem;
  background: linear-gradient(135deg, #4ecdc4, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.settings-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(30, 30, 30, 0.6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 1.6rem;
  color: #fff;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  font-size: 1.1rem;
  color: #fff;
  cursor: pointer;
  flex-grow: 1;
}

.setting-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #4ecdc4; /* 체크박스 색상 */
  cursor: pointer;
}

.setting-item.disabled label,
.setting-item.disabled .disabled-text {
  color: #888;
  cursor: not-allowed;
}

.save-message {
  text-align: center;
  margin-top: 2rem;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
}

.save-message.success {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.save-message.error {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

@media (max-width: 768px) {
  .content-wrapper {
    margin: 1rem auto;
    padding: 1.5rem;
  }
  .page-title {
    font-size: 2rem;
  }
  .section-title {
    font-size: 1.4rem;
  }
  .setting-item label {
    font-size: 1rem;
  }
}
</style>