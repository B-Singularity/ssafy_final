<template>
  <div id="app">
    <router-view></router-view> </div>
</template>

<script setup>
// App.vue에서는 일반적으로 최상위 레이아웃을 관리합니다.
// import AppHeader from '@/components/common/AppHeader.vue'; // 필요시 여기에 배치할 수도 있지만,
// import AppFooter from '@/components/common/AppFooter.vue'; // 각 뷰에서 관리하는 것이 일반적입니다.
</script>

<style>
/* 전역 스타일 */
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  /* 여기에 프로젝트 전체의 기본 글꼴, 배경색 등을 정의할 수 있습니다. */
  background-color: #0a0a0a; /* 기본 배경색 */
  color: #ffffff; /* 기본 글자색 */
}

#app {
  /* 앱 전체의 컨테이너 스타일 */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>