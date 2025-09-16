import type { Message } from '@/types/_chat';
import type { FavoriteSearch } from '@/entities/published';

export const convertMessageToFavoriteSearch = (message: Message): FavoriteSearch => {
  const now = new Date();

  return {
    id: message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    keyword: message.keyword || '키워드 없음',
    refMsg: message.ref,
    title: message.keyword || '제목 없음',
    createdAt: message.timestamp ? new Date(message.timestamp) : now,
    isPublished: true,
    resultSample: message.role === 'bot'
      ? message.content.slice(0, 100) + (message.content.length > 100 ? '...' : '')
      : undefined,
    memo: '',
    blogId: '',

    isActive: true,
    isVisible: false,
    exposureRank: 0,

    userMessageId: message.role === 'user' ? message.id : undefined,
    botMessageId: message.role === 'bot' ? message.id : undefined,
    botContent: message.role === 'bot' ? message.content : undefined,
    service: message.service,
    originalTimestamp: message.timestamp,
  };
};

export const convertMessagePairToFavoriteSearch = (
  userMessage: Message,
  botMessage?: Message
): FavoriteSearch => {
  const now = new Date();

  return {
    id: userMessage.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    keyword: userMessage.keyword || '키워드 없음',
    refMsg: userMessage.ref,
    title: userMessage.keyword || '제목 없음',
    createdAt: userMessage.timestamp ? new Date(userMessage.timestamp) : now,
    isPublished: true,
    resultSample: botMessage
      ? botMessage.content.slice(0, 100) + (botMessage.content.length > 100 ? '...' : '')
      : undefined,
    memo: '',
    blogId: '',

    isActive: true,
    isVisible: false,
    exposureRank: 0,

    userMessageId: userMessage.id,
    botMessageId: botMessage?.id,
    botContent: botMessage?.content,
    service: userMessage.service || botMessage?.service,
    originalTimestamp: userMessage.timestamp,
  };
};