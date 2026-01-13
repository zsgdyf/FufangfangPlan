<template>
  <!-- 主布局容器 -->
  <div class="h-screen w-screen flex flex-col bg-[#FDFBF7] text-stone-700 font-sans overflow-hidden">
    
    <!-- 加载中状态 -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="animate-pulse text-soft-pink text-xl font-bold">正在加载系统...</div>
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
      
      <!-- 内容主区域：根据当前标签动态切换组件 -->
      <main class="flex-1 overflow-hidden relative">
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

// 根据选择的 Tab 计算对应的显示组件
const currentViewComponent = computed(() => {
  switch (currentTab.value) {
    case 'home': return HomeView;
    case 'bookshelf': return BookshelfView;
    case 'kitchen': return KitchenView;
    case 'shop': return RewardShop;
    default: return HomeView;
  }
});

// 处理登录成功
const handleLoginSuccess = (userData) => {
  user.value = userData;
  // 持久化存储用户信息（或Token，此处为演示简单存User对象）
  localStorage.setItem('user', JSON.stringify(userData));
};

// 处理登出
const handleLogout = () => {
  user.value = null;
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  currentTab.value = 'home';
};

// 从 API 获取用户信息 (用于刷新数据)
const fetchUser = async () => {
  try {
    const res = await api.get('/user');
    user.value = res.data;
    // 更新本地存储
    localStorage.setItem('user', JSON.stringify(res.data));
  } catch (e) {
    console.error("无法获取用户信息", e);
  }
};

onMounted(async () => {
  // 检查本地是否有保存的登录信息
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      // 尝试解析本地数据
      user.value = JSON.parse(storedUser);
      // 后台静默刷新一次最新数据
      await fetchUser();
    } catch (e) {
      console.error("本地数据解析失败", e);
      localStorage.removeItem('user');
    }
  }
  
  // 无论是否登录，加载完成
  isLoading.value = false;
});
</script>

<style>
/* 切换视图时的渐变效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
