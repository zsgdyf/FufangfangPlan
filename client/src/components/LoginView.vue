<template>
  <div class="flex items-center justify-center h-full w-full bg-cream">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-4 border-soft-pink">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 bg-wood-light rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          浮
        </div>
      </div>
      <h1 class="text-3xl font-bold text-center text-wood mb-2">欢迎回来</h1>
      <p class="text-center text-stone-500 mb-8">Floating Square Annual Plan</p>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-stone-600 mb-2 font-semibold text-sm">用户名</label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 focus:outline-none transition bg-slate-50 text-stone-700 font-medium"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div>
          <label class="block text-stone-600 mb-2 font-semibold text-sm">密码</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sage-green focus:ring-2 focus:ring-sage-green/20 focus:outline-none transition bg-slate-50 text-stone-700 font-medium"
            placeholder="请输入密码"
            required
          />
        </div>

        <div v-if="error" class="bg-red-50 text-red-500 text-sm text-center font-bold p-3 rounded-lg border border-red-100 animate-pulse">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="w-full bg-wood-light text-white font-bold py-3 rounded-xl hover:bg-wood hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          :disabled="loading"
        >
          <span v-if="loading" class="flex items-center justify-center">
             <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
               <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
    // 简单验证，发送到后端
    const res = await api.post('/login', {
      username: username.value,
      password: password.value
    });
    
    if (res.data.success) {
      // 登录成功
      // 存储登录状态
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      emit('login-success', res.data.user);
    }
  } catch (e) {
    console.error(e);
    if (e.response && e.response.status === 401) {
      error.value = '用户名或密码不正确';
    } else {
      error.value = '登录服务暂不可用，请确保后端已启动';
    }
  } finally {
    loading.value = false;
  }
};
</script>
