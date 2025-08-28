import { createDiscreteApi } from 'naive-ui';
import { copyToClipboard } from '../utils/clipboard';
import { downloadText } from '../utils/downloadText';
import {
  MSG_COPY_SUCCESS,
  MSG_COPY_FAIL,
  MSG_DOWNLOAD_SUCCESS,
  MSG_DOWNLOAD_FAIL,
} from '../constants/texts';
import type { Message } from '../types/chat';

export const useChatActions = () => {
  const { message } = createDiscreteApi(['message']);

  const copyMsg = async (text: string) => {
    try {
      await copyToClipboard(text);
      message.success(MSG_COPY_SUCCESS);
    } catch {
      message.error(MSG_COPY_FAIL);
    }
  };

  const handleDownloadClick = (msg: Message) => {
    const fileName = `${msg.keyword || 'message'}_${msg.content.trim().length}`;
    try {
      downloadText({ fileName, content: msg.content });
      message.success(MSG_DOWNLOAD_SUCCESS);
    } catch {
      message.error(MSG_DOWNLOAD_FAIL);
    }
  };

  const downloadChatHistory = (exportChat: () => string) => {
    try {
      const chatData = exportChat();
      const fileName = `chat-history_${new Date().toISOString().split('T')[0]}.json`;
      downloadText({ fileName, content: chatData });
      message.success('채팅 내역이 다운로드되었습니다');
    } catch {
      message.error('채팅 내역 다운로드에 실패했습니다');
    }
  };

  return {
    copyMsg,
    handleDownloadClick,
    downloadChatHistory,
  };
};