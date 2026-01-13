require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 初始化数据库
initDb();

// --- 辅助函数 ---
const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay(); // 0 是周日
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整周日的情况
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
};

// --- 路由接口 ---

// 登录接口
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 简单验证：查询数据库中匹配的用户
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

    if (user) {
        // 登录成功，返回用户信息 (在实际生产中应返回 Token)
        res.json({ success: true, user });
    } else {
        res.status(401).json({ error: '用户名或密码错误' });
    }
});

// 获取用户信息
app.get('/api/user', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    res.json(user);
});

// 获取所有计划
app.get('/api/plans', (req, res) => {
    const plans = db.prepare('SELECT * FROM plans WHERE user_id = 1').all();

    // 如果需要，通过计算数据增强计划信息
    const enhancedPlans = plans.map(plan => {
        if (plan.type === 'diet') {
            // 计算本周的使用情况
            const startOfWeek = getStartOfWeek();
            const usage = db.prepare(`
        SELECT SUM(change_val) as total 
        FROM plan_logs 
        WHERE plan_id = ? AND created_at >= ?
      `).get(plan.id, startOfWeek);

            return { ...plan, current_val: usage.total || 0 };
        }
        return plan;
    });

    res.json(enhancedPlans);
});

// 创建新计划
app.post('/api/plans', (req, res) => {
    const { type, title, target_val, exp_reward, metadata } = req.body;
    const info = db.prepare(`
    INSERT INTO plans (user_id, type, title, target_val, current_val, exp_reward, metadata)
    VALUES (1, ?, ?, ?, 0, ?, ?)
  `).run(type, title, target_val, exp_reward, JSON.stringify(metadata || {}));

    res.json({ id: info.lastInsertRowid });
});

// 更新进度（例如：吃了一顿餐）
app.post('/api/plans/:id/progress', (req, res) => {
    const planId = req.params.id;
    const { change_val } = req.body; // 通常为 1

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
    if (!plan) return res.status(404).json({ error: '找不到计划' });

    // 记录日志
    db.prepare('INSERT INTO plan_logs (plan_id, change_val) VALUES (?, ?)').run(planId, change_val);

    let newCurrentVal = plan.current_val + change_val;
    let expGained = 0;

    // 逻辑调整：通用进度更新暂不直接给书籍加经验，书籍有专门的 complete-book 接口
    if (plan.type === 'book') {
        db.prepare('UPDATE plans SET current_val = ? WHERE id = ?').run(newCurrentVal, planId);
        if (newCurrentVal >= plan.target_val) {
            expGained = plan.exp_reward;
        }
    } else if (plan.type === 'diet') {
        // 饮食计划：每周限制。进度在日志中统计，此处不更新 current_val 字段（由 get 接口动态计算）
    }

    // 更新用户经验值
    if (expGained > 0) {
        db.prepare('UPDATE users SET current_exp = current_exp + ? WHERE id = 1').run(expGained);
    }

    res.json({ success: true, expGained });
});

// 获取所有奖励
app.get('/api/rewards', (req, res) => {
    const rewards = db.prepare('SELECT * FROM rewards').all();
    res.json(rewards);
});

// 添加新奖励
app.post('/api/rewards', (req, res) => {
    const { title, cost_exp, icon } = req.body;
    db.prepare('INSERT INTO rewards (title, cost_exp, icon) VALUES (?, ?, ?)').run(title, cost_exp, icon);
    res.json({ success: true });
});

// 兑换奖励
app.post('/api/rewards/redeem', (req, res) => {
    const { id } = req.body;
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();

    if (user.current_exp >= reward.cost_exp) {
        db.prepare('UPDATE users SET current_exp = current_exp - ? WHERE id = 1').run(reward.cost_exp);
        res.json({ success: true, new_exp: user.current_exp - reward.cost_exp });
    } else {
        res.status(400).json({ error: '经验值不足' });
    }
});

// 向阅读计划中添加书籍（存入 metadata）- 此时不增加经验
app.post('/api/plans/:id/add-book', (req, res) => {
    const planId = req.params.id;
    const { title, cover } = req.body;

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
    if (!plan) return res.status(404).json({ error: '找不到计划' });

    let metadata = JSON.parse(plan.metadata || '{}');
    if (!metadata.books) metadata.books = [];

    // 添加新书，初始状态为 'todo'
    metadata.books.push({
        title,
        cover,
        status: 'todo',
        added_at: new Date().toISOString()
    });

    db.prepare('UPDATE plans SET metadata = ? WHERE id = ?')
        .run(JSON.stringify(metadata), planId);

    res.json({ success: true, metadata: metadata.books });
});

// 标记阅读计划中的书籍为已完成 -> 此时获取经验值
app.post('/api/plans/:id/complete-book', (req, res) => {
    const planId = req.params.id;
    const { bookTitle } = req.body;

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
    if (!plan) return res.status(404).json({ error: '找不到计划' });

    let metadata = JSON.parse(plan.metadata || '{}');
    // 支持匹配 status 为 'todo' 或 缺失状态（旧数据）的书籍
    const book = metadata.books.find(b => b.title === bookTitle && (!b.status || b.status === 'todo'));

    if (!book) return res.status(400).json({ error: '找不到此书或该书已标记完成' });

    // 更新状态
    book.status = 'done';
    book.completed_at = new Date().toISOString();

    const expPerBook = 20; // 完成一本书的经验奖励
    const newCurrentVal = plan.current_val + 1;
    const isPlanComplete = newCurrentVal >= plan.target_val;

    let totalExpChange = expPerBook;
    if (isPlanComplete && plan.current_val < plan.target_val) {
        totalExpChange += plan.exp_reward; // 如果达到了年度计划的总目标值，给予额外奖励
    }

    db.prepare('UPDATE plans SET current_val = ?, metadata = ? WHERE id = ?')
        .run(newCurrentVal, JSON.stringify(metadata), planId);

    db.prepare('UPDATE users SET current_exp = current_exp + ? WHERE id = 1').run(totalExpChange);

    res.json({ success: true, newCurrentVal, totalExpChange, metadata: metadata.books });
});

// 从阅读计划中删除书籍
app.post('/api/plans/:id/delete-book', (req, res) => {
    const planId = req.params.id;
    const { bookTitle } = req.body;

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
    if (!plan) return res.status(404).json({ error: '找不到计划' });

    let metadata = JSON.parse(plan.metadata || '{}');
    if (!metadata.books) return res.status(400).json({ error: '计划中没有书籍' });

    const bookIndex = metadata.books.findIndex(b => b.title === bookTitle);
    if (bookIndex === -1) return res.status(404).json({ error: '找不到此书' });

    const removedBook = metadata.books[bookIndex];
    metadata.books.splice(bookIndex, 1);

    // 如果删除的是已完成的书籍，则回退计划的总完成数
    let newCurrentVal = plan.current_val;
    if (removedBook.status === 'done') {
        newCurrentVal = Math.max(0, plan.current_val - 1);
    }

    db.prepare('UPDATE plans SET current_val = ?, metadata = ? WHERE id = ?')
        .run(newCurrentVal, JSON.stringify(metadata), planId);

    res.json({ success: true, newCurrentVal, metadata: metadata.books });
});

app.listen(PORT, () => {
    console.log(`服务端运行在 http://localhost:${PORT}`);
});
