// src/stores/movie.js (기존 코드와 병합 또는 수정)

import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

const TMDB_API_KEY = 'a6596aeba251cb8c79bcab0b45072ee4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const IMAGE_ORIGINAL_BASE_URL = 'https://image.tmdb.org/t/p/original'; // 고화질 배경용

const apiClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'ko-KR',
  },
});

// 목록용 포맷터 (기존 유지)
const formatMovieListItem = (movie) => ({
  id: movie.id,
  title: movie.title,
  original_title: movie.original_title,
  overview: movie.overview,
  poster_path: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
  backdrop_path: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null, // 목록에서도 작은 배경 쓸 수 있음
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  genre_ids: movie.genre_ids || [],
  popularity: movie.popularity,
});

// (새로운) 상세 정보용 포맷터 - 필요시 더 상세하게 만들 수 있지만, 여기서는 주요 경로만 처리
const formatMovieDetailData = (data) => {
  // 감독 찾기
  const director = data.credits?.crew?.find(person => person.job === 'Director');
  // 주요 배우 (최대 10명)
  const cast = data.credits?.cast?.slice(0, 10).map(person => ({
    id: person.id,
    name: person.name,
    character: person.character,
    profile_path: person.profile_path ? `${IMAGE_BASE_URL}${person.profile_path}` : null,
  })) || [];
  // YouTube 예고편 (첫 번째 것)
  const trailer = data.videos?.results?.find(video => video.site === 'YouTube' && video.type === 'Trailer');
  // 한국 OTT 정보 (flatrate 구독)
  const ottProvidersKR = data['watch/providers']?.results?.KR?.flatrate?.map(p => ({
    provider_id: p.provider_id,
    provider_name: p.provider_name,
    logo_path: p.logo_path ? `${IMAGE_BASE_URL}${p.logo_path}` : null,
  })) || [];

  return {
    id: data.id,
    title: data.title,
    original_title: data.original_title,
    tagline: data.tagline,
    overview: data.overview,
    poster_path: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
    backdrop_path: data.backdrop_path ? `${IMAGE_ORIGINAL_BASE_URL}${data.backdrop_path}` : null, // 배경은 고화질로
    release_date: data.release_date,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    genres: data.genres || [], // {id, name} 객체 배열
    runtime: data.runtime, // 분 단위
    popularity: data.popularity,
    status: data.status,
    imdb_id: data.imdb_id,
    director: director ? director.name : null,
    cast: cast,
    trailer: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null, // YouTube embed URL
    trailer_key: trailer ? trailer.key : null,
    ott_providers_kr: ottProvidersKR,
    // 필요하면 production_companies 등 더 추가 가능
  };
};


export const useMovieStore = defineStore('movies', () => {
  // --- 기존 State ---
  const movieGenres = ref([]);
  const recommendedMovies = ref([]);
  const domesticPopularMovies = ref([]);
  const internationalPopularMovies = ref([]);
  const latestMovies = ref([]);
  const moviesByGenre = ref([]);

  // --- 새로운 State ---
  const currentMovieDetail = ref(null); // 현재 선택된 영화의 상세 정보
  const isDetailLoading = ref(false); // 상세 정보 로딩 상태

  // --- 기존isLoading, error는 목록용으로 계속 사용 가능 ---
  const isLoading = ref(false); // 목록 로딩 상태
  const error = ref(null);

  // --- 기존 Actions 수정 (포맷터 이름 변경 적용) ---
  async function _fetchMovies(endpoint, params = {}, targetRef) {
    isLoading.value = true; // 목록 로딩 시작
    error.value = null;
    try {
      const response = await apiClient.get(endpoint, { params });
      if (response.data && response.data.results) {
        targetRef.value = response.data.results.map(formatMovieListItem); // 포맷터 변경
      } else {
        targetRef.value = [];
      }
    } catch (err) {
      console.error(`Error fetching movies from ${endpoint}:`, err);
      error.value = `영화 목록 정보를 가져오는 데 실패했습니다: ${err.message}`;
      targetRef.value = [];
    } finally {
      isLoading.value = false; // 목록 로딩 완료
    }
  }

  async function fetchMovieGenres() {
    // ... (기존 코드와 동일, 필요시 isDetailLoading 대신 isLoading 사용)
    if (movieGenres.value.length > 0) return;
    isLoading.value = true; // 또는 isDetailLoading 같이 사용 가능
    error.value = null;
    try {
      const response = await apiClient.get('/genre/movie/list');
      if (response.data && response.data.genres) {
        movieGenres.value = response.data.genres;
      }
    } catch (err) {
      console.error('Error fetching movie genres:', err);
      error.value = `장르 목록을 가져오는 데 실패했습니다: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  }
  // ... (fetchRecommendedMovies, fetchDomesticPopularMovies 등 기존 목록 가져오는 액션들은 _fetchMovies를 사용하므로 formatMovieListItem 적용됨)
  async function fetchRecommendedMovies(page = 1) {
    await _fetchMovies('/movie/popular', { page }, recommendedMovies);
  }

  async function fetchDomesticPopularMovies(page = 1) {
    await _fetchMovies('/movie/popular', { page, region: 'KR' }, domesticPopularMovies);
  }

  async function fetchInternationalPopularMovies(page = 1) {
    await _fetchMovies('/movie/popular', { page, region: 'US' }, internationalPopularMovies);
  }

  async function fetchLatestMovies(page = 1) {
    await _fetchMovies('/movie/now_playing', { page, region: 'KR' }, latestMovies);
  }

  async function fetchMoviesByGenre(genreId, page = 1) {
    if (!genreId) {
        moviesByGenre.value = [];
        return;
    }
    await _fetchMovies('/discover/movie', { with_genres: genreId, page }, moviesByGenre);
  }


  // --- 새로운 Action ---
  // 단일 영화 상세 정보 가져오기
  async function fetchMovieDetail(movieId) {
    if (!movieId) {
      currentMovieDetail.value = null;
      return;
    }
    isDetailLoading.value = true;
    error.value = null; // 에러 상태 초기화 (또는 별도의 detailError 상태 사용)
    currentMovieDetail.value = null; // 이전 데이터 초기화

    try {
      // append_to_response로 credits(배우/제작진), videos(예고편), watch/providers(OTT) 정보 함께 요청
      const response = await apiClient.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,watch/providers',
        }
      });
      currentMovieDetail.value = formatMovieDetailData(response.data);
    } catch (err) {
      console.error(`Error fetching movie detail for ID ${movieId}:`, err);
      error.value = `영화 상세 정보를 가져오는 데 실패했습니다: ${err.message}`;
      currentMovieDetail.value = null;
    } finally {
      isDetailLoading.value = false;
    }
  }

  return {
    // 기존 State
    movieGenres,
    recommendedMovies,
    domesticPopularMovies,
    internationalPopularMovies,
    latestMovies,
    moviesByGenre,
    isLoading, // 목록용 로딩
    error,

    // 새로운 State
    currentMovieDetail,
    isDetailLoading, // 상세페이지용 로딩

    // 기존 Actions
    fetchMovieGenres,
    fetchRecommendedMovies,
    fetchDomesticPopularMovies,
    fetchInternationalPopularMovies,
    fetchLatestMovies,
    fetchMoviesByGenre,

    // 새로운 Action
    fetchMovieDetail,
  };
});