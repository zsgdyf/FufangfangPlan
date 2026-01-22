<template>
  <div class="home-container">
    <div class="home-content">
      
      <!-- 欢迎标语 -->
      <div class="welcome-section">
        <h1 class="welcome-title">早安，{{ user.name }}</h1>
        <p class="welcome-subtitle">今天也是元气满满的一天，准备好完成你的计划了吗？</p>
      </div>

      <!-- 概览卡片网格 -->
      <div class="card-grid">
        
        <!-- 书房卡片 -->
        <div class="overview-card" @click="$emit('change-tab', 'bookshelf')">
          <!-- 背景装饰图标 -->
          <div class="card-bg-icon card-bg-icon--wood">
            <BookOpenIcon :size="100" />
          </div>
           
          <div class="card-body">
            <!-- 图标区域 -->
            <div class="card-icon card-icon--wood">
              <BookOpenIcon :size="24" />
            </div>
            <h2 class="card-title">我的书房</h2>
            <p class="card-description">沉浸在知识的海洋</p>
             
            <!-- 进度统计区域 -->
            <div class="card-stats">
              <div class="stats-header">
                <span class="stats-label">年度阅读进度</span>
                <span class="stats-value stats-value--wood">{{ readingStats.current }} / {{ readingStats.target }}</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill progress-fill--wood" 
                  :style="{ width: readingStats.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 厨房卡片 -->
        <div class="overview-card" @click="$emit('change-tab', 'kitchen')">
          <div class="card-bg-icon card-bg-icon--teal">
            <UtensilsIcon :size="100" />
          </div>
           
          <div class="card-body">
            <div class="card-icon card-icon--teal">
              <UtensilsIcon :size="24" />
            </div>
            <h2 class="card-title">我的厨房</h2>
            <p class="card-description">保持健康的饮食习惯</p>
             
            <div class="card-stats">
              <div class="stats-header">
                <span class="stats-label">本周限制项</span>
                <span class="stats-value stats-value--teal">{{ dietStats.activeCount }} 项进行中</span>
              </div>
              <div class="icon-list">
                <span 
                  v-for="(icon, i) in dietStats.icons" 
                  :key="i" 
                  class="icon-badge"
                >{{ icon }}</span>
                <span v-if="dietStats.icons.length === 0" class="icon-placeholder">暂无限制</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 商店卡片 (宽版) -->
        <div class="shop-card" @click="$emit('change-tab', 'shop')">
          <div class="shop-card-content">
            <div class="shop-card-left">
              <div class="shop-card-header">
                <div class="shop-card-icon">
                  <ShoppingBagIcon :size="20" />
                </div>
                <h2 class="shop-card-title">心愿商店</h2>
              </div>
              <p class="shop-card-description">用你的努力兑换奖励吧！</p>
            </div>
             
            <div class="shop-card-right">
              <p class="exp-label">当前可用</p>
              <p class="exp-value">
                {{ user.current_exp }} 
                <span class="exp-unit">EXP</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { BookOpenIcon, UtensilsIcon, ShoppingBagIcon } from 'lucide-vue-next';
import api from '../api';

const props = defineProps(['user']);
defineEmits(['change-tab']);

const plans = ref([]);

// 阅读统计数据
const readingStats = computed(() => {
  const bookPlan = plans.value.find(p => p.type === 'book');
  if (!bookPlan) return { current: 0, target: 0, percentage: 0 };
  
  const pct = Math.min((bookPlan.current_val / bookPlan.target_val) * 100, 100);
  return {
    current: bookPlan.current_val,
    target: bookPlan.target_val,
    percentage: pct
  };
});

// 饮食统计数据
const dietStats = computed(() => {
  const dietPlans = plans.value.filter(p => p.type === 'diet');
  const icons = dietPlans.map(p => {
    try { return JSON.parse(p.metadata).icon } catch { return '🍽️' }
  }).slice(0, 5); // 只展示前5个
  
  return {
    activeCount: dietPlans.length,
    icons
  };
});

// 页面加载时获取计划数据
onMounted(async () => {
  try {
    const res = await api.get('/plans');
    plans.value = res.data;
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
/* ==================== 页面容器 ==================== */
.home-container {
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  background-color: #FDFBF7;
  overflow-y: auto;
}

.home-content {
  max-width: 56rem; /* max-w-4xl */
  margin: 0 auto;
}

/* ==================== 欢迎区域 ==================== */
.welcome-section {
  margin-bottom: 2.5rem;
  text-align: center;
}

.welcome-title {
  font-size: 1.875rem; /* text-3xl */
  font-weight: 700;
  color: #44403c; /* text-stone-700 */
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  color: #78716c; /* text-stone-500 */
}

/* ==================== 卡片网格 ==================== */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ==================== 通用卡片样式 ==================== */
.overview-card {
  position: relative;
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f5f5f4; /* border-stone-100 */
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.overview-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* 卡片背景装饰图标 */
.card-bg-icon {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem;
  opacity: 0.1;
  transition: all 0.3s ease;
}

.overview-card:hover .card-bg-icon {
  opacity: 0.2;
  transform: scale(1.1);
}

.card-bg-icon--wood {
  color: #a68b6a; /* wood 颜色 */
}

.card-bg-icon--teal {
  color: #0d9488; /* teal-600 */
}

/* 卡片主体内容 */
.card-body {
  position: relative;
  z-index: 10;
}

/* 卡片顶部图标 */
.card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.card-icon--wood {
  background-color: rgba(166, 139, 106, 0.1);
  color: #a68b6a;
}

.card-icon--teal {
  background-color: #f0fdfa; /* teal-50 */
  color: #0d9488;
}

/* 卡片标题和描述 */
.card-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 700;
  color: #44403c;
  margin-bottom: 0.25rem;
}

.card-description {
  font-size: 0.75rem; /* text-xs */
  color: #a8a29e; /* stone-400 */
  margin-bottom: 1.5rem;
}

/* ==================== 统计区域 ==================== */
.card-stats {
  background-color: #fafaf9; /* stone-50 */
  border-radius: 0.75rem;
  padding: 1rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stats-label {
  color: #57534e; /* stone-600 */
  font-weight: 500;
}

.stats-value {
  font-weight: 700;
}

.stats-value--wood {
  color: #a68b6a;
}

.stats-value--teal {
  color: #0d9488;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: #e7e5e4; /* stone-200 */
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 1s ease;
}

.progress-fill--wood {
  background-color: #a68b6a;
}

/* 图标列表 */
.icon-list {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  overflow: hidden;
}

.icon-badge {
  font-size: 1.125rem;
  background-color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.icon-placeholder {
  font-size: 0.75rem;
  color: #a8a29e;
  align-self: center;
}

/* ==================== 商店卡片 (宽版) ==================== */
.shop-card {
  grid-column: span 1;
  position: relative;
  background: linear-gradient(to right, #fce7f3, #fbcfe8); /* soft-pink 渐变 */
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .shop-card {
    grid-column: span 2;
  }
}

.shop-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.shop-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
}

.shop-card-left {
  /* 左侧内容 */
}

.shop-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.shop-card-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ec4899; /* pink-500 */
}

.shop-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #292524; /* stone-800 */
}

.shop-card-description {
  font-size: 0.875rem;
  color: #57534e;
}

.shop-card-right {
  text-align: right;
}

.exp-label {
  font-size: 0.75rem;
  color: #78716c;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exp-value {
  font-size: 1.875rem;
  font-weight: 800;
  color: #292524;
}

.exp-unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: #57534e;
}
</style>
