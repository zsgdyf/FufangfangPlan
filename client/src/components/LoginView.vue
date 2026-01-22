<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-wrapper">
        <div class="logo">浮</div>
      </div>
      <h1 class="login-title">欢迎回来</h1>
      <p class="login-subtitle">Floating Square Annual Plan</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input v-model="username" type="text" class="form-input" placeholder="请输入用户名" required />
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="password" type="password" class="form-input" placeholder="请输入密码" required />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="loading-state">
            <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            登录中...
          </span>
          <span v-else>立即开启</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api';

const emit = defineEmits(['login-success']);
const username = ref(''); 
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const res = await api.post('/login', { username: username.value, password: password.value });
    if (res.data.success) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      emit('login-success', res.data.user);
    }
  } catch (e) {
    console.error(e);
    error.value = e.response?.status === 401 ? '用户名或密码不正确' : '登录服务暂不可用';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container { display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; background-color: #FFFBF5; }
.login-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; max-width: 28rem; border: 4px solid #fce7f3; }
.logo-wrapper { display: flex; justify-content: center; margin-bottom: 1rem; }
.logo { width: 4rem; height: 4rem; background: #c9a77c; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.login-title { font-size: 1.875rem; font-weight: 700; text-align: center; color: #a68b6a; margin-bottom: 0.5rem; }
.login-subtitle { text-align: center; color: #78716c; margin-bottom: 2rem; }
.login-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-label { display: block; color: #57534e; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem; }
.form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #e2e8f0; background: #f8fafc; color: #44403c; font-weight: 500; outline: none; transition: all 0.2s; }
.form-input:focus { border-color: #86efac; box-shadow: 0 0 0 2px rgba(134,239,172,0.2); }
.error-message { background: #fef2f2; color: #ef4444; font-size: 0.875rem; text-align: center; font-weight: 700; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #fee2e2; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
.submit-btn { width: 100%; background: #c9a77c; color: white; font-weight: 700; padding: 0.75rem; border-radius: 0.75rem; border: none; cursor: pointer; transition: all 0.3s; }
.submit-btn:hover:not(:disabled) { background: #a68b6a; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); transform: translateY(-2px); }
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.loading-state { display: flex; align-items: center; justify-content: center; }
.spinner { animation: spin 1s linear infinite; margin-right: 0.75rem; height: 1.25rem; width: 1.25rem; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinner-track { opacity: 0.25; }
.spinner-head { opacity: 0.75; }
</style>
