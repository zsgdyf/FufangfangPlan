const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const dbPath = path.resolve(__dirname, 'fufangfang.db');
const db = new Database(dbPath);

/**
 * 初始化数据库表结构
 */
function initDb () {
  // 用户表：存储个人信息和经验值
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT,
      level INTEGER DEFAULT 1,
      current_exp INTEGER DEFAULT 0
    )
  `).run();

  // 计划表：存储年度目标、书籍计划、饮食限制等
  // metadata 字段以 JSON 字符串形式存储额外信息（如封面图、具体限制：{limit: 2, period: 'weekly'}）
  db.prepare(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 类型：'book' (书籍), 'diet' (饮食), 'generic' (普通)
      title TEXT NOT NULL,
      target_val INTEGER DEFAULT 0,  -- 目标值
      current_val INTEGER DEFAULT 0, -- 当前累计值
      exp_reward INTEGER DEFAULT 10, -- 达成后的经验奖励
      metadata TEXT, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `).run();

  // 计划日志表：记录每次进度的变更（用于统计本周饮食消耗等）
  db.prepare(`
    CREATE TABLE IF NOT EXISTS plan_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      change_val INTEGER NOT NULL, -- 变更数值
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans (id)
    )
  `).run();

  // 奖励表（愿望清单）：存储可以用经验值兑换的项目
  db.prepare(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      cost_exp INTEGER NOT NULL, -- 所需经验值
      icon TEXT
    )
  `).run();

  // 如果没有用户，插入初始测试用户
  const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
  if (!user) {
    db.prepare('INSERT INTO users (name, avatar, level, current_exp) VALUES (?, ?, ?, ?)').run('浮方方', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', 1, 0);
  }
}

module.exports = {
  db,
  initDb
};
