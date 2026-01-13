import axios from 'axios';

/**
 * 封装 Axios 实例
 * 设置基础 URL 以匹配后端的 API 路径
 */
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export default api;
