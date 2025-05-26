<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="header-logo">MovieScope</router-link>
      <nav class="main-nav">
        <ul>
          <li><router-link to="/movies/recommended">추천</router-link></li>
          <li><router-link to="/movies/popular">인기</router-link></li>
          <li><router-link to="/movies/latest">최신</router-link></li>
        </ul>
      </nav>
    </div>
    <div class="header-right">
      <template v-if="authStore.isLoggedIn">
        <router-link to="/mypage" class="welcome-message-link">
          <span class="welcome-message">{{ authStore.userName }}님</span>
        </router-link>
        <button class="auth-btn" @click="handleLogout">로그아웃</button>
      </template>
      <template v-else>
        <router-link to="/login" class="auth-link">로그인</router-link>
      </template>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout(); // Pinia 스토어에서 사용자 정보 삭제 (Google 로그아웃 포함)
  router.push('/login'); // 로그아웃 후 로그인 페이지로 이동
};
</script>

<style scoped>
/* 기존 스타일 유지 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.4);
  color: #fff;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  backdrop-filter: blur(5px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header-logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
}

.main-nav a {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  color: #ff6b6b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message-link {
  text-decoration: none;
}

.welcome-message {
  font-size: 1rem;
  color: #4ecdc4;
  font-weight: 600;
  transition: color 0.3s ease;
}

.welcome-message-link:hover .welcome-message {
  color: #ff6b6b; /* 호버 시 색상 변경 */
}

.auth-btn {
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.auth-btn:hover {
  background-color: #e05e5e;
  transform: translateY(-2px);
}

.auth-link {
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: 1px solid transparent;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: #ff6b6b;
  border-color: #ff6b6b;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    padding: 1rem;
  }

  .header-left {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .main-nav ul {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
  }

  .header-right {
    margin-top: 1rem;
  }
}
</style>