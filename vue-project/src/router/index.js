// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginPage from '@/views/LoginPage.vue';
import MyPage from '@/views/MyPage.vue'; // 마이페이지 임포트
import WishlistView from '@/views/WishlistView.vue'; // 찜 목록 임포트
import NotificationSettings from '@/views/NotificationSettings.vue'; // 알림 설정 임포트

// 임시 페이지 컴포넌트들 (존재하지 않으면 오류가 나므로, 실제 파일을 생성해주세요)
import CategoryPage from '@/views/CategoryPage.vue';
import SearchPage from '@/views/SearchPage.vue';
import NotFoundPage from '@/views/NotFoundPage.vue';


const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage,
    meta: { requiresAuth: true } // 인증이 필요한 페이지로 설정
  },
  {
    path: '/mypage/wishlist',
    name: 'Wishlist',
    component: WishlistView,
    meta: { requiresAuth: true }
  },
  {
    path: '/mypage/notifications',
    name: 'NotificationSettings',
    component: NotificationSettings,
    meta: { requiresAuth: true }
  },
  // 카테고리 페이지
  {
    path: '/movies/:category',
    name: 'Category',
    component: CategoryPage // 동적 임포트 대신 직접 임포트해도 무방합니다.
  },
  // 검색 결과 페이지
  {
    path: '/search',
    name: 'Search',
    component: SearchPage
  },
  // 404 Not Found 페이지
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFoundPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Pinia 스토어 접근을 위한 추가 설정
// 주의: 이 방법은 Pinia 2.x와 Vue 3에서 router.beforeEach 내부에서 스토어에 접근하는 일반적인 방법입니다.
// main.js에서 createApp().use(pinia).use(router) 순서를 지키고,
// router.beforeEach 에서는 Pinia 인스턴스가 존재할 때만 스토어를 사용하도록 보장해야 합니다.
import { useAuthStore } from '@/stores/auth'; // auth 스토어 임포트

router.beforeEach((to, from, next) => {
  // Pinia 스토어는 앱이 마운트된 후에 초기화되므로,
  // 라우터 가드에서 스토어에 접근할 때는 항상 정의되어 있다고 가정합니다.
  // 실제 production 환경에서는 Pinia가 초기화되기 전에 라우트 가드가 실행될 수 있는
  // edge case를 고려해야 하지만, 개발 환경에서는 보통 문제가 되지 않습니다.
  const authStore = useAuthStore(); // 이제 오류 없이 호출 가능

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 인증이 필요하고 로그인되어 있지 않다면 로그인 페이지로 리다이렉트
    next('/login');
  } else if (to.name === 'Login' && authStore.isLoggedIn) {
    // 로그인 페이지로 접근하려는데 이미 로그인되어 있다면 홈으로 리다이렉트
    next('/');
  }
  else {
    // 그 외의 경우 정상적으로 진행
    next();
  }
});

export default router;