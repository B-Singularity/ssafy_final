// src/stores/movie.js (가정, 기존 스토어에 찜 관련 정보 가져오기)
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// import { useAuthStore } from './auth'; // 필요한 경우 인증 스토어 임포트

export const useMovieStore = defineStore('movie', () => {
  const recommendedMovies = ref([]);
  const domesticPopularMovies = ref([]);
  const internationalPopularMovies = ref([]);
  const latestMovies = ref([]);
  const allMovies = ref([]); // 모든 영화를 담는 배열 (필터링 및 찜 목록 표시용)

  // Mock Data (실제 API 호출로 대체되어야 합니다)
  const mockMovies = [
    { id: 'tt0111161', title: '쇼생크 탈출', poster_image: 'https://image.tmdb.org/t/p/w500/kX0V6h6qf42w971F2h4G66K040L.jpg' },
    { id: 'tt0109830', title: '포레스트 검프', poster_image: 'https://image.tmdb.org/t/p/w500/sa2c7m0n9l6u0GZg1YgW0t5sX0.jpg' },
    { id: 'tt0068646', title: '대부', poster_image: 'https://image.tmdb.org/t/p/w500/k22kC3QZ95Q4b5a3J9c91uK10Q0.jpg' },
    { id: 'tt0468569', title: '다크 나이트', poster_image: 'https://image.tmdb.org/t/p/w500/1hQe8q5QZ498k0QzG3k520x46t7.jpg' },
    { id: 'tt0167260', title: '반지의 제왕: 왕의 귀환', poster_image: 'https://image.tmdb.org/t/p/w500/rC0E8S1vG5Vqf5g4R2n4G5s0qg4.jpg' },
    { id: 'tt0137523', title: '파이트 클럽', poster_image: 'https://image.tmdb.org/t/p/w500/rJjMhF7FvHwV2B1q5Q8hX7b3s0l.jpg' },
    { id: 'tt0120737', title: '반지의 제왕: 반지 원정대', poster_image: 'https://image.tmdb.org/t/p/w500/6y5K0zB7FpCj06oY3Z4L1aM20B7.jpg' },
    { id: 'tt0071562', title: '대부 2', poster_image: 'https://image.tmdb.org/t/p/w500/oJt1W3cR7W7mNl9jS3R4b9aN0G0.jpg' },
    { id: 'tt0110912', title: '펄프 픽션', poster_image: 'https://image.tmdb.org/t/p/w500/d5jQnLw7xX7Q2c8C4J6J1Z1q1F1.jpg' },
    { id: 'tt0133093', title: '매트릭스', poster_image: 'https://image.tmdb.org/t/p/w500/f89y1W8j7B5V5M2q9Y4G8j1g3s8.jpg' },
    { id: 'tt0099685', title: '좋은 친구들', poster_image: 'https://image.tmdb.org/t/p/w500/j52oJ3B8Rj7L0c1j1S5j5K5J1K1.jpg' },
    { id: 'tt0110357', title: '레옹', poster_image: 'https://image.tmdb.org/t/p/w500/e9X4Q05zGg0wzF9B0Q0j4S2S0g0.jpg' },
  ];


  const fetchRecommendedMovies = async () => {
    // 실제 API 호출: /api/movies/recommended
    // recommendedMovies.value = await fetch(...)
    recommendedMovies.value = mockMovies.slice(0, 5); // 임시 데이터
  };

  const fetchPopularMovies = async () => {
    // 실제 API 호출: /api/movies/popular/domestic, /api/movies/popular/international
    // domesticPopularMovies.value = await fetch(...)
    // internationalPopularMovies.value = await fetch(...)
    domesticPopularMovies.value = mockMovies.slice(5, 8); // 임시 데이터
    internationalPopularMovies.value = mockMovies.slice(8, 11); // 임시 데이터
    allMovies.value = [...mockMovies]; // 모든 영화를 초기화
  };

  const fetchLatestMovies = async () => {
    // 실제 API 호출: /api/movies/latest
    // latestMovies.value = await fetch(...)
    latestMovies.value = mockMovies.slice(0, 4); // 임시 데이터
  };

  const getMoviesByGenre = (genre) => {
    // 실제 API 호출: /api/movies?genre={genre}
    // 여기서는 mockMovies에서 필터링
    console.log(`Filtering by genre: ${genre}`);
    // 실제로는 장르 데이터가 영화 객체에 포함되어 있어야 합니다.
    // 임시로, 모든 영화를 반환합니다.
    return allMovies.value.slice(0, 6);
  };

  const getWishlistMovies = computed(() => (wishlistMovieIds) => {
    // authStore의 wishlist에 있는 영화 ID들을 기반으로 영화 객체를 찾아 반환합니다.
    // 실제 백엔드에서는 찜 목록 조회 시 영화 정보까지 함께 반환해주는 API가 있다면 더 효율적입니다.
    return allMovies.value.filter(movie => wishlistMovieIds.includes(movie.id));
  });

  return {
    recommendedMovies,
    domesticPopularMovies,
    internationalPopularMovies,
    latestMovies,
    allMovies, // 찜 목록과 장르 필터링을 위해 노출
    fetchRecommendedMovies,
    fetchPopularMovies,
    fetchLatestMovies,
    getMoviesByGenre,
    getWishlistMovies // 찜 목록에 있는 영화 객체 가져오기
  };
});