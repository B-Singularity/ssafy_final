<template>
  <div class="wishlist-container">
    <AppHeader />
    <div class="content-wrapper">
      <h1 class="page-title">나의 찜 목록</h1>

      <div v-if="isLoading" class="loading-message">찜 목록을 불러오는 중...</div>
      <div v-else-if="wishlistMovies.length === 0" class="empty-message">
        찜한 영화가 없습니다. 
        <router-link to="/" class="browse-link">지금 영화를 찾아보세요!</router-link>
      </div>
      <div v-else class="movie-grid">
        <MovieCard
          v-for="movie in wishlistMovies"
          :key="movie.id"
          :movie="movie"
          :is-wishlisted="true"
          @toggle-wishlist="handleToggleWishlist"
        />
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMovieStore } from '@/stores/movie'; // movie 스토어 임포트
import { useRouter } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import MovieCard from '@/components/movie/MovieCard.vue'; // 영화 카드 컴포넌트

const authStore = useAuthStore();
const movieStore = useMovieStore();
const router = useRouter();

const isLoading = ref(true);

// 로그인되지 않은 경우 로그인 페이지로 리다이렉트
if (!authStore.isLoggedIn) {
  router.replace('/login');
}

// 찜 목록에 있는 영화 ID들을 기반으로 실제 영화 객체를 가져옵니다.
const wishlistMovies = computed(() => {
  // authStore.wishlist는 영화 ID 배열
  return movieStore.getWishlistMovies(authStore.wishlist);
});

// 찜하기/찜 취소 토글 핸들러
const handleToggleWishlist = async (movie) => {
  if (authStore.isMovieInWishlist(movie.id)) {
    await authStore.removeMovieFromWishlist(movie.id);
  } else {
    // 찜 목록 페이지에서는 일반적으로 찜 취소만 발생하지만, 혹시 몰라서 추가
    await authStore.addMovieToWishlist(movie.id);
  }
};

onMounted(async () => {
  // 찜 목록이 로드될 때까지 기다림 (authStore.login()에서 로드될 것이므로)
  // 실제로는 여기서 찜 목록 데이터를 다시 로드하는 API를 호출할 수도 있습니다.
  if (authStore.isLoggedIn) {
    await authStore.loadWishlist(authStore.user.appUserId); // 찜 목록 새로고침
  }
  isLoading.value = false;
});
</script>

<style scoped>
.wishlist-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
  padding-top: 6rem;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex-grow: 1;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: rgba(20, 20, 20, 0.8);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.page-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  background: linear-gradient(135deg, #4ecdc4, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-message, .empty-message {
  font-size: 1.2rem;
  color: #b0b0b0;
  margin-top: 50px;
}

.browse-link {
  color: #ff6b6b;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.browse-link:hover {
  color: #e05e5e;
  text-decoration: underline;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .content-wrapper {
    margin: 1rem auto;
    padding: 1.5rem;
  }
  .page-title {
    font-size: 2rem;
  }
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>