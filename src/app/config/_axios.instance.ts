import axios from 'axios';

export const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const axiosInstance = axiosConfig;

export const scheduleAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SCHEDULE_API_URL,
});
