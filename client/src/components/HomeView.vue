<template>
  <div class="h-full w-full p-6 bg-[#FDFBF7] overflow-y-auto">
    <div class="max-w-4xl mx-auto">
      
      <!-- 欢迎标语 -->
      <div class="mb-10 text-center">
        <h1 class="text-3xl font-bold text-stone-700 mb-2">早安，{{ user.name }}</h1>
        <p class="text-stone-500">今天也是充满可能的一天，准备好完成你的计划了吗？</p>
      </div>

      <!-- 概览卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- 书房卡片 -->
        <div @click="$emit('change-tab', 'bookshelf')" 
             class="group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-stone-100">
           <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition">
             <BookOpenIcon :size="100" class="text-wood" />
           </div>
           
           <div class="relative z-10">
             <div class="w-12 h-12 bg-wood/10 rounded-full flex items-center justify-center mb-4 text-wood">
               <BookOpenIcon :size="24" />
             </div>
             <h2 class="text-xl font-bold text-stone-700 mb-1">我的书房</h2>
             <p class="text-xs text-stone-400 mb-6">沉浸在知识的海洋</p>
             
             <div class="bg-stone-50 rounded-xl p-4">
               <div class="flex justify-between text-sm mb-2">
                 <span class="text-stone-600 font-medium">年度阅读进度</span>
                 <span class="text-wood font-bold">{{ readingStats.current }} / {{ readingStats.target }}</span>
               </div>
               <div class="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                 <div class="h-full bg-wood transition-all duration-1000" :style="{ width: readingStats.percentage + '%' }"></div>
               </div>
             </div>
           </div>
        </div>

        <!-- 厨房卡片 -->
        <div @click="$emit('change-tab', 'kitchen')"
             class="group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-stone-100">
           <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition">
             <UtensilsIcon :size="100" class="text-teal-600" />
           </div>
           
           <div class="relative z-10">
             <div class="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-4 text-teal-600">
               <UtensilsIcon :size="24" />
             </div>
             <h2 class="text-xl font-bold text-stone-700 mb-1">我的厨房</h2>
             <p class="text-xs text-stone-400 mb-6">保持健康的饮食习惯</p>
             
             <div class="bg-stone-50 rounded-xl p-4">
               <div class="flex justify-between text-sm mb-2">
                 <span class="text-stone-600 font-medium">本周限制项</span>
                 <span class="text-teal-600 font-bold">{{ dietStats.activeCount }} 项进行中</span>
               </div>
               <div class="flex gap-2 mt-2 overflow-hidden">
                  <span v-for="(icon, i) in dietStats.icons" :key="i" class="text-lg bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm">{{ icon }}</span>
                  <span v-if="dietStats.icons.length === 0" class="text-xs text-stone-400 self-center">暂无限制</span>
               </div>
             </div>
           </div>
        </div>

        <!-- 商店卡片 (宽版) -->
        <div @click="$emit('change-tab', 'shop')"
             class="md:col-span-2 group relative bg-gradient-to-r from-soft-pink to-pink-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
           
           <div class="flex justify-between items-center relative z-10">
             <div>
               <div class="flex items-center gap-3 mb-2">
                 <div class="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-pink-500">
                   <ShoppingBagIcon :size="20" />
                 </div>
                 <h2 class="text-xl font-bold text-stone-800">心愿商店</h2>
               </div>
               <p class="text-stone-600 text-sm">用你的努力兑换奖励吧！</p>
             </div>
             
             <div class="text-right">
               <p class="text-xs text-stone-500 font-medium uppercase tracking-wider">当前可用</p>
               <p class="text-3xl font-extrabold text-stone-800">{{ user.current_exp }} <span class="text-sm font-medium text-stone-600">EXP</span></p>
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

const readingStats = computed(() => {
  const bookPlan = plans.value.find(p => p.type === 'book');
  if (!bookPlan) return { current: 0, target: 0, percentage: 0 };
  
  // 对于书籍，current_val 是 metadata 中状态为 done 的数量，或者后端维护的数值
  // 假设后端维护的 current_val 已经是完成数
  const pct = Math.min((bookPlan.current_val / bookPlan.target_val) * 100, 100);
  return {
    current: bookPlan.current_val,
    target: bookPlan.target_val,
    percentage: pct
  };
});

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

onMounted(async () => {
  try {
    const res = await api.get('/plans');
    plans.value = res.data;
  } catch (e) {
    console.error(e);
  }
});
</script>
