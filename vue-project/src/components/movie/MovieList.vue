<template>
  <div :class="['movie-list', { 'horizontal-scroll': horizontal }]">
    <p style="text-align: center; color: #b0b0b0;">영화 목록 영역 (아직 구현되지 않음)</p>
  </div>
</template>
<script setup>
// import { defineProps } from 'vue'; // 제거됨
const props = defineProps({
  movies: {
    type: Array,
    default: () => []
  },
  horizontal: {
    type: Boolean,
    default: false
  }
});
</script>
<style scoped>
.movie-list {
  /* 스타일 */
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #333;
  border-radius: 8px;
  margin-bottom: 20px;
}
.horizontal-scroll {
  overflow-x: auto;
  white-space: nowrap;
}
</style>