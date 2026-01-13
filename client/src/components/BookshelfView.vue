<template>
  <div class="h-full w-full p-6 overflow-y-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center text-stone-400 mt-10">正在加载书架...</div>
    
    <div v-else class="max-w-4xl mx-auto">
      <!-- 头部：标题与添加按钮 -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-stone-700">我的书架</h1>
        <button v-if="readingPlan" @click="showAddModal = true" class="bg-wood text-white px-4 py-2 rounded-full shadow-md hover:bg-wood/90 transition">
          + 添加书籍
        </button>
      </div>

      <!-- 未创建计划状态 -->
      <div v-if="!readingPlan" class="text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-stone-200">
        <p class="text-stone-500 mb-4">你还没有开始 {{ currentYear }} 年的阅读计划。</p>
        <button @click="createReadingPlan" class="bg-soft-pink text-stone-700 font-bold px-6 py-2 rounded-full hover:bg-red-200 transition">
          开始阅读计划 (目标: 12 本书)
        </button>
      </div>

      <!-- 书架网格 -->
      <div v-if="readingPlan" class="bg-[#F3EFE0] p-8 rounded-lg shadow-inner border-[16px] border-[#D4A373] relative perspective-container">
        <!-- 书架背景纹理（木质横杠效果） -->
        <div class="absolute inset-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(to bottom, transparent 95%, #8B5E3C 95%); background-size: 100% 240px;">
        </div>

        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-16 gap-x-8">
          
          <!-- 渲染单本书籍 -->
          <div v-for="(book, index) in books" :key="'book-'+index" class="relative group perspective-book cursor-pointer">
             <!-- 书脊/封面效果：支持 3D 旋转 -->
             <div class="book-spine w-full aspect-[2/3] relative transform transition-transform duration-500 book-transform transform-style-3d origin-left shadow-2xl"
                  :class="{ 'opacity-80': !book.status || book.status === 'todo' }">
                <!-- 封面正面 -->
                <div class="absolute inset-0 bg-white rounded-r-sm overflow-hidden border-l-2 border-stone-200">
                    <img v-if="book.cover" :src="book.cover" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-indigo-900 text-indigo-200 p-2 text-center text-xs font-serif">
                       <span class="border-y border-indigo-200/30 py-2 w-full">{{ book.title }}</span>
                    </div>
                    <!-- 光泽效果 -->
                    <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                    
                    <!-- 已读状态标识 -->
                    <div v-if="book.status === 'done'" class="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                       <CheckIcon :size="12" stroke-width="4" />
                    </div>
                </div>
                <!-- 书侧/厚度感（模拟 3D） -->
                <div class="absolute left-0 top-0 bottom-0 w-3 -translate-x-3 bg-stone-300 origin-right transform rotate-y-90"></div>
             </div>

             <!-- 悬浮操作面板 -->
             <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <!-- 标记读完（仅对待读书籍显示） -->
                <button v-if="!book.status || book.status === 'todo'" @click.stop="completeBook(book)" class="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg hover:bg-green-600 transform hover:scale-110 transition">
                  已读完
                </button>
                <!-- 删除书籍 -->
                <button @click.stop="removeBook(book)" class="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transform hover:scale-110 transition" title="删除书籍">
                  <Trash2Icon :size="12" />
                </button>
             </div>

             <!-- 底部投影 -->
             <div class="absolute bottom-[-10px] left-2 right-2 h-4 bg-black/20 blur-md rounded-full transform scale-x-90 group-hover:scale-x-100 transition-transform duration-500"></div>
             
             <!-- 标题文字 -->
             <p class="text-[10px] text-center mt-3 text-stone-600 truncate px-1" :class="{ 'line-through opacity-50': book.status === 'done' }">
                {{ book.title }}
             </p>
          </div>

          <!-- 空插槽（代表剩余可读额度） -->
          <div v-for="n in emptySlots" :key="'empty-'+n" class="relative group flex items-center justify-center">
             <div class="w-full aspect-[2/3] border-2 border-dashed border-stone-300/60 rounded-md flex items-center justify-center text-stone-300 hover:border-stone-400 hover:text-stone-400 transition cursor-pointer"
                  @click="showAddModal = true">
                <span class="text-2xl font-light">+</span>
             </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 添加书籍弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-xl font-bold text-stone-700 mb-4">添加新书</h3>
        
        <input v-model="newBook.title" placeholder="书名" class="w-full mb-3 p-3 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-soft-pink" />
        <input v-model="newBook.cover" placeholder="封面图片链接 (选填)" class="w-full mb-6 p-3 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-soft-pink" />
        
        <div class="flex justify-end gap-3">
          <button @click="showAddModal = false" class="px-4 py-2 text-stone-400 hover:text-stone-600">取消</button>
          <button @click="addBook" class="px-6 py-2 bg-wood text-white rounded-full font-bold hover:bg-wood/90 transition shadow-lg shadow-wood/20">加入书架</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 3D 透视容器 */
.perspective-container {
  perspective: 1000px;
}
.perspective-book {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
/* 悬浮时的向左旋转 3D 效果 */
.group:hover .book-transform {
  transform: rotateY(-25deg) translateZ(10px);
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
