import { createDiscreteApi } from 'naive-ui';
import { copyToClipboard } from '../utils/_clipboard';
import { downloadText } from '../utils/_downloadText';
import { downloadZip, type ZipFileItem } from '../utils/_downloadZip';
import { sanitizeFileName } from '../utils/_sanitizeFileName';
import {
  MSG_COPY_SUCCESS,
  MSG_COPY_FAIL,
  MSG_DOWNLOAD_SUCCESS,
  MSG_DOWNLOAD_FAIL,
  MSG_ZIP_DOWNLOAD_FAIL,
  MSG_ZIP_DOWNLOAD_SUCCESS,
} from '../constants/_texts';
import type { Message } from '../types/_chat';

export const useChatActions = () => {
  const { message } = createDiscreteApi(['message']);

  const copyMsg = async (text: string, msgObj?: any) => {
    try {
      await copyToClipboard(text);

      if (msgObj?.keyword) {
        const truncatedKeyword = msgObj.keyword.length > 30
          ? msgObj.keyword.slice(0, 30) + '...'
          : msgObj.keyword;
        message.success(`"${truncatedKeyword}" ${msgObj.role === 'user' ? '키워드' : '응답'}이 복사되었습니다`);
      } else {
        message.success(MSG_COPY_SUCCESS);
      }
    } catch {
      message.error(MSG_COPY_FAIL);
    }
  };

  const handleDownloadClick = (msg: Message) => {
    try {
      const safeKeyword = sanitizeFileName(msg.keyword || 'message');
      const fileName = `${safeKeyword}-${
        msg.content.replace(/\s/g, '').length
      }`;
      const content = msg.content;
      downloadText({ fileName, content });
      message.success(MSG_DOWNLOAD_SUCCESS);
    } catch {
      message.error(MSG_DOWNLOAD_FAIL);
    }
  };

  const downloadChatHistory = (exportChat: () => string) => {
    try {
      const chatData = exportChat();
      const fileName = `chat-history_${
        new Date().toISOString().split('T')[0]
      }.json`;
      downloadText({ fileName, content: chatData });
      message.success('채팅 내역이 다운로드되었습니다');
    } catch {
      message.error('채팅 내역 다운로드에 실패했습니다');
    }
  };

  const downloadZipFiles = async (files: ZipFileItem[], zipName: string) => {
    if (files.length === 0) return;

    try {
      await downloadZip({ files, zipName });
      message.success(MSG_ZIP_DOWNLOAD_SUCCESS);
    } catch {
      message.error(MSG_ZIP_DOWNLOAD_FAIL);
    }
  };

  return {
    copyMsg,
    handleDownloadClick,
    downloadChatHistory,
    downloadZipFiles,
  };
};
