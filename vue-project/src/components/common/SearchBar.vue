<template>
  <div class="search-bar">
    <input
      type="text"
      v-model="searchTerm"
      @keyup.enter="performSearch"
      placeholder="영화 제목을 검색하세요..."
    />
    <button @click="performSearch">검색</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// import { defineEmits } from 'vue'; // 제거됨

const searchTerm = ref('');
const emit = defineEmits(['search']);

const performSearch = () => {
  if (searchTerm.value.trim()) {
    emit('search', searchTerm.value.trim());
  }
};
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-bar input {
  flex-grow: 1;
  padding: 12px 20px;
  border: 1px solid #333;
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-bar input::placeholder {
  color: #b0b0b0;
}

.search-bar input:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
}

.search-bar button {
  padding: 12px 25px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.search-bar button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}
</style>