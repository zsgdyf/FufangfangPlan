<template>
  <div class="kitchen-container">
    <!-- 背景装饰元素（抽象厨房纹理） -->
    <div class="kitchen-bg-pattern"></div>

    <!-- 动画喷泉：这里用于显示消费时的 "-1" 漂浮动画 -->
    <div class="floating-particles-container">
      <transition-group name="float-up">
        <div 
          v-for="p in floatingParticles" 
          :key="p.id"
          class="floating-particle"
          :style="{ left: p.x + 'px', top: p.y + 'px' }"
        >
          {{ p.text }}
        </div>
      </transition-group>
    </div>
    
    <div class="kitchen-content">
      <div class="header-row">
        <h1 class="page-title">我的厨房 (饮食限制)</h1>
        <button @click="showAddModal = true" class="add-btn">
          + 新增限制
        </button>
      </div>
       
      <div v-if="loading" class="loading-text">正在加载饮食计划...</div>

      <!-- 冰箱布局网格 -->
      <div v-else class="diet-grid">
        
        <!-- 饮食条目卡片 -->
        <div 
          v-for="plan in dietPlans" 
          :key="plan.id" 
          class="diet-card"
          :class="{ 'diet-card--over': isOverLimit(plan) }"
        >
          <h3 class="diet-card-title">{{ plan.title }}</h3>
           
          <!-- 图标按钮：点击表示「吃了一次」 -->
          <button 
            @click="(e) => consumeItem(plan, e)" 
            class="consume-btn"
          >
            <span class="consume-icon">{{ getIcon(plan) }}</span>
            <div class="consume-ring"></div>
          </button>

          <div class="diet-stats">
            <div class="stats-header">
              <span>本周已消耗</span>
              <span 
                class="remaining-count"
                :class="{ 'remaining-count--over': isOverLimit(plan) }"
              >
                剩余 {{ getRemaining(plan) }} 次
              </span>
            </div>
            <!-- 进度条：已用次数越多，条越长 -->
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :class="{ 'progress-fill--over': isOverLimit(plan) }"
                :style="{ width: `${Math.min((plan.current_val / plan.target_val) * 100, 100)}%` }"
              ></div>
            </div>
            <p class="limit-hint">每周上限：{{ plan.target_val }} 次</p>
          </div>
        </div>
       
        <!-- 空状态 -->
        <div v-if="dietPlans.length === 0" class="empty-state">
          <p>没有设置饮食限制。保持自律哦！</p>
        </div>
      </div>
    </div>

    <!-- 添加限制弹窗 -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">设置每周次数限制</h3>
        
        <input 
          v-model="newPlan.title" 
          placeholder="物品名称 (如：奶茶)" 
          class="modal-input" 
        />
        
        <div class="form-group">
          <label class="form-label">每周额度 (次)</label>
          <input 
            v-model.number="newPlan.limit" 
            type="number" 
            min="1" 
            class="modal-input" 
          />
        </div>

        <div class="form-group">
          <label class="form-label">选择图标</label>
          <div class="icon-picker">
            <button 
              v-for="icon in icons" 
              :key="icon" 
              @click="newPlan.icon = icon"
              class="icon-option"
              :class="{ 'icon-option--selected': newPlan.icon === icon }"
            >
              {{ icon }}
            </button>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showAddModal = false" class="modal-btn modal-btn--cancel">
            取消
          </button>
          <button @click="addPlan" class="modal-btn modal-btn--confirm">
            设定限制
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 页面容器 ==================== */
.kitchen-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #E0F2F1; /* teal-50 */
}

.kitchen-bg-pattern {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.2;
  pointer-events: none;
  background-image: radial-gradient(#B2DFDB 2px, transparent 2px);
  background-size: 30px 30px;
}

.kitchen-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.loading-text {
  text-align: center;
  color: #5eead4; /* teal-400 */
}

/* ==================== 头部区域 ==================== */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #115e59; /* teal-800 */
}

.add-btn {
  background-color: #0d9488; /* teal-600 */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-btn:hover {
  background-color: #14b8a6; /* teal-500 */
}

/* ==================== 饮食卡片网格 ==================== */
.diet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .diet-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .diet-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ==================== 饮食卡片 ==================== */
.diet-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 14rem;
  border-bottom: 4px solid #2dd4bf; /* teal-400 */
}

.diet-card--over {
  border-bottom-color: #f87171; /* red-400 */
}

.diet-card-title {
  font-weight: 700;
  color: #57534e;
  margin-bottom: 0.5rem;
}

/* ==================== 消费按钮 ==================== */
.consume-btn {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background-color: #fafaf9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease;
}

.consume-btn:hover {
  transform: scale(1.05);
}

.consume-btn:active {
  transform: scale(0.95);
}

