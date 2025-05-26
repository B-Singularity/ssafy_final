// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import vue3GoogleLogin from 'vue3-google-login';
import router from './router'; // <--- 이 라인 반드시 있어야 함

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router); // <--- 이 라인 반드시 있어야 함 (Pinia 다음에 오는 것이 일반적)

// Google Login 플러그인 등록
app.use(vue3GoogleLogin, {
  clientId: '24120708973-o7fr06vmr3qdhvf6h6mb6mjp3gfhttim.apps.googleusercontent.com'
});

app.mount('#app');