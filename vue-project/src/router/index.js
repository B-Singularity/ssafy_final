import path from 'node:path';
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
    name: 'Home', // 홈페이지 라우트 이름 (예시)
    component: () => import('../views/HomeView.vue') // HomeView.vue 파일 경로
  },
  {
    path: '/movie/:id', // URL 파라미터로 영화 ID(:id)를 받습니다.
    name: 'MovieDetail', // MovieCard.vue에서 router.push에 사용한 이름과 일치해야 합니다.
    component: () => import('../views/MovieDetailView.vue'), // 방금 만든 상세 페이지 컴포넌트
    // props: true // 이렇게 설정하면 URL 파라미터가 컴포넌트의 props로 전달됩니다.
                   // MovieDetailView.vue에서는 useRoute().params.id를 사용했으므로, 이 옵션은 현재 필수는 아닙니다.
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  }
  // 여기에 다른 페이지 라우트들이 있다면 추가합니다.
  // 예: { path: '/about', name: 'About', component: () => import('../views/AboutView.vue') },
];

const router = createRouter({
  // Vite 프로젝트의 경우 import.meta.env.BASE_URL 사용
  // Vue CLI 프로젝트의 경우 process.env.BASE_URL 사용
  history: createWebHistory(import.meta.env.BASE_URL),
  routes, // 위에서 정의한 routes 배열
  // 페이지 이동 시 스크롤 위치 맨 위로 (선택 사항)
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

export default router;