.consume-icon {
  transition: opacity 0.3s ease;
}

.consume-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px dashed #e7e5e4;
  transition: border-color 0.2s ease;
}

.consume-btn:hover .consume-ring {
  border-color: #5eead4; /* teal-300 */
}

/* ==================== 统计区域 ==================== */
.diet-stats {
  width: 100%;
  margin-top: 1rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #78716c;
  margin-bottom: 0.25rem;
}

.remaining-count {
  font-weight: 700;
  color: #0d9488;
}

.remaining-count--over {
  color: #ef4444;
}

.progress-bar {
  width: 100%;
  height: 0.75rem;
  background-color: #f5f5f4;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #2dd4bf;
  transition: all 0.5s ease;
}

.progress-fill--over {
  background-color: #f87171;
}

.limit-hint {
  font-size: 10px;
  text-align: center;
  margin-top: 0.25rem;
  color: #a8a29e;
}

/* ==================== 空状态 ==================== */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 5rem 0;
  color: #0d9488;
}

/* ==================== 漂浮动画 ==================== */
.floating-particles-container {
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  overflow: hidden;
}

.floating-particle {
  position: absolute;
  color: #ef4444;
  font-weight: 700;
  font-size: 1.5rem;
}

.float-up-enter-active {
  transition: all 1s ease-out;
}

.float-up-enter-from {
  opacity: 1;
  transform: translateY(0);
}

.float-up-leave-active {
  transition: all 1s ease-out;
}

.float-up-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}

/* ==================== 弹窗 ==================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #115e59;
  margin-bottom: 1rem;
}

.modal-input {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: #f0fdfa; /* teal-50 */
  border-radius: 0.5rem;
  border: 1px solid #ccfbf1; /* teal-100 */
  color: #44403c;
  outline: none;
  transition: all 0.2s ease;
}

.modal-input:focus {
  box-shadow: 0 0 0 2px #5eead4;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  color: #78716c;
  margin-bottom: 0.5rem;
}

.icon-picker {
  display: flex;
  gap: 1rem;
}

.icon-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background-color: #f5f5f4;
}

.icon-option--selected {
  border-color: #14b8a6;
  background-color: #ccfbf1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn--cancel {
  background: transparent;
  color: #a8a29e;
}

.modal-btn--cancel:hover {
  color: #57534e;
}

.modal-btn--confirm {
  padding: 0.5rem 1.5rem;
  background-color: #0d9488;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2);
}

.modal-btn--confirm:hover {
  background-color: #14b8a6;
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const loading = ref(true);
const dietPlans = ref([]);
const showAddModal = ref(false);
const floatingParticles = ref([]); // 存储漂浮动画元素
let particleId = 0;

const icons = ['🧋', '🍔', '🍟', '🍰', '🥤', '🍺'];
const newPlan = ref({ title: '', limit: 2, icon: '🧋' });

// 获取饮食计划
const fetchPlans = async () => {
  loading.value = true;
  try {
    const res = await api.get('/plans');
    dietPlans.value = res.data.filter(p => p.type === 'diet');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// 获取饮食计划图标
const getIcon = (plan) => {
  try {
    const meta = JSON.parse(plan.metadata || '{}');
    return meta.icon || '🍽️';
  } catch { return '🍽️'; }
};

// 计算剩余额度
const getRemaining = (plan) => {
  return Math.max(0, plan.target_val - plan.current_val);
};

// 是否超过本周限制
const isOverLimit = (plan) => {
  return plan.current_val >= plan.target_val;
};

// 创建新的饮食限制
const addPlan = async () => {
  if (!newPlan.value.title) return;
  try {
    await api.post('/plans', {
      type: 'diet',
      title: newPlan.value.title,
      target_val: newPlan.value.limit,
      exp_reward: 0,
      metadata: { icon: newPlan.value.icon, period: 'weekly' }
    });
    showAddModal.value = false;
    newPlan.value = { title: '', limit: 2, icon: '🧋' };
    fetchPlans();
  } catch (e) {
    console.error(e);
  }
};

// 消费物品（减少次数）并触发动画
const consumeItem = async (plan, event) => {
  // 视觉反馈：点击处生成漂浮的 "-1"
  if (event) {
    const rect = event.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2; 
    const y = rect.top;
    
    const pId = particleId++;
    floatingParticles.value.push({ id: pId, x, y, text: '-1' });
    setTimeout(() => {
      floatingParticles.value = floatingParticles.value.filter(p => p.id !== pId);
    }, 1000);
  }

  try {
    await api.post(`/plans/${plan.id}/progress`, {
      change_val: 1
    });
    // 本地乐观更新
    plan.current_val += 1;
  } catch (e) {
    console.error(e);
  }
};

onMounted(fetchPlans);
</script>
