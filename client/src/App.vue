<template>
  <!-- 主布局容器 -->
  <div class="h-screen w-screen flex flex-col bg-[#FDFBF7] text-stone-700 font-sans overflow-hidden">
    <!-- 顶部用户信息栏 -->
    <UserHeader 
      v-if="user" 
      :user="user" 
      :currentTab="currentTab"
      @change-tab="tab => currentTab = tab"
    />
    
    <!-- 加载中状态 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="animate-pulse text-soft-pink text-xl font-bold">正在加载用户信息...</div>
    </div>

    <!-- 内容主区域：根据当前标签动态切换组件 -->
    <main v-if="user" class="flex-1 overflow-hidden relative">
      <transition name="fade" mode="out-in">
        <component 
          :is="currentViewComponent" 
          :user="user" 
          @update-user="fetchUser"
          @change-tab="tab => currentTab = tab"
        />
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import UserHeader from './components/UserHeader.vue';
import HomeView from './components/HomeView.vue';
import BookshelfView from './components/BookshelfView.vue';
import KitchenView from './components/KitchenView.vue';
import RewardShop from './components/RewardShop.vue';
import api from './api';

const user = ref(null);
const currentTab = ref('home');

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

// 从 API 获取用户信息
const fetchUser = async () => {
  try {
    const res = await api.get('/user');
    user.value = res.data;
  } catch (e) {
    console.error("无法获取用户信息", e);
  }
};

onMounted(() => {
  fetchUser();
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
