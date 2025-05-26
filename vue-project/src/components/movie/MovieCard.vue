<template>
  <div class="movie-card">
    <div class="poster-container">
      <img :src="movie.poster_image" :alt="movie.title" class="movie-poster" />
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
        <button class="detail-btn">자세히 보기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth'; // auth 스토어 임포트

const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  // 이 prop은 WishlistView에서 사용될 때 이미 찜된 상태임을 명시적으로 전달합니다.
  isWishlisted: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-wishlist']); // 찜하기 토글 이벤트를 상위 컴포넌트로 전달

const authStore = useAuthStore();

// 영화가 현재 찜 목록에 있는지 여부를 계산된 속성으로 확인
const isWishlistedComputed = computed(() => {
  return authStore.isMovieInWishlist(props.movie.id);
});

const toggleWishlist = async () => {
  if (!authStore.isLoggedIn) {
    alert('찜하기 기능을 사용하려면 로그인해야 합니다.');
    return;
  }
  // Pinia 스토어의 액션 호출
  if (isWishlistedComputed.value) {
    await authStore.removeMovieFromWishlist(props.movie.id);
  } else {
    await authStore.addMovieToWishlist(props.movie.id);
  }
  emit('toggle-wishlist', props.movie); // 상위 컴포넌트에 변경 사항 알림 (WishlistView에서 사용)
};
</script>

<style scoped>
.movie-card {
  width: 100%;
  max-width: 250px; /* 카드 최대 너비 설정 */
  background-color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  aspect-ratio: 2/3; /* 포스터 비율 유지 */
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
  min-height: 50%; /* 오버레이가 카드 높이의 절반을 차지하도록 */
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

/* 찜하기 버튼 */
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
  color: #ff6b6b; /* 찜했을 때 하트 색상 */
}

.wishlist-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.wishlist-btn:hover i {
  color: #ff6b6b;
}

/* 반응형 */
@media (max-width: 768px) {
  .movie-card {
    max-width: 180px; /* 모바일에서 카드 너비 조정 */
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
    font-size: 1rem;
  }
}
</style>