<template>
  <div class="home-container">
    <AppHeader />

    <section class="hero-section">
      <div class="hero-content">
        <div class="logo-container">
          <h1 class="logo">MovieScope</h1>
          <p class="tagline">국내외 평점을 한눈에 비교하세요</p>
        </div>

        <SearchBar @search="handleSearch" />
        </div>

      <div class="hero-background"></div>
    </section>

    <main class="main-content">
      <section class="movie-section">
        <h2 class="section-title">오늘의 추천 영화</h2>
        <MovieCarousel :movies="recommendedMovies" />
      </section>

      <section class="movie-section">
        <div class="section-header">
          <h2 class="section-title">국내 인기 영화</h2>
          <button class="see-more-btn" @click="navigateToCategory('domestic')">
            더보기 →
          </button>
        </div>
        <MovieList :movies="domesticPopularMovies" :horizontal="true" />
      </section>

      <section class="movie-section">
        <div class="section-header">
          <h2 class="section-title">해외 인기 영화</h2>
          <button class="see-more-btn" @click="navigateToCategory('international')">
            더보기 →
          </button>
        </div>
        <MovieList :movies="internationalPopularMovies" :horizontal="true" />
      </section>

      <section class="movie-section">
        <div class="section-header">
          <h2 class="section-title">최신 개봉작</h2>
          <button class="see-more-btn" @click="navigateToCategory('latest')">
            더보기 →
          </button>
        </div>
        <MovieList :movies="latestMovies" :horizontal="true" />
      </section>

      <section class="movie-section">
        <h2 class="section-title">장르별 추천</h2>
        <MovieGenreFilter @genre-selected="handleGenreFilter" />
        <MovieList :movies="genreFilteredMovies" />
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'; // useRouter 임포트 (더미가 아닌 실제 라우터 사용)
// import { useMovieStore } from '@/stores/movies'

// 임시 라우터 및 스토어 (실제 구현 전까지 사용)
// 이제 useRouter를 사용하므로 이 부분은 필요없습니다.
// 하지만 다른 store mock은 유지합니다.
const useMovieStore = () => ({
  recommendedMovies: ref([]),
  domesticPopularMovies: ref([]),
  internationalPopularMovies: ref([]),
  latestMovies: ref([]),
  allMovies: ref([]),
  getMoviesByGenre: (genre) => [],
  fetchRecommendedMovies: () => { console.log('fetchRecommendedMovies called (stub)'); return Promise.resolve(); },
  fetchPopularMovies: () => { console.log('fetchPopularMovies called (stub)'); return Promise.resolve(); },
  fetchLatestMovies: () => { console.log('fetchLatestMovies called (stub)'); return Promise.resolve(); },
});

const movieStore = useMovieStore();
const router = useRouter(); // 실제 useRouter 사용

import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import SearchBar from '@/components/common/SearchBar.vue'
// import GoogleLoginButton from '@/components/common/GoogleLoginButton.vue' // 제거
import MovieCarousel from '@/components/movie/MovieCarousel.vue'
import MovieList from '@/components/movie/MovieList.vue'
import MovieGenreFilter from '@/components/movie/MovieGenreFilter.vue'

// 반응형 데이터
const selectedGenre = ref('')
const isLoading = ref(true)

// 컴퓨티드
const recommendedMovies = computed(() => movieStore.recommendedMovies)
const domesticPopularMovies = computed(() => movieStore.domesticPopularMovies)
const internationalPopularMovies = computed(() => movieStore.internationalPopularMovies)
const latestMovies = computed(() => movieStore.latestMovies)
const genreFilteredMovies = computed(() => {
  if (!selectedGenre.value) return movieStore.allMovies.value.slice(0, 8) 
  return movieStore.getMoviesByGenre(selectedGenre.value)
})

// 메서드
const handleSearch = (searchTerm) => {
  router.push({
    name: 'Search',
    query: { q: searchTerm }
  })
}

const navigateToCategory = (category) => {
  router.push({
    name: 'Category',
    params: { category }
  })
}

const handleGenreFilter = (genre) => {
  selectedGenre.value = genre
}

// 생명주기
onMounted(async () => {
  try {
    await Promise.all([
      movieStore.fetchRecommendedMovies(),
      movieStore.fetchPopularMovies(),
      movieStore.fetchLatestMovies()
    ])
  } catch (error) {
    console.error('Failed to fetch movie data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* 이전 스타일 유지 */
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
}

.hero-section {
  position: relative;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding-top: 5rem; /* 헤더 공간 확보 */
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 0, 100, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(0, 100, 255, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  z-index: -1;
}

.hero-content {
  text-align: center;
  z-index: 2;
  max-width: 800px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  margin-bottom: 3rem;
}

.logo {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(255, 107, 107, 0.3);
}

.tagline {
  font-size: 1.25rem;
  color: #b0b0b0;
  font-weight: 300;
  margin-bottom: 2rem;
}

.main-content {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 6rem; /* 헤더와 겹치지 않도록 조정 */
}

.movie-section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  border-radius: 2px;
}

.see-more-btn {
  background: none;
  border: 1px solid #333;
  color: #b0b0b0;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.see-more-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .logo {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 1rem;
  }

  .main-content {
    padding: 2rem 1rem;
    padding-top: 7rem; /* 헤더 높이 고려 */
  }

  .section-title {
    font-size: 1.4rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>