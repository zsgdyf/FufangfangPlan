<template>
  <div class="header-container">
    <!-- 用户信息区域 -->
    <div class="user-info">
      <div class="avatar-wrapper">
        <img 
          :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'" 
          alt="头像" 
          class="avatar-image" 
        />
        <!-- 等级角标 -->
        <div class="level-badge">Lv.{{ user.level }}</div>
      </div>
      <div class="user-details">
        <h2 class="user-name">{{ user.name }}</h2>
        <div class="exp-info">
          <span>经验值</span>
          <div class="exp-bar">
            <!-- 经验条：这里简单演示，每 100 EXP 进度条满一次 -->
            <div 
              class="exp-fill" 
              :style="{ width: `${(user.current_exp % 100)}%` }"
            ></div>
          </div>
          <span>{{ user.current_exp }}</span>
        </div>
      </div>
    </div>

    <!-- 导航标签栏 -->
    <div class="nav-section">
      <div class="nav-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="$emit('change-tab', tab.id)"
          :class="['nav-tab', { 'nav-tab--active': currentTab === tab.id }]"
        >
          <component :is="tab.icon" class="nav-icon" />
          {{ tab.label }}
        </button>
      </div>

      <!-- 登出按钮 -->
      <button 
        @click="$emit('logout')"
        class="logout-btn"
        title="退出登录"
      >
        <LogOutIcon class="logout-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { HomeIcon, BookOpen, Utensils, ShoppingBag, LogOut as LogOutIcon } from 'lucide-vue-next';

defineProps({
  user: {
    type: Object,
    required: true,
  },
  currentTab: {
    type: String,
    required: true,
  }
});

defineEmits(['change-tab', 'logout']);

// 侧边栏/顶部导航配置
const tabs = [
  { id: 'home', label: '首页', icon: HomeIcon },
  { id: 'bookshelf', label: '书房', icon: BookOpen }, 
  { id: 'kitchen', label: '厨房', icon: Utensils },
  { id: 'shop', label: '商店', icon: ShoppingBag },
];
</script>

<style scoped>
/* ==================== 头部容器 ==================== */
.header-container {
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid #f5f5f4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ==================== 用户信息区域 ==================== */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-wrapper {
  position: relative;
}

.avatar-image {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid #fce7f3; /* soft-pink */
  background-color: white;
}

.level-badge {
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  background-color: #c9a77c; /* wood-light */
  color: white;
  font-size: 10px;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-weight: 700;
}

.user-details {
  /* 用户详情容器 */
}

.user-name {
  font-size: 1.125rem; /* text-lg */
  font-weight: 700;
  color: #44403c; /* stone-700 */
}

.exp-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem; /* text-xs */
  color: #78716c; /* stone-500 */
}

.exp-bar {
  width: 8rem;
  height: 0.5rem;
  background-color: #e7e5e4; /* stone-200 */
  border-radius: 9999px;
  overflow: hidden;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(to right, #fce7f3, #fca5a5); /* soft-pink to red-300 */
  transition: all 0.5s ease;
}

/* ==================== 导航区域 ==================== */
.nav-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-tabs {
  display: flex;
  gap: 0.25rem;
  background-color: rgba(245, 245, 244, 0.5); /* stone-100/50 */
  padding: 0.25rem;
  border-radius: 9999px;
}

.nav-tab {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #a8a29e; /* stone-400 */
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-tab:hover {
  color: #57534e; /* stone-600 */
}

.nav-tab--active {
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  color: #c9a77c; /* wood-light */
}

.nav-icon {
  width: 1rem;
  height: 1rem;
  display: inline-block;
  margin-right: 0.25rem;
  margin-bottom: 0.125rem;
}

/* ==================== 登出按钮 ==================== */
.logout-btn {
  padding: 0.5rem;
  color: #a8a29e; /* stone-400 */
  border-radius: 50%;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.logout-btn:hover {
  color: #f87171; /* red-400 */
  background-color: #fafaf9; /* stone-50 */
}

.logout-icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
