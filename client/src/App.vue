<template>
  <!-- 主布局容器 -->
  <div class="app-container">
    <!-- 加载中状态 -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-text">正在加载系统...</div>
    </div>

    <!-- 登录界面 -->
    <LoginView v-else-if="!user" @login-success="handleLoginSuccess" />

    <!-- 主界面 -->
    <template v-else>
      <!-- 顶部用户信息栏 -->
      <UserHeader 
        :user="user" 
        :currentTab="currentTab"
        @change-tab="tab => currentTab = tab"
        @logout="handleLogout"
      />
      
      <!-- 内容主区域 -->
      <main class="main-content">
        <transition name="fade" mode="out-in">
          <component 
            :is="currentViewComponent" 
            :user="user" 
            @update-user="fetchUser"
            @change-tab="tab => currentTab = tab"
          />
        </transition>
      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import UserHeader from './components/UserHeader.vue';
import LoginView from './components/LoginView.vue';
import HomeView from './components/HomeView.vue';
import BookshelfView from './components/BookshelfView.vue';
import KitchenView from './components/KitchenView.vue';
import RewardShop from './components/RewardShop.vue';
import api from './api';

const user = ref(null);
const currentTab = ref('home');
const isLoading = ref(true);

// 根据 Tab 计算显示组件
const currentViewComponent = computed(() => {
  switch (currentTab.value) {
    case 'home': return HomeView;
    case 'bookshelf': return BookshelfView;
    case 'kitchen': return KitchenView;
    case 'shop': return RewardShop;
    default: return HomeView;
  }
});

// 登录成功
const handleLoginSuccess = (userData) => {
  user.value = userData;
  localStorage.setItem('user', JSON.stringify(userData));
};

// 登出
const handleLogout = () => {
  user.value = null;
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  currentTab.value = 'home';
};

// 获取用户信息
const fetchUser = async () => {
  try {
    const res = await api.get('/user');
    user.value = res.data;
    localStorage.setItem('user', JSON.stringify(res.data));
  } catch (e) {
    console.error("无法获取用户信息", e);
  }
};

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
      await fetchUser();
    } catch (e) {
      console.error("本地数据解析失败", e);
      localStorage.removeItem('user');
    }
  }
  isLoading.value = false;
});
</script>

<style>
/* ==================== 应用容器 ==================== */
.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #FDFBF7;
  color: #44403c;
  font-family: system-ui, sans-serif;
  overflow: hidden;
}

/* ==================== 加载状态 ==================== */
.loading-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #fce7f3;
  font-size: 1.25rem;
  font-weight: 700;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ==================== 主内容区 ==================== */
.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* ==================== 页面切换动画 ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
