<template>
  <div :class="['movie-list-container', { 'horizontal-scroll': horizontal }]">
    <template v-if="movies && movies.length > 0">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        :class="['movie-item', { 'horizontal-item': horizontal }]"
      />
    </template>
    <div v-else class="no-movies">
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
  horizontal: {
    type: Boolean,
    default: false
  },
  noMoviesMessage: { // 영화가 없을 때 표시할 메시지 (커스터마이징 가능)
    type: String,
    default: '표시할 영화가 없습니다.'
  }
});
</script>

<style scoped>
.movie-list-container {
  display: flex;
  gap: 1.5rem; /* 카드 사이의 간격 */
  padding: 0.5rem; /* 컨테이너 내부 여백 */
}

/* Horizontal Scrolling Mode */
.movie-list-container.horizontal-scroll {
  flex-direction: row; /* 가로 방향으로 아이템 나열 */
  overflow-x: auto; /* 가로 스크롤 활성화 */
  white-space: nowrap; /* 아이템들이 한 줄에 계속 이어지도록 */
  padding-bottom: 1rem; /* 스크롤바와 카드 사이의 여유 공간 */
}

.movie-item.horizontal-item {
  flex-shrink: 0; /* 가로 스크롤 시 아이템 크기 줄어들지 않도록 */
  width: 220px; /* 가로 스크롤 시 카드 너비 고정 (MovieCard의 max-width와 유사하게) */
  max-width: none; /* MovieCard 내부의 max-width를 무시하고 여기서 제어 */
}
/* 반응형: 모바일에서 가로 스크롤 시 카드 너비 조정 */
@media (max-width: 768px) {
  .movie-item.horizontal-item {
    width: 160px;
  }
}


/* Vertical Grid Mode (default) */
.movie-list-container:not(.horizontal-scroll) {
  flex-wrap: wrap; /* 아이템들이 여러 줄에 걸쳐 표시되도록 */
  justify-content: center; /* 아이템들을 중앙 또는 시작점 정렬 (flex-start도 가능) */
  /* 만약 그리드 레이아웃을 더 정교하게 제어하고 싶다면 display: grid 사용도 고려 */
  /* e.g., display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); */
}

.movie-item:not(.horizontal-item) {
  /* 세로 목록(그리드)일 때 MovieCard 자체의 max-width를 따르도록 함 */
  /* MovieCard.vue에서 정의된 max-width (250px 또는 180px)가 적용됨 */
}


.no-movies {
  width: 100%;
  text-align: center;
  color: #b0b0b0;
  padding: 2rem 0;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
}

/* 스크롤바 스타일 (선택 사항, 전체 앱에 일관되게 적용하는 것이 좋음) */
.movie-list-container.horizontal-scroll::-webkit-scrollbar {
  height: 8px;
}

.movie-list-container.horizontal-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.movie-list-container.horizontal-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.movie-list-container.horizontal-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>