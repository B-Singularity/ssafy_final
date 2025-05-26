<template>
  <div class="movie-genre-filter">
    <button
      class="genre-btn"
      :class="{ 'active': activeGenreId === null }"
      @click="selectGenre(null)"
    >
      전체
    </button>
    <button
      v-for="genre in genres"
      :key="genre.id"
      class="genre-btn"
      :class="{ 'active': activeGenreId === genre.id }"
      @click="selectGenre(genre.id)"
    >
      {{ genre.name }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  genres: {
    type: Array,
    default: () => [] // { id: number, name: string } 형태의 배열
  }
});

const emit = defineEmits(['genre-selected']);

// 현재 선택된 장르 ID를 로컬 상태로 관리 (스타일링 목적)
const activeGenreId = ref(null); // 초기값은 '전체' (null)

const selectGenre = (genreId) => {
  activeGenreId.value = genreId; // 로컬 선택 상태 업데이트
  emit('genre-selected', genreId); // 부모 컴포넌트로 선택된 장르 ID 전달
};
</script>

<style scoped>
.movie-genre-filter {
  display: flex;
  flex-wrap: wrap; /* 여러 줄로 장르 버튼 나열 허용 */
  justify-content: center; /* 가운데 정렬 */
  gap: 0.75rem; /* 버튼 사이 간격 */
  padding: 1rem 0;
  margin-bottom: 20px;
  border-radius: 8px;
  /* border: 1px dashed #333; */ /* 기존 테두리 제거 또는 유지 선택 */
}

.genre-btn {
  background-color: #333; /* 기본 버튼 배경색 */
  color: #e0e0e0; /* 기본 버튼 글자색 */
  border: 1px solid #444; /* 버튼 테두리 */
  padding: 0.6rem 1.2rem; /* 버튼 내부 여백 */
  border-radius: 20px; /* 둥근 모서리 */
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  white-space: nowrap; /* 버튼 내 텍스트 줄바꿈 방지 */
}

.genre-btn:hover {
  background-color: #4ecdc4; /* 호버 시 배경색 */
  color: #1a1a1a; /* 호버 시 글자색 */
  border-color: #4ecdc4;
  transform: translateY(-2px); /* 살짝 위로 이동 */
}

.genre-btn.active {
  background-color: #ff6b6b; /* 활성(선택된) 버튼 배경색 */
  color: #ffffff; /* 활성 버튼 글자색 */
  border-color: #ff6b6b;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5); /* 활성 버튼 그림자 효과 */
}
</style>