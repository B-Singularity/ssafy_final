<template>
  <div class="mypage-container">
    <AppHeader />
    <div class="content-wrapper">
      <h1 class="page-title">{{ authStore.userName }}님의 마이페이지</h1>

      <div class="mypage-section profile-section">
        <h2 class="section-title">내 정보</h2>
        <div class="profile-info">
          <img :src="authStore.user?.picture" alt="프로필 사진" class="profile-picture" v-if="authStore.user?.picture">
          <p><strong>이름:</strong> {{ authStore.userName }}</p>
          <p><strong>이메일:</strong> {{ authStore.userEmail }}</p>
          </div>
      </div>

      <div class="mypage-section nav-section">
        <h2 class="section-title">바로가기</h2>
        <ul class="mypage-nav-list">
          <li>
            <router-link to="/mypage/wishlist" class="nav-item">
              <i class="fas fa-heart"></i>
              <span>찜 목록 ({{ authStore.wishlist.length }}개)</span>
              <i class="fas fa-chevron-right"></i>
            </router-link>
          </li>
          <li>
            <router-link to="/mypage/notifications" class="nav-item">
              <i class="fas fa-bell"></i>
              <span>알림 설정</span>
              <i class="fas fa-chevron-right"></i>
            </router-link>
          </li>
          <li>
            <a href="#" class="nav-item" @click.prevent="showNotYetAlert">
              <i class="fas fa-history"></i>
              <span>시청 기록 (준비 중)</span>
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </div>

      <div class="mypage-section action-section">
        <button class="logout-button" @click="handleLogout">로그아웃</button>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';

const authStore = useAuthStore();
const router = useRouter();

// 로그인되지 않은 경우 로그인 페이지로 리다이렉트
if (!authStore.isLoggedIn) {
  router.replace('/login');
}

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const showNotYetAlert = () => {
  alert("아직 준비 중인 기능입니다!");
};
</script>

<style scoped>
.mypage-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
  padding-top: 6rem; /* 헤더 높이 고려 */
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex-grow: 1; /* 푸터가 아래로 가도록 */
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

.mypage-section {
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

/* 프로필 섹션 */
.profile-section {
  text-align: center;
}

.profile-picture {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #4ecdc4;
}

.profile-info p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #b0b0b0;
}

.profile-info strong {
  color: #fff;
}

/* 네비게이션 섹션 */
.mypage-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  margin-bottom: 0.8rem;
  background-color: rgba(40, 40, 40, 0.7);
  border-radius: 8px;
  text-decoration: none;
  color: #ffffff;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(60, 60, 60, 0.8);
  transform: translateX(5px);
}

.nav-item i {
  color: #ff6b6b;
  margin-right: 1rem;
  font-size: 1.3rem;
}

.nav-item span {
  flex-grow: 1;
  text-align: left;
}

.nav-item .fas.fa-chevron-right {
  margin-left: 1rem;
  font-size: 0.9rem;
  color: #b0b0b0;
}

/* 액션 버튼 섹션 */
.action-section {
  text-align: center;
}

.logout-button {
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.logout-button:hover {
  background-color: #e05e5e;
  transform: translateY(-2px);
}

/* 반응형 */
@media (max-width: 768px) {
  .content-wrapper {
    margin: 1rem auto;
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.4rem;
  }

  .nav-item {
    font-size: 1rem;
    padding: 0.8rem 1rem;
  }

  .nav-item i {
    font-size: 1.1rem;
    margin-right: 0.8rem;
  }

  .logout-button {
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
  }
}
</style>