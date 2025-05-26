<template>
  <div class="movie-genre-filter">
    <p style="text-align: center; color: #b0b0b0;">장르 필터 영역 (아직 구현되지 않음)</p>
  </div>
</template>
<script setup>
// import { defineEmits } from 'vue'; // 제거됨
const emit = defineEmits(['genre-selected']);
// 예시: 장르 선택 시 emit('genre-selected', '액션');
</script>
<style scoped>
.movie-genre-filter {
  /* 스타일 */
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #333;
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>