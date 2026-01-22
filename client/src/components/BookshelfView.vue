<template>
  <div class="bookshelf-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-text">正在加载书架...</div>
    
    <div v-else class="bookshelf-content">
      <!-- 头部：标题与添加按钮 -->
      <div class="header-row">
        <h1 class="page-title">我的书架</h1>
        <button 
          v-if="readingPlan" 
          @click="showAddModal = true" 
          class="add-btn"
        >
          + 添加书籍
        </button>
      </div>

      <!-- 未创建计划状态 -->
      <div v-if="!readingPlan" class="empty-state">
        <p class="empty-text">你还没有开始 {{ currentYear }} 年的阅读计划。</p>
        <button @click="createReadingPlan" class="create-plan-btn">
          开始阅读计划 (目标: 12 本书)
        </button>
      </div>

      <!-- 书架网格 -->
      <div v-if="readingPlan" class="bookshelf-grid">
        <!-- 书架背景纹理（木质横杠效果） -->
        <div class="shelf-texture"></div>

        <div class="books-grid">
          <!-- 渲染单本书籍 -->
          <div 
            v-for="(book, index) in books" 
            :key="'book-'+index" 
            class="book-item"
          >
            <!-- 书脊/封面效果：支持 3D 旋转 -->
            <div 
              class="book-spine"
              :class="{ 'book-spine--unread': !book.status || book.status === 'todo' }"
            >
              <!-- 封面正面 -->
              <div class="book-cover">
                <img v-if="book.cover" :src="book.cover" class="cover-image" />
                <div v-else class="cover-placeholder">
                  <span class="cover-title">{{ book.title }}</span>
                </div>
                <!-- 光泽效果 -->
                <div class="cover-shine"></div>
                
                <!-- 已读状态标识 -->
                <div v-if="book.status === 'done'" class="done-badge">
                  <CheckIcon :size="12" stroke-width="4" />
                </div>
              </div>
              <!-- 书侧/厚度感（模拟 3D） -->
              <div class="book-side"></div>
            </div>

            <!-- 悬浮操作面板 -->
            <div class="book-actions">
              <!-- 标记读完（仅对待读书籍显示） -->
              <button 
                v-if="!book.status || book.status === 'todo'" 
                @click.stop="completeBook(book)" 
                class="action-btn action-btn--complete"
              >
                已读完
              </button>
              <!-- 删除书籍 -->
              <button 
                @click.stop="removeBook(book)" 
                class="action-btn action-btn--delete" 
                title="删除书籍"
              >
                <Trash2Icon :size="12" />
              </button>
            </div>

            <!-- 底部投影 -->
            <div class="book-shadow"></div>
            
            <!-- 标题文字 -->
            <p 
              class="book-title" 
              :class="{ 'book-title--done': book.status === 'done' }"
            >
              {{ book.title }}
            </p>
          </div>

          <!-- 空插槽（代表剩余可读额度） -->
          <div 
            v-for="n in emptySlots" 
            :key="'empty-'+n" 
            class="empty-slot"
            @click="showAddModal = true"
          >
            <div class="empty-slot-inner">
              <span class="empty-slot-icon">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加书籍弹窗 -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">添加新书</h3>
        
        <input 
          v-model="newBook.title" 
          placeholder="书名" 
          class="modal-input" 
        />
        <input 
          v-model="newBook.cover" 
          placeholder="封面图片链接 (选填)" 
          class="modal-input modal-input--last" 
        />
        
        <div class="modal-actions">
          <button @click="showAddModal = false" class="modal-btn modal-btn--cancel">
            取消
          </button>
          <button @click="addBook" class="modal-btn modal-btn--confirm">
            加入书架
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 页面容器 ==================== */
.bookshelf-container {
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  overflow-y: auto;
}

.bookshelf-content {
  max-width: 56rem;
  margin: 0 auto;
}

.loading-text {
  text-align: center;
  color: #a8a29e;
  margin-top: 2.5rem;
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
  color: #44403c;
}

