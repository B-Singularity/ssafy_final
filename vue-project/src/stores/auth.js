// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { googleLogout } from 'vue3-google-login';
import axios from 'axios'; // axios가 설치되어 있어야 합니다.

// Django API 서버 주소 (Django 서버가 http://127.0.0.1:8000/ 에서 실행 중이라고 가정)
// .env 파일에 VITE_DJANGO_API_URL=http://127.0.0.1:8000 와 같이 설정하고 사용하는 것을 권장합니다.
const DJANGO_API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('userData')) || null);
  const token = ref(localStorage.getItem('userToken') || null); // Django 백엔드 발급 토큰

  const isLoggedIn = computed(() => !!user.value && !!token.value);
  const userName = computed(() => user.value ? user.value.name : '');
  const userEmail = computed(() => user.value ? user.value.email : '');
  const appUserId = computed(() => user.value ? user.value.id : null); // Django User 모델의 ID

  const wishlist = ref([]); // 찜 목록 (API 연동 필요)

  // Django 백엔드와 통신하는 로그인 함수
  // ⭐️ 세 번째 인자로 emailFromGoogle을 받도록 수정 ⭐️
  const loginWithDjango = async (googleIdToken, nicknameSuggestion = null, emailFromGoogle = null) => {
    try {
      console.log('Django 백엔드로 Google ID 토큰 전송 시도:', googleIdToken);
      console.log('Email from Google (to be sent):', emailFromGoogle);
      console.log('Nickname suggestion (to be sent):', nicknameSuggestion);

      const response = await axios.post(`${DJANGO_API_BASE_URL}/api/accounts/auth/login`, {
        provider: 'google', // 백엔드 SocialLoginRequestSerializer에서 받을 필드
        id_token: googleIdToken,
        email: emailFromGoogle, // ⭐️ 전달받은 emailFromGoogle 사용 ⭐️
        nickname_suggestion: nicknameSuggestion
      });

      console.log('Django 백엔드 응답:', response.data);

      const backendData = response.data;
      user.value = backendData.user;
      token.value = backendData.access_token; // Django가 보내준 Access Token

      localStorage.setItem('userData', JSON.stringify(user.value));
      localStorage.setItem('userToken', token.value);
      // Django가 refresh_token도 보내준다면 저장
      if (backendData.refresh_token) {
          localStorage.setItem('userRefreshToken', backendData.refresh_token);
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

      console.log("Django 백엔드를 통해 로그인 성공:", user.value);
      if (isLoggedIn.value) {
        loadWishlist(); // 로그인 성공 후 찜 목록 로드
      }
      return backendData; // 성공 응답 반환
    } catch (error) {
      console.error("Django 백엔드 로그인 처리 중 오류:", error.response?.data || error.message || error);
      await logout(); // 실패 시 로그아웃 처리
      throw error; // 오류를 상위로 전달하여 컴포넌트에서 인지할 수 있도록 함
    }
  };

  const logout = async () => {
    googleLogout();
    // (선택) Django 백엔드에 로그아웃 API 호출
    // const refreshToken = localStorage.getItem('userRefreshToken');
    // if (refreshToken) {
    //   try {
    //     await axios.post(`${DJANGO_API_BASE_URL}/api/accounts/auth/logout`, {
    //       refresh_token: refreshToken
    //     });
    //   } catch (e) {
    //     console.error("Django 로그아웃 API 호출 오류", e.response?.data || e.message);
    //   }
    // }

    user.value = null;
    token.value = null;
    wishlist.value = [];
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRefreshToken');
    delete axios.defaults.headers.common['Authorization'];
    console.log("User logged out.");
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('userData');
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      console.log('로그인 상태 복원됨:', user.value);
      loadWishlist();
    }
  };

  // 찜 목록 로드 (이 부분은 나중에 실제 API로 교체)
  const loadWishlist = async () => {
    if (!isLoggedIn.value || !appUserId.value) {
        console.log('찜 목록 로드 스킵: 로그인 안됨 또는 사용자 ID 없음');
        return;
    }
    console.log(`(임시) 찜 목록 로드 중 for user: ${appUserId.value}`);
    wishlist.value = [];
    if (user.value?.id === 'mock_user_id_123') { // 실제 사용자 ID로 비교하도록 수정 필요
        wishlist.value = ['tt0111161', 'tt0109830'];
    }
  };

  // 영화 찜하기 (백엔드 연동 필요)
  const addMovieToWishlist = async (movieId) => {
    if (!user.value) {
      console.warn("User not logged in. Cannot add to wishlist.");
      return false;
    }
    if (wishlist.value.includes(movieId)) {
      console.log(`Movie ${movieId} already in wishlist.`);
      return true;
    }
    console.log(`Adding movie ${movieId} to wishlist for user ${appUserId.value}`);
    wishlist.value.push(movieId);
    console.log(`(Mock) Movie ${movieId} added to wishlist.`);
    return true;
  };

  // 영화 찜 취소 (백엔드 연동 필요)
  const removeMovieFromWishlist = async (movieId) => {
    if (!user.value) {
      console.warn("User not logged in. Cannot remove from wishlist.");
      return false;
    }
    const index = wishlist.value.indexOf(movieId);
    if (index === -1) {
      console.log(`Movie ${movieId} not in wishlist.`);
      return true;
    }
    console.log(`Removing movie ${movieId} from wishlist for user ${appUserId.value}`);
    wishlist.value.splice(index, 1);
    console.log(`(Mock) Movie ${movieId} removed from wishlist.`);
    return true;
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
    checkAuth,
    addMovieToWishlist,
    removeMovieFromWishlist,
    isMovieInWishlist,
    loadWishlist,
  };
});