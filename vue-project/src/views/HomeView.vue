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

    <div v-if="movieStore.isLoading" class="loading-container">
      <p>영화를 불러오는 중입니다...</p>
      </div>
    <div v-if="movieStore.error" class="error-container">
      <p>오류가 발생했습니다: {{ movieStore.error }}</p>
    </div>

    <main class="main-content" v-if="!movieStore.isLoading && !movieStore.error">
      <section class="movie-section">
        <h2 class="section-title">오늘의 추천 영화</h2>
        <MovieCarousel :movies="movieStore.recommendedMovies" />
      </section>

      <section class="movie-section">
        <div class="section-header">
          <h2 class="section-title">국내 인기 영화</h2>
          <button class="see-more-btn" @click="navigateToCategory('domestic')">
            더보기 →
          </button>
        </div>
        <MovieList :movies="movieStore.domesticPopularMovies" :horizontal="true" />
      </section>

      <section class="movie-section">
        <div class="section-header">
          <h2 class="section-title">해외 인기 영화</h2>
          <button class="see-more-btn" @click="navigateToCategory('international')">
            더보기 →
          </button>
        </div>
        <MovieList :movies="movieStore.internationalPopularMovies" :horizontal="true" />
      </section>

      <section class="movie-section">
        <div class="section-header">
          <h2 class="section-title">최신 개봉작</h2>
          <button class="see-more-btn" @click="navigateToCategory('latest')">
            더보기 →
          </button>
        </div>
        <MovieList :movies="movieStore.latestMovies" :horizontal="true" />
      </section>

      <section class="movie-section">
        <h2 class="section-title">장르별 추천</h2>
        <MovieGenreFilter
          :genres="movieStore.movieGenres"
          @genre-selected="handleGenreFilter"
        />
        <MovieList :movies="movieStore.moviesByGenre" />
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'; // computed는 직접 사용하지 않으므로 제거
import { useRouter } from 'vue-router';
import { useMovieStore } from '@/stores/movie'; // 실제 스토어 임포트

import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import SearchBar from '@/components/common/SearchBar.vue';
import MovieCarousel from '@/components/movie/MovieCarousel.vue';
import MovieList from '@/components/movie/MovieList.vue';
import MovieGenreFilter from '@/components/movie/MovieGenreFilter.vue';

const router = useRouter();
const movieStore = useMovieStore(); // 실제 스토어 인스턴스 생성

// --- Methods ---
const handleSearch = (searchTerm) => {
  router.push({
    name: 'Search', // 라우트 이름 확인 필요
    query: { q: searchTerm },
  });
};

const navigateToCategory = (category) => {
  router.push({
    name: 'Category', // 라우트 이름 확인 필요
    params: { category },
  });
};

// MovieGenreFilter에서 선택된 장르 ID를 받아서 스토어 액션 호출
const handleGenreFilter = (genreId) => {
  // genreId가 유효한 경우에만 호출 (예: null이나 undefined가 아닐 때)
  if (genreId !== undefined) { // null도 유효한 값('전체' 선택)이므로 undefined만 체크
    movieStore.fetchMoviesByGenre(genreId);
  }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  // 데이터 로딩은 스토어 내부의 isLoading 상태로 관리됨
  try {
    // 여러 API 호출을 병렬로 실행
    await Promise.all([
      movieStore.fetchMovieGenres(), // 장르 목록 먼저 로드
      movieStore.fetchRecommendedMovies(),
      movieStore.fetchDomesticPopularMovies(),
      movieStore.fetchInternationalPopularMovies(),
      movieStore.fetchLatestMovies(),
    ]);
    // 초기 장르별 영화 목록: 사용자가 직접 장르를 선택하도록 moviesByGenre는 초기에 비워둠.
    // 또는, 특정 기본 장르를 로드하고 싶다면 여기서 호출 가능.
    // 예: if (movieStore.movieGenres.length > 0) {
    //      movieStore.fetchMoviesByGenre(movieStore.movieGenres[0].id);
    //    }
  } catch (error) {
    // 에러는 스토어에서 이미 처리하고 error 상태에 저장됨
    console.error('HomeView: Failed to fetch initial movie data:', error);
    // 필요한 경우 여기서 추가적인 UI 에러 처리를 할 수 있음
  }
});
</script>

<style scoped>
/* 기존 스타일 유지 */
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

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px; /* 로딩/에러 메시지 영역 확보 */
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
}
.error-container {
  color: #ff6b6b; /* 에러 메시지 색상 */
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

/* 스크롤바 스타일은 전역으로 빼거나 App.vue에 두는 것이 좋습니다. */
/* ::-webkit-scrollbar {
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
} */
</style>