<template>
  <div class="page-container">
    <h1>{{ $route.params.category }} 영화</h1>
    <p>이곳은 {{ $route.params.category }} 카테고리의 영화 목록 페이지입니다.</p>
  </div>
</template>
<script setup>
// 이 컴포넌트에 필요한 로직을 추가할 수 있습니다.
</script>
<style scoped>
.page-container {
  padding: 4rem 2rem;
  color: white;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.page-container h1 {
  font-size: 2.5rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}
.page-container p {
  font-size: 1.2rem;
  color: #b0b0b0;
}
</style>