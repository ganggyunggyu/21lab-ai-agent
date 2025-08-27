import axios from 'axios';
import { API_BASE_URL } from '../app/config/env';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true, // 쿠키 필요하면 활성화
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const msg =
      data?.error ||
      data?.message ||
      error?.message ||
      `HTTP Error${status ? ` ${status}` : ''}`;
    return Promise.reject(new Error(msg));
  }
);
