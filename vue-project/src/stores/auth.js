// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { googleLogout } from 'vue3-google-login';
import axios from 'axios'; // Axios 설치 필요: npm install axios

const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000'; // .env 파일에 VITE_DJANGO_API_URL 설정

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('userData')) || null);
  const token = ref(localStorage.getItem('userToken') || null); // Django 백엔드에서 발급한 토큰

  const isLoggedIn = computed(() => !!user.value && !!token.value);
  const userName = computed(() => user.value ? user.value.name : ''); // Django가 보내준 name
  const userEmail = computed(() => user.value ? user.value.email : ''); // Django가 보내준 email
  const appUserId = computed(() => user.value ? user.value.id : null); // Django의 User ID

  const wishlist = ref([]);

  // Axios 인스턴스 생성 (헤더에 토큰 자동 포함)
  const apiClient = axios.create({
    baseURL: DJANGO_API_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // 요청 인터셉터를 사용하여 토큰이 있을 때마다 헤더에 추가
  apiClient.interceptors.request.use(config => {
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`; // 또는 Django 설정에 따라 'Token ' + token.value
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });


  // Django 백엔드를 통한 로그인 처리 함수
  const loginWithDjango = async (googleIdToken) => {
    try {
      const response = await apiClient.post('/api/auth/google-login/', { // Django API 엔드포인트
        id_token: googleIdToken,
      });

      const backendData = response.data;
      user.value = backendData.user; // Django가 보내준 사용자 정보 (id, email, name 등 포함)
      token.value = backendData.token; // Django가 보내준 JWT 또는 세션 식별자

      localStorage.setItem('userData', JSON.stringify(user.value));
      localStorage.setItem('userToken', token.value);
      
      console.log("Logged in with Django:", user.value);
      await loadWishlist(); // 로그인 성공 후 찜 목록 로드
    } catch (error) {
      console.error("Error logging in with Django:", error.response?.data || error.message);
      await logout(); // 실패 시 확실히 로그아웃 처리
      throw error; // 컴포넌트에서 에러를 처리할 수 있도록 다시 throw
    }
  };

  const logout = async () => {
    googleLogout(); // Google 세션 로그아웃
    // Django 백엔드에 로그아웃 요청 (선택 사항, JWT는 클라이언트에서 토큰 제거로 충분할 수 있음)
    // await apiClient.post('/api/auth/logout/'); 
    user.value = null;
    token.value = null;
    wishlist.value = [];
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    console.log("User logged out.");
  };

  const loadWishlist = async () => {
    if (!isLoggedIn.value || !appUserId.value) return;
    console.log(`Loading wishlist for user: ${appUserId.value}`);
    try {
      const response = await apiClient.get(`/api/users/${appUserId.value}/wishlist/`);
      wishlist.value = response.data.map(item => item.movie_id); // 실제 데이터 구조에 맞게 조정
      console.log("Wishlist loaded:", wishlist.value);
    } catch (error) {
      console.error("Failed to load wishlist:", error.response?.data || error.message);
      wishlist.value = [];
    }
  };

  const addMovieToWishlist = async (movieId) => {
    if (!isLoggedIn.value || !appUserId.value) {
      console.warn("User not logged in. Cannot add to wishlist.");
      return false;
    }
    if (wishlist.value.includes(movieId)) return true;

    try {
      await apiClient.post(`/api/users/${appUserId.value}/wishlist/`, { movie_id: movieId });
      wishlist.value.push(movieId);
      console.log(`Movie ${movieId} added to wishlist.`);
      return true;
    } catch (error) {
      console.error("Failed to add movie to wishlist:", error.response?.data || error.message);
      return false;
    }
  };

  const removeMovieFromWishlist = async (movieId) => {
    if (!isLoggedIn.value || !appUserId.value) {
      console.warn("User not logged in. Cannot remove from wishlist.");
      return false;
    }
    const index = wishlist.value.indexOf(movieId);
    if (index === -1) return true;

    try {
      await apiClient.delete(`/api/users/${appUserId.value}/wishlist/${movieId}/`);
      wishlist.value.splice(index, 1);
      console.log(`Movie ${movieId} removed from wishlist.`);
      return true;
    } catch (error) {
      console.error("Failed to remove movie from wishlist:", error.response?.data || error.message);
      return false;
    }
  };

  // 앱 초기 로드 시 토큰 유효성 검사 및 사용자 정보 로드
  const checkAuth = async () => {
    if (token.value && user.value) { // 로컬 스토리지에 토큰과 사용자 정보가 있다면
      // 선택: 여기서 토큰 유효성 검사 API를 백엔드에 호출할 수 있음
      // 예: await apiClient.get('/api/auth/user/');
      // 유효하면 상태 유지, 아니면 로그아웃 처리
      console.log('Auth checked. User is considered logged in from local storage.');
      await loadWishlist();
    } else {
      // 토큰이나 사용자 정보가 없으면 로그아웃 상태로 간주
      user.value = null;
      token.value = null;
    }
  };

  const isMovieInWishlist = computed(() => (movieId) => wishlist.value.includes(movieId));

  return {
    user,
    token,
    isLoggedIn,
    userName,
    userEmail,
    appUserId,
    wishlist,
    loginWithDjango,
    logout,
    addMovieToWishlist,
    removeMovieFromWishlist,
    isMovieInWishlist,
    checkAuth,
    loadWishlist, // 외부에서 호출할 수 있도록
  };
});