<template>
  <div class="bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-100 shadow-sm p-4 flex items-center justify-between">
    <!-- 用户信息区域 -->
    <div class="flex items-center gap-4">
      <div class="relative">
        <img :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'" alt="头像" class="w-12 h-12 rounded-full border-2 border-soft-pink bg-white" />
        <!-- 等级角标 -->
        <div class="absolute -bottom-1 -right-1 bg-wood-light text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
          Lv.{{ user.level }}
        </div>
      </div>
      <div>
        <h2 class="text-lg font-bold text-stone-700">{{ user.name }}</h2>
        <div class="flex items-center gap-2 text-xs text-stone-500">
          <span>经验值</span>
          <div class="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
             <!-- 经验条：这里简单演示，每 100 EXP 进度条满一次 -->
            <div class="h-full bg-gradient-to-r from-soft-pink to-red-300 transition-all duration-500" :style="{ width: `${(user.current_exp % 100)}%` }"></div>
          </div>
          <span>{{ user.current_exp }}</span>
        </div>
      </div>
    </div>

    <!-- 导航标签栏 -->
    <div class="flex gap-1 bg-stone-100/50 p-1 rounded-full">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="$emit('change-tab', tab.id)"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
          currentTab === tab.id ? 'bg-white shadow-sm text-wood-light' : 'text-stone-400 hover:text-stone-600'
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4 inline-block mr-1 mb-0.5" />
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { HomeIcon, BookOpen, Utensils, ShoppingBag } from 'lucide-vue-next';

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

defineEmits(['change-tab']);

// 侧边栏/顶部导航配置
const tabs = [
  { id: 'home', label: '首页', icon: HomeIcon },
  { id: 'bookshelf', label: '书房', icon: BookOpen }, 
  { id: 'kitchen', label: '厨房', icon: Utensils },
  { id: 'shop', label: '商店', icon: ShoppingBag },
];
</script>