.add-btn {
  background-color: #a68b6a; /* wood */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-btn:hover {
  background-color: rgba(166, 139, 106, 0.9);
}

/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 5rem 0;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 1rem;
  border: 2px dashed #e7e5e4;
}

.empty-text {
  color: #78716c;
  margin-bottom: 1rem;
}

.create-plan-btn {
  background-color: #fce7f3; /* soft-pink */
  color: #44403c;
  font-weight: 700;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.create-plan-btn:hover {
  background-color: #fecaca; /* red-200 */
}

/* ==================== 书架网格 ==================== */
.bookshelf-grid {
  background-color: #F3EFE0;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 16px solid #D4A373;
  position: relative;
  perspective: 1000px;
}

.shelf-texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.1;
  background-image: linear-gradient(to bottom, transparent 95%, #8B5E3C 95%);
  background-size: 100% 240px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem 2rem;
}

@media (min-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .books-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* ==================== 书籍项 ==================== */
.book-item {
  position: relative;
  perspective: 1000px;
  cursor: pointer;
}

.book-spine {
  width: 100%;
  aspect-ratio: 2 / 3;
  position: relative;
  transform-style: preserve-3d;
  transform-origin: left;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: transform 0.5s ease;
}

.book-spine--unread {
  opacity: 0.8;
}

.book-item:hover .book-spine {
  transform: rotateY(-25deg) translateZ(10px);
}

.book-cover {
  position: absolute;
  inset: 0;
  background-color: white;
  border-radius: 0 2px 2px 0;
  overflow: hidden;
  border-left: 2px solid #e7e5e4;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #312e81; /* indigo-900 */
  color: #c7d2fe; /* indigo-200 */
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-family: serif;
}

.cover-title {
  border-top: 1px solid rgba(199, 210, 254, 0.3);
  border-bottom: 1px solid rgba(199, 210, 254, 0.3);
  padding: 0.5rem 0;
  width: 100%;
}

.cover-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, rgba(255, 255, 255, 0.2), transparent);
  pointer-events: none;
}

.done-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #22c55e; /* green-500 */
  color: white;
  padding: 0.25rem;
  border-radius: 50%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.book-side {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0.75rem;
  transform: translateX(-0.75rem) rotateY(90deg);
  transform-origin: right;
  background-color: #d6d3d1; /* stone-300 */
}

