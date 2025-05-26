<template>
  <div class="page-container">
    <h1>404 - 페이지를 찾을 수 없습니다.</h1>
    <p>요청하신 페이지가 존재하지 않습니다.</p>
    <router-link to="/" class="home-link">홈으로 돌아가기</router-link>
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
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}
.page-container p {
  font-size: 1.2rem;
  color: #b0b0b0;
  margin-bottom: 2rem;
}
.home-link {
  background-color: #ff6b6b;
  color: #fff;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.home-link:hover {
  background-color: #e05e5e;
  transform: translateY(-2px);
}
</style>