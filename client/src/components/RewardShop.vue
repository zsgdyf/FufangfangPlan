<template>
  <div class="h-full w-full p-6 bg-[#FDFBF7] overflow-y-auto">
    <div class="max-w-4xl mx-auto">
      <!-- 头部：标题与添加新奖励按钮 -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-stone-700">心愿商店</h1>
        <button @click="showAddModal = true" class="bg-soft-pink text-stone-700 font-bold px-4 py-2 rounded-full shadow-md hover:bg-pink-200 transition">
          + 添加奖励
        </button>
      </div>

      <!-- 奖励列表网格 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="reward in rewards" :key="reward.id" class="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col items-center">
           <div class="text-4xl mb-4 p-4 bg-stone-50 rounded-full">{{ reward.icon || '🎁' }}</div>
           <h3 class="font-bold text-stone-700 text-center">{{ reward.title }}</h3>
           <p class="text-soft-pink font-bold mt-1 text-sm">{{ reward.cost_exp }} EXP</p>
           
           <!-- 兑换按钮：经验值不足时禁用 -->
           <button @click="redeem(reward)" class="mt-4 w-full py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
             :disabled="user.current_exp < reward.cost_exp">
             兑换
           </button>
        </div>
      </div>
    </div>

    <!-- 添加奖励弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-xl font-bold text-stone-700 mb-4">添加新奖励</h3>
        <input v-model="newReward.title" placeholder="奖励名称" class="w-full mb-3 p-3 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-soft-pink" />
        <input v-model.number="newReward.cost_exp" type="number" placeholder="所需经验值 (EXP)" class="w-full mb-3 p-3 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-soft-pink" />
        <input v-model="newReward.icon" placeholder="Emoji 图标" class="w-full mb-6 p-3 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-soft-pink" />

        <div class="flex justify-end gap-3">
          <button @click="showAddModal = false" class="px-4 py-2 text-stone-400 hover:text-stone-600">取消</button>
          <button @click="addReward" class="px-6 py-2 bg-soft-pink text-stone-800 rounded-full font-bold hover:bg-pink-200 transition">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import confetti from 'canvas-confetti';

const props = defineProps(['user']);
const emit = defineEmits(['update-user']);

const rewards = ref([]);
const showAddModal = ref(false);
const newReward = ref({ title: '', cost_exp: 20, icon: '💆‍♀️' });

// 获取所有商店奖励
const fetchRewards = async () => {
  const res = await api.get('/rewards');
  rewards.value = res.data;
};

// 添加新奖励项
const addReward = async () => {
  if (!newReward.value.title) return;
  await api.post('/rewards', newReward.value);
  showAddModal.value = false;
  fetchRewards();
};

// 兑换奖励逻辑
const redeem = async (reward) => {
  if (!confirm(`确定要消耗 ${reward.cost_exp} EXP 兑换「${reward.title}」吗？`)) return;
  try {
    const res = await api.post('/rewards/redeem', { id: reward.id });
    if (res.data.success) {
      // 兑换成功：撒花特效
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      emit('update-user'); // 更新父组件用户信息
    }
  } catch (e) {
    alert(e.response?.data?.error || '错误');
  }
};

onMounted(fetchRewards);
</script>
