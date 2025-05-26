import path from 'node:path';
import { createRouter, createWebHistory } from 'vue-router';

// 페이지 컴포넌트들은 보통 동적 임포트(dynamic import)를 사용하여 코드 스플리팅을 합니다.
// 이렇게 하면 해당 페이지에 처음 접근할 때만 코드를 불러옵니다.

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