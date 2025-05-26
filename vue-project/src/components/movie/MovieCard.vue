<template>
  <div class="movie-card" @click="navigateToDetail">
    <div class="poster-container">
      <img :src="movie.poster_path" :alt="movie.title || '영화 포스터'" class="movie-poster" />
      <button
        class="wishlist-btn"
        @click.stop="toggleWishlist"
        :class="{ 'wishlisted': isWishlistedComputed }"
        v-if="authStore.isLoggedIn"
      >
        <i :class="['fas', isWishlistedComputed ? 'fa-heart' : 'fa-regular fa-heart']"></i>
      </button>
      <div class="overlay">
        <h3 class="movie-title">{{ movie.title }}</h3>
        <button class="detail-btn" @click.stop="navigateToDetail">자세히 보기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  isWishlisted: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-wishlist']);

const authStore = useAuthStore();
const router = useRouter();

const isWishlistedComputed = computed(() => {
  if (!props.movie || typeof props.movie.id === 'undefined') {
    return false;
  }
  return authStore.isMovieInWishlist(props.movie.id);
});

const toggleWishlist = async () => {
  if (!authStore.isLoggedIn) {
    alert('찜하기 기능을 사용하려면 로그인해야 합니다.');
    return;
  }
  if (!props.movie || typeof props.movie.id === 'undefined') {
    console.error('찜하기 위한 영화 ID가 없습니다.');
    return;
  }
  if (isWishlistedComputed.value) {
    await authStore.removeMovieFromWishlist(props.movie.id);
  } else {
    await authStore.addMovieToWishlist(props.movie.id);
  }
  emit('toggle-wishlist', props.movie);
};

// 영화 상세 페이지로 이동하는 함수
const navigateToDetail = () => {
  if (props.movie && typeof props.movie.id !== 'undefined') {
    // 중요: 아래 'MovieDetail'과 'id'는 예시입니다.
    // 실제 Vue Router 설정에 맞게 라우트 이름과 파라미터 이름을 수정하세요.
    // 예: src/router/index.js 파일 확인
    router.push({ name: 'MovieDetail', params: { id: props.movie.id.toString() } });
    // 만약 파라미터가 숫자가 아닌 문자열이어야 한다면 .toString()을 추가하는 것이 안전합니다.
  } else {
    console.error('영화 상세 정보로 이동하기 위한 ID가 없습니다.');
  }
};
</script>

<style scoped>
.movie-card {
  width: 100%;
  max-width: 250px;
  background-color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  aspect-ratio: 2/3;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
}

.poster-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
  background-color: #2a2a2a;
}

.movie-card:hover .movie-poster {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  color: #fff;
  padding: 1.5rem 1rem 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 50%;
}

.movie-card:hover .overlay {
  transform: translateY(0);
}

.movie-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.detail-btn {
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.8rem;
  transition: background-color 0.3s ease;
}

.detail-btn:hover {
  background-color: #e05e5e;
}

.wishlist-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.wishlist-btn i {
  color: #fff;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.wishlist-btn.wishlisted i {
  color: #ff6b6b;
}

.wishlist-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.wishlist-btn:hover i {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .movie-card {
    max-width: 180px;
  }
  .movie-title {
    font-size: 1.1rem;
  }
  .detail-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
  .wishlist-btn {
    width: 35px;
    height: 35px;
  }
}
</style>