# 复方方年度计划 (Fufangfang Annual Plan)

“复方方年度计划”是一个基于 Vue 3 和 Node.js 构建的个人管理系统，旨在帮助自律管理。系统包含阅读管理、饮食控制以及积分奖励机制，通过游戏化的方式激励用户达成年度目标。

## 核心功能

*   **📚 书架 (Bookshelf)**
    *   管理年度阅读书单。
    *   追踪书籍阅读状态（未读、进行中、已读）。
    
*   **🍽️ 厨房 (Kitchen)**
    *   饮食摄入管理。
    *   设定特定食物（如奶茶、甜点）的每周限量。
    *   记录每日饮食打卡。

*   **🎁 奖励商店 (Reward Shop)**
    *   通过完成阅读和饮食任务获取经验值 (EXP)。
    *   使用 EXP 兑换心愿奖励。

*   **👤 个人中心**
    *   实时展示用户等级和 EXP 进度。
    *   持有道具与个人概览。

## 技术栈

*   **前端**: 
    *   Framworks: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
    *   Styling: [Tailwind CSS](https://tailwindcss.com/)
*   **后端**: 
    *   Runtime: [Node.js](https://nodejs.org/) (Express)
    *   Database: [SQLite](https://www.sqlite.org/) (轻量级文件数据库)
*   **工具**:
    *   Version Control: Git
    *   CI/CD: GitHub Actions

## 📂 目录结构

```
AntigravityProject/
├── client/                 # 前端 Vue 项目源码
│   ├── src/                # 页面组件与逻辑
│   └── dist/               # 构建后的静态文件
├── server/                 # 后端 Express 服务源码
│   ├── fufangfang.db       # SQLite 数据库文件
│   └── server.js           # 服务端入口
├── .github/workflows/      # 自动部署脚本
└── README.md               # 项目说明文档
```

## 🚀 本地开发指南

### 1. 环境准备
请确保您的电脑已安装 Node.js (建议 v18 或更高版本)。

### 2. 启动后端服务
后端服务运行在 `3000` 端口。

```bash
# 进入 server 目录
cd server

# 安装依赖
npm install

# 启动服务
npm run dev
# 或者: node server.js
```

### 3. 启动前端应用
前端开发服务器运行在 `5173` 端口。

```bash
# 新开一个终端窗口，进入 client 目录
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

现在，您可以访问 `http://localhost:5173` 查看项目。

## 🚢 部署指南 (GitHub Actions + 阿里云)

本项目已配置 CI/CD 流程，代码推送到 `main` 分支时会自动部署到阿里云服务器。

### 1. 服务器准备
在您的阿里云服务器上：
1.  **安装环境**: 确保已安装 Node.js 和 npm。
2.  **安装 PM2**: 用于进程守护。
    ```bash
    npm install -g pm2
    ```
3.  **创建目录**: 确保目标部署路径存在（默认为 `/var/www/antigravity`）。
    ```bash
    mkdir -p /var/www/antigravity
    ```

### 2. 配置 GitHub Secrets
在 GitHub 仓库的 **Settings > Secrets and variables > Actions** 中添加以下密钥：

| Secret Name       | 说明                              |
|-------------------|-----------------------------------|
| `ALIYUN_HOST`     | 服务器公网 IP 地址                  |
| `ALIYUN_USER`     | 登录用户名 (通常为 root)           |
| `ALIYUN_SSH_KEY`  | 服务器的 SSH 私钥 (PEM 格式)       |

*(注意: `ALIYUN_SSH_KEY` 是推荐方式，如果不使用密钥，可配置 `ALIYUN_PASSWORD` 并修改 deploy.yml 文件)*

### 3. 服务端配置 (首次部署后)
首次部署成功后，建议登录服务器配置 PM2 以便后台运行：

```bash
cd /var/www/antigravity/server

# 安装正式环境依赖
npm install --production

# 启动服务
pm2 start server.js --name "antigravity-api"

# 保存当前进程列表，确保重启服务器后自动启动
pm2 save
```

后续的代码更新会自动重启此服务（需要在 `deploy.yml` 中根据实际情况微调重启命令）。