/* ==================== 悬浮操作 ==================== */
.book-actions {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.book-item:hover .book-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn--complete {
  background-color: #22c55e;
  color: white;
}

.action-btn--complete:hover {
  background-color: #16a34a;
}

.action-btn--delete {
  background-color: #ef4444;
  color: white;
  padding: 0.375rem;
}

.action-btn--delete:hover {
  background-color: #dc2626;
}

/* ==================== 书籍阴影和标题 ==================== */
.book-shadow {
  position: absolute;
  bottom: -10px;
  left: 0.5rem;
  right: 0.5rem;
  height: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  filter: blur(8px);
  border-radius: 9999px;
  transform: scaleX(0.9);
  transition: transform 0.5s ease;
}

.book-item:hover .book-shadow {
  transform: scaleX(1);
}

.book-title {
  font-size: 10px;
  text-align: center;
  margin-top: 0.75rem;
  color: #57534e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 0.25rem;
}

.book-title--done {
  text-decoration: line-through;
  opacity: 0.5;
}

/* ==================== 空插槽 ==================== */
.empty-slot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-slot-inner {
  width: 100%;
  aspect-ratio: 2 / 3;
  border: 2px dashed rgba(168, 162, 158, 0.6);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d6d3d1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-slot-inner:hover {
  border-color: #a8a29e;
  color: #a8a29e;
}

.empty-slot-icon {
  font-size: 1.5rem;
  font-weight: 300;
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
  color: #44403c;
  margin-bottom: 1rem;
}

.modal-input {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: #fafaf9;
  border-radius: 0.5rem;
  border: 1px solid #e7e5e4;
  outline: none;
  transition: all 0.2s ease;
}

.modal-input:focus {
  box-shadow: 0 0 0 2px #fce7f3;
}

.modal-input--last {
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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
  background-color: #a68b6a;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(166, 139, 106, 0.2);
}

.modal-btn--confirm:hover {
  background-color: rgba(166, 139, 106, 0.9);
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import confetti from 'canvas-confetti';
import { CheckIcon, Trash2Icon } from 'lucide-vue-next';

const props = defineProps(['user']);
const emit = defineEmits(['update-user']);

const loading = ref(true);
const readingPlan = ref(null);
const showAddModal = ref(false);
const newBook = ref({ title: '', cover: '' });
const currentYear = new Date().getFullYear();

// 从响应式计划数据中提取书籍列表
const books = computed(() => {
  if (!readingPlan.value) return [];
  try {
     const meta = JSON.parse(readingPlan.value.metadata || '{}');
     return meta.books || [];
  } catch(e) { return []; }
});

// 计算剩余空位
const emptySlots = computed(() => {
  if (!readingPlan.value) return 0;
  const count = readingPlan.value.target_val - books.value.length;
  return count > 0 ? count : 0;
});

// 获取所有计划
const fetchPlans = async () => {
  loading.value = true;
  try {
    const res = await api.get('/plans');
    const plans = res.data;
    readingPlan.value = plans.find(p => p.type === 'book');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// 初始化年度阅读计划
const createReadingPlan = async () => {
  try {
    await api.post('/plans', {
      type: 'book',
      title: `${currentYear} 阅读计划`,
      target_val: 12,
      exp_reward: 100,
      metadata: { books: [] }
    });
    fetchPlans();
  } catch (e) {
    console.error(e);
  }
};

// 添加书籍到书架
const addBook = async () => {
  if (!newBook.value.title) return;
  try {
    const res = await api.post(`/plans/${readingPlan.value.id}/add-book`, {
      title: newBook.value.title,
      cover: newBook.value.cover
    });
    if (res.data.success) {
      // 同步本地元数据
      const updatedMeta = JSON.parse(readingPlan.value.metadata || '{}');
      updatedMeta.books = res.data.metadata;
      readingPlan.value.metadata = JSON.stringify(updatedMeta);
      
      showAddModal.value = false;
      newBook.value = { title: '', cover: '' };
      
      emit('update-user'); 
    }
  } catch (e) {
    console.error(e);
  }
};

// 标记书籍为「读完」
const completeBook = async (book) => {
  try {
    const res = await api.post(`/plans/${readingPlan.value.id}/complete-book`, {
      bookTitle: book.title
    });
    if (res.data.success) {
      // 成功庆祝效果：撒花
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4A373', '#8D6E63', '#F7E1E6']
      });

      // 更新本地状态
      const updatedMeta = JSON.parse(readingPlan.value.metadata || '{}');
      updatedMeta.books = res.data.metadata;
      readingPlan.value.metadata = JSON.stringify(updatedMeta);
      readingPlan.value.current_val = res.data.newCurrentVal;
      
      emit('update-user'); // 通知父组件更新用户信息（经验值）
    }
  } catch (e) {
    console.error(e);
  }
};

// 从书架中删除书籍
const removeBook = async (book) => {
  if (!confirm(`确定要将《${book.title}》从书架移除吗？`)) return;
  
  try {
    const res = await api.post(`/plans/${readingPlan.value.id}/delete-book`, {
      bookTitle: book.title
    });
    if (res.data.success) {
      const updatedMeta = JSON.parse(readingPlan.value.metadata || '{}');
      updatedMeta.books = res.data.metadata;
      readingPlan.value.metadata = JSON.stringify(updatedMeta);
      readingPlan.value.current_val = res.data.newCurrentVal;
      
      emit('update-user'); // 如果删除的是已读书籍，需要同步更新经验显示
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(fetchPlans);
</script>
