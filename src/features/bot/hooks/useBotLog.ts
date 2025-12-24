import { ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useBotStore } from '../stores/botStore';
import type { LogType, LogEntry } from '@/types';

// 싱글톤 ref - 여러 번 호출해도 동일한 ref 유지
const logContainer = ref<HTMLElement | null>(null);

export const useBotLog = () => {
  const botStore = useBotStore();
  const { logs } = storeToRefs(botStore);

  const addLog = (type: LogType, message: string, detail?: string) => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      message,
      detail,
      timestamp: Date.now(),
    };
    logs.value.push(entry);
    if (logs.value.length > 100) logs.value = logs.value.slice(-100);
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  };

  const clearLogs = () => {
    logs.value = [];
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const getLogBgClass = (type: LogType) =>
    ({
      INFO: 'bg-blue-500/10',
      SUCCESS: 'bg-emerald-500/10',
      ERROR: 'bg-red-500/15',
      WARNING: 'bg-amber-500/10',
    }[type]);

  const getLogTextClass = (type: LogType) =>
    ({
      INFO: 'text-blue-400',
      SUCCESS: 'text-emerald-400',
      ERROR: 'text-red-400',
      WARNING: 'text-amber-400',
    }[type]);

  const getLogIcon = (type: LogType) =>
    ({ INFO: 'ℹ️', SUCCESS: '✅', ERROR: '❌', WARNING: '⚠️' }[type]);

  return {
    logContainer,
    addLog,
    clearLogs,
    formatTime,
    getLogBgClass,
    getLogTextClass,
    getLogIcon,
  };
};
