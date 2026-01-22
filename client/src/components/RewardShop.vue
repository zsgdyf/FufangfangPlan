<template>
  <div class="shop-container">
    <div class="shop-content">
      <div class="header-row">
        <h1 class="page-title">心愿商店</h1>
        <button @click="showAddModal = true" class="add-btn">+ 添加奖励</button>
      </div>

      <div class="rewards-grid">
        <div v-for="reward in rewards" :key="reward.id" class="reward-card">
          <div class="reward-icon">{{ reward.icon || '🎁' }}</div>
          <h3 class="reward-title">{{ reward.title }}</h3>
          <p class="reward-cost">{{ reward.cost_exp }} EXP</p>
          <button @click="redeem(reward)" class="redeem-btn" :disabled="user.current_exp < reward.cost_exp">兑换</button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">添加新奖励</h3>
        <input v-model="newReward.title" placeholder="奖励名称" class="modal-input" />
        <input v-model.number="newReward.cost_exp" type="number" placeholder="所需经验值" class="modal-input" />
        <input v-model="newReward.icon" placeholder="Emoji 图标" class="modal-input modal-input--last" />
        <div class="modal-actions">
          <button @click="showAddModal = false" class="modal-btn modal-btn--cancel">取消</button>
          <button @click="addReward" class="modal-btn modal-btn--confirm">保存</button>
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

const fetchRewards = async () => { rewards.value = (await api.get('/rewards')).data; };

const addReward = async () => {
  if (!newReward.value.title) return;
  await api.post('/rewards', newReward.value);
  showAddModal.value = false;
  fetchRewards();
};

const redeem = async (reward) => {
  if (!confirm(`确定要消耗 ${reward.cost_exp} EXP 兑换「${reward.title}」吗？`)) return;
  try {
    const res = await api.post('/rewards/redeem', { id: reward.id });
    if (res.data.success) { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); emit('update-user'); }
  } catch (e) { alert(e.response?.data?.error || '错误'); }
};

onMounted(fetchRewards);
</script>

<style scoped>
.shop-container { height: 100%; width: 100%; padding: 1.5rem; background: #FDFBF7; overflow-y: auto; }
.shop-content { max-width: 56rem; margin: 0 auto; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #44403c; }
.add-btn { background: #fce7f3; color: #44403c; font-weight: 700; padding: 0.5rem 1rem; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: none; cursor: pointer; transition: background 0.2s; }
.add-btn:hover { background: #fbcfe8; }
.rewards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
@media (min-width: 768px) { .rewards-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .rewards-grid { grid-template-columns: repeat(4, 1fr); } }
.reward-card { background: white; border-radius: 1rem; padding: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #f5f5f4; display: flex; flex-direction: column; align-items: center; }
.reward-icon { font-size: 2.25rem; margin-bottom: 1rem; padding: 1rem; background: #fafaf9; border-radius: 50%; }
.reward-title { font-weight: 700; color: #44403c; text-align: center; }
.reward-cost { color: #fce7f3; font-weight: 700; margin-top: 0.25rem; font-size: 0.875rem; color: #ec4899; }
.redeem-btn { margin-top: 1rem; width: 100%; padding: 0.5rem; background: #292524; color: white; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; border: none; cursor: pointer; transition: background 0.2s; }
.redeem-btn:hover:not(:disabled) { background: #44403c; }
.redeem-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-content { background: white; border-radius: 1rem; padding: 1.5rem; width: 100%; max-width: 28rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal-title { font-size: 1.25rem; font-weight: 700; color: #44403c; margin-bottom: 1rem; }
.modal-input { width: 100%; margin-bottom: 0.75rem; padding: 0.75rem; background: #fafaf9; border-radius: 0.5rem; border: 1px solid #e7e5e4; outline: none; transition: box-shadow 0.2s; }
.modal-input:focus { box-shadow: 0 0 0 2px #fce7f3; }
.modal-input--last { margin-bottom: 1.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
.modal-btn { padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
.modal-btn--cancel { background: transparent; color: #a8a29e; }
.modal-btn--cancel:hover { color: #57534e; }
.modal-btn--confirm { padding: 0.5rem 1.5rem; background: #fce7f3; color: #292524; }
.modal-btn--confirm:hover { background: #fbcfe8; }
</style>
