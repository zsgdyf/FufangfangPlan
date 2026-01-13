<template>
  <div class="h-full w-full relative overflow-hidden bg-[#E0F2F1]">
    <!-- 背景装饰元素（抽象厨房纹理） -->
    <div class="absolute inset-0 z-0 opacity-20 pointer-events-none" 
         style="background-image: radial-gradient(#B2DFDB 2px, transparent 2px); background-size: 30px 30px;">
    </div>

    <!-- 动画喷泉：这里用于显示消费时的 "-1" 漂浮动画 -->
    <div class="absolute inset-0 z-50 pointer-events-none overflow-hidden">
       <transition-group name="float-up">
         <div v-for="p in floatingParticles" :key="p.id"
              class="absolute text-red-500 font-bold text-2xl"
              :style="{ left: p.x + 'px', top: p.y + 'px' }">
            {{ p.text }}
         </div>
       </transition-group>
    </div>
    
    <div class="relative z-10 w-full h-full p-6 flex flex-col">
       <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-teal-800">我的厨房 (饮食限制)</h1>
        <button @click="showAddModal = true" class="bg-teal-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-teal-500 transition">
          + 新增限制
        </button>
      </div>
      
      <div v-if="loading" class="text-center text-teal-400">正在加载饮食计划...</div>

      <!-- 冰箱布局网格 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        <!-- 饮食条目卡片 -->
        <div v-for="plan in dietPlans" :key="plan.id" 
             class="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-between h-56 border-b-4"
             :class="isOverLimit(plan) ? 'border-red-400' : 'border-teal-400'"
        >
           <h3 class="font-bold text-stone-600 mb-2">{{ plan.title }}</h3>
           
           <!-- 图标按钮：点击表示「吃了一次」 -->
           <button @click="(e) => consumeItem(plan, e)" 
                   class="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center text-4xl shadow-inner hover:scale-105 active:scale-95 transition relative group">
              <span class="group-hover:opacity-100 transition duration-300">{{ getIcon(plan) }}</span>
              <div class="absolute inset-0 rounded-full border-4 border-dashed border-stone-200 group-hover:border-teal-300 transition-colors"></div>
           </button>

           <div class="w-full mt-4">
             <div class="flex justify-between text-xs text-stone-500 mb-1">
               <span>本周已消耗</span>
               <span :class="isOverLimit(plan) ? 'text-red-500 font-bold' : 'text-teal-600 font-bold'">
                 剩余 {{ getRemaining(plan) }} 次
               </span>
             </div>
             <!-- 进度条：已用次数越多，条越长 -->
             <div class="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-500"
                     :class="isOverLimit(plan) ? 'bg-red-400' : 'bg-teal-400'"
                     :style="{ width: `${Math.min((plan.current_val / plan.target_val) * 100, 100)}%` }"
                ></div>
             </div>
             <p class="text-[10px] text-center mt-1 text-stone-400">每周上限：{{ plan.target_val }} 次</p>
           </div>
        </div>
      
        <!-- 空状态 -->
        <div v-if="dietPlans.length === 0" class="col-span-full text-center py-20">
          <p class="text-teal-600 mb-4">没有设置饮食限制。保持自律哦！</p>
        </div>

      </div>
    </div>

    <!-- 添加限制弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-xl font-bold text-teal-800 mb-4">设置每周次数限制</h3>
        
        <input v-model="newPlan.title" placeholder="物品名称 (如：奶茶)" class="w-full mb-3 p-3 bg-teal-50 rounded-lg border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-300 text-stone-700" />
        
        <div class="mb-4">
          <label class="block text-xs text-stone-500 mb-2">每周额度 (次)</label>
          <input v-model.number="newPlan.limit" type="number" min="1" class="w-full p-3 bg-teal-50 rounded-lg border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-300 text-stone-700" />
        </div>

        <div class="mb-6">
           <label class="block text-xs text-stone-500 mb-2">选择图标</label>
           <div class="flex gap-4">
             <button v-for="icon in icons" :key="icon" @click="newPlan.icon = icon"
               class="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition"
               :class="newPlan.icon === icon ? 'border-teal-500 bg-teal-100' : 'border-transparent hover:bg-stone-100'"
             >
               {{ icon }}
             </button>
           </div>
        </div>
        
        <div class="flex justify-end gap-3">
          <button @click="showAddModal = false" class="px-4 py-2 text-stone-400 hover:text-stone-600">取消</button>
          <button @click="addPlan" class="px-6 py-2 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-500 transition shadow-lg shadow-teal-600/20">设定限制</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* "-1" 漂浮动画的过度样式 */
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
