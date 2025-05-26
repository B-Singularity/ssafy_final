<template>
  <div class="movie-carousel-wrapper">
    <template v-if="movies && movies.length > 0">
      <div class="carousel-track">
        <MovieCard
          v-for="movie in movies"
          :key="movie.id"
          :movie="movie"
          class="carousel-item"
        />
      </div>
    </template>
    <div v-else class="no-movies-message">
      <p>{{ noMoviesMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import MovieCard from '@/components/movie/MovieCard.vue'; // MovieCard 컴포넌트 임포트

const props = defineProps({
  movies: {
    type: Array,
    default: () => []
  },
  noMoviesMessage: { // 영화가 없을 때 표시할 메시지 (커스터마이징 가능)
    type: String,
    default: '추천 영화가 없습니다.'
  }
});
</script>

<style scoped>
.movie-carousel-wrapper {
  /* 캐러셀 전체 컨테이너 */
  overflow: hidden; /* 내부 트랙의 넘치는 부분을 숨김 (선택적) */
  position: relative; /* 내부 네비게이션 버튼 등을 위한 기준점 (필요시) */
  padding: 0.5rem 0; /* 위아래 약간의 여백 */
  margin-bottom: 20px;
  /* border: 1px dashed #333; */ /* 기존 테두리 제거 또는 유지 */
  /* min-height는 내부 MovieCard 높이에 따라 자연스럽게 결정되도록 제거 */
}

.carousel-track {
  /* 영화 카드들이 실제로 나열되고 스크롤되는 영역 */
  display: flex;
  overflow-x: auto; /* 핵심: 가로 스크롤 가능하게 */
  overflow-y: hidden; /* 세로 스크롤은 필요 없음 */
  padding: 0.5rem 0.5rem 1rem 0.5rem; /* 트랙 내부 여백 (마지막 아이템 오른쪽, 스크롤바 공간 등) */
  gap: 1.5rem; /* MovieCard 아이템들 사이의 간격 */

  /* 스크롤 스냅 (부드러운 넘김 효과 - 브라우저 지원 확인 필요) */
  scroll-snap-type: x mandatory; /* 가로 방향으로 스크롤 스냅 */
  -webkit-overflow-scrolling: touch; /* iOS에서 부드러운 스크롤링 */
}

.carousel-item {
  /* 각 영화 카드 아이템 */
  flex: 0 0 auto; /* 아이템들이 원래 크기를 유지하며 줄어들거나 늘어나지 않도록 */
  scroll-snap-align: start; /* 스크롤 시 아이템의 시작 부분에 스냅 */
  width: 230px; /* 캐러셀 내 MovieCard의 너비 고정. MovieCard 자체의 max-width와 조율 */
}

/* 반응형: 모바일에서 캐러셀 아이템 너비 조정 */
@media (max-width: 768px) {
  .carousel-item {
    width: 180px;
  }
  .carousel-track {
    gap: 1rem;
  }
}


.no-movies-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* 기존 min-height 유지 */
  color: #b0b0b0;
  font-style: italic;
  text-align: center;
  border-radius: 8px; /* 기존 스타일 유지 */
  /* border: 1px dashed #333; */ /* 이미 wrapper에 적용되어 있다면 중복 */
}

/* 스크롤바 스타일링 (선택 사항) */
.carousel-track::-webkit-scrollbar {
  height: 8px;
}

.carousel-track::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.carousel-track::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.carousel-track::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>