<template>
  <div class="movie-detail-view">
    <AppHeader />

    <div v-if="movieStore.isDetailLoading" class="loading-container">
      <p>상세 정보를 불러오는 중입니다...</p>
    </div>
    <div v-if="!movieStore.isDetailLoading && movieStore.error" class="error-container">
      <p>오류: {{ movieStore.error }}</p>
    </div>

    <template v-if="!movieStore.isDetailLoading && movie">
      <div class="hero-section" :style="{ backgroundImage: `url(${movie.backdrop_path})` }">
        <div class="hero-overlay">
          <div class="hero-content-wrapper">
            <img :src="movie.poster_path" :alt="movie.title" class="poster" v-if="movie.poster_path"/>
            <div class="hero-info">
              <h1>{{ movie.title }}</h1>
              <p class="tagline" v-if="movie.tagline">{{ movie.tagline }}</p>
              <div class="meta-info">
                <span>{{ movie.release_date ? movie.release_date.substring(0, 4) : 'N/A' }}</span>
                <span v-if="movie.runtime">{{ formatRuntime(movie.runtime) }}</span>
                <span class="rating" v-if="movie.vote_average">★ {{ movie.vote_average.toFixed(1) }}</span>
              </div>
              <div class="genres" v-if="movie.genres && movie.genres.length">
                <span v-for="genre in movie.genres" :key="genre.id" class="genre-tag">{{ genre.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main class="main-content-detail">
        <section class="overview-section">
          <h2>줄거리</h2>
          <p>{{ movie.overview || "제공된 줄거리가 없습니다." }}</p>
        </section>

        <section class="cast-section" v-if="movie.cast && movie.cast.length">
          <h2>주요 출연진</h2>
          <div class="cast-list">
            <div v-for="actor in movie.cast" :key="actor.id" class="cast-member">
              <img :src="actor.profile_path" :alt="actor.name" class="actor-photo" v-if="actor.profile_path" @error="onActorImageError"/>
              <div v-else class="actor-photo-placeholder">?</div>
              <p class="actor-name">{{ actor.name }}</p>
              <p class="character-name">{{ actor.character }}</p>
            </div>
          </div>
        </section>

        <section class="director-section" v-if="movie.director">
          <h2>감독</h2>
          <p>{{ movie.director }}</p>
        </section>

        <section class="trailer-section" v-if="movie.trailer">
          <h2>예고편</h2>
          <div class="trailer-container">
            <iframe
              :src="movie.trailer"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </section>

        <section class="ott-section" v-if="movie.ott_providers_kr && movie.ott_providers_kr.length">
          <h2>볼 수 있는 곳 (구독)</h2>
          <div class="ott-list">
            <div v-for="ott in movie.ott_providers_kr" :key="ott.provider_id" class="ott-provider">
              <img :src="ott.logo_path" :alt="ott.provider_name" class="ott-logo" v-if="ott.logo_path" @error="onOttImageError"/>
              <span v-else>{{ ott.provider_name }}</span>
            </div>
          </div>
        </section>
      </main>
    </template>
    <div v-if="!movieStore.isDetailLoading && !movieStore.error && !movie" class="no-movie-data">
      <p>영화 정보를 찾을 수 없습니다.</p>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovieStore } from '@/stores/movie';
import AppHeader from '@/components/common/AppHeader.vue'; // 경로 확인
import AppFooter from '@/components/common/AppFooter.vue'; // 경로 확인

const route = useRoute();
const router = useRouter(); // 필요시 사용 (예: 이전 페이지로 가기 버튼)
const movieStore = useMovieStore();

const movieId = ref(route.params.id);

// 스토어에서 현재 영화 상세 정보 가져오기
const movie = computed(() => movieStore.currentMovieDetail);

// 영화 러닝타임 포맷 (예: 120분 -> "2시간 0분")
const formatRuntime = (minutes) => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? h + '시간 ' : ''}${m}분`;
};

// 배우 프로필 이미지 에러 시 대체 처리
const onActorImageError = (event) => {
  event.target.style.display = 'none'; // 이미지를 숨기거나
  // 또는 event.target.src = '대체이미지경로';
  // 아니면 부모 요소에 클래스를 추가해서 CSS로 placeholder를 보여줄 수도 있음
  const placeholder = event.target.nextElementSibling; // 예시: 이미지가 placeholder 앞에 있다고 가정
  if (placeholder && placeholder.classList.contains('actor-photo-placeholder')) {
    placeholder.style.display = 'flex';
  }
};
// OTT 로고 이미지 에러 시 대체 처리 (이름으로 표시)
const onOttImageError = (event) => {
  const parent = event.target.parentElement;
  if(parent){
    event.target.style.display = 'none';
    const span = parent.querySelector('span');
    if(span) span.style.display = 'inline';
  }
};


// 컴포넌트 마운트 시 또는 라우트 ID 변경 시 영화 상세 정보 가져오기
const loadMovieDetail = async (id) => {
  if (id) {
    await movieStore.fetchMovieDetail(id);
  }
};

onMounted(() => {
  loadMovieDetail(movieId.value);
});

// 동일 라우트 내에서 파라미터만 변경될 경우 (예: 추천 영화에서 다른 영화 상세로 이동)
watch(() => route.params.id, (newId) => {
  if (newId && newId !== movieId.value) {
    movieId.value = newId;
    loadMovieDetail(newId);
  }
});

// 컴포넌트 언마운트 시 스토어의 상세 정보 초기화 (선택적)
// import { onUnmounted } from 'vue';
// onUnmounted(() => {
//   movieStore.currentMovieDetail = null;
// });
</script>

<style scoped>
.movie-detail-view {
  color: #fff;
  background-color: #141414; /* 전체 배경 어둡게 */
}

.loading-container, .error-container, .no-movie-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px); /* 헤더/푸터 높이 제외 */
  font-size: 1.5rem;
}
.error-container { color: #e50914; }

.hero-section {
  width: 100%;
  min-height: 70vh;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: flex-end; /* 콘텐츠를 하단에 정렬 */
}

.hero-overlay {
  background: linear-gradient(to top, rgba(20, 20, 20, 1) 10%, rgba(20, 20, 20, 0.6) 60%, rgba(20, 20, 20, 0) 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display:flex;
  align-items: flex-end;
}
.hero-content-wrapper{
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width:100%;
}

.poster {
  width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  flex-shrink: 0;
}

.hero-info h1 {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
}

.tagline {
  font-size: 1.2rem;
  font-style: italic;
  color: #ccc;
  margin-bottom: 1rem;
}

.meta-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #b0b0b0;
}
.meta-info .rating { color: #f5c518; font-weight: bold; }

.genres { margin-bottom: 1rem; }
.genre-tag {
  background-color: rgba(255,255,255,0.1);
  padding: 0.3rem 0.7rem;
  border-radius: 15px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.main-content-detail {
  padding: 2rem;
  max-width: 1000px;
  margin: 2rem auto; /* 위쪽 히어로 섹션과 간격 */
}

.main-content-detail section {
  margin-bottom: 2.5rem;
}

.main-content-detail h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #444;
}

.overview-section p {
  line-height: 1.7;
  color: #e0e0e0;
}

.cast-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1.5rem;
}
.cast-member { text-align: center; }
.actor-photo, .actor-photo-placeholder {
  width: 100px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 0.5rem;
  background-color: #333;
  display: flex; /* For placeholder '?' */
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #555;
}
.actor-name { font-weight: 500; font-size:0.9rem; }
.character-name { font-size: 0.8rem; color: #aaa; }

.trailer-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
}
.trailer-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.ott-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
.ott-provider {
  background-color: #222;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ott-logo {
  height: 30px;
  width: auto;
  border-radius: 4px;
}
.ott-provider span { /* 로고 없을 때 이름 표시용 */
  display: none;
}

@media (max-width: 768px) {
  .hero-content-wrapper { flex-direction: column; align-items: center; text-align: center; }
  .poster { width: 150px; margin-bottom:1rem; }
  .hero-info h1 { font-size: 2.2rem; }
  .tagline { font-size: 1rem; }
  .main-content-detail { padding: 1.5rem; margin-top:1rem; }
  .cast-list { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); }
  .actor-photo, .actor-photo-placeholder { width: 80px; height: 120px; }
}
</style>