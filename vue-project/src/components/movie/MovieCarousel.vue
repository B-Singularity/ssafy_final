<template>
  <div class="movie-carousel">
    <p style="text-align: center; color: #b0b0b0;">추천 영화 캐러셀 영역 (아직 구현되지 않음)</p>
  </div>
</template>
<script setup>
// import { defineProps } from 'vue'; // 제거됨
const props = defineProps({
  movies: {
    type: Array,
    default: () => []
  }
});
</script>
<style scoped>
.movie-carousel {
  /* 스타일 */
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #333;
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>