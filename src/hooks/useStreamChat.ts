import { ref } from 'vue';
import type { ChatService } from '@/types';

interface StreamChatOptions {
  service: ChatService;
  keyword: string;
  ref?: string;
}

interface StreamState {
  content: string;
  isStreaming: boolean;
  error: string | null;
  manuscriptId: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

export const useStreamChat = () => {
  const streamState = ref<StreamState>({
    content: '',
    isStreaming: false,
    error: null,
    manuscriptId: null,
  });

  let abortController: AbortController | null = null;

  const startStream = async (
    options: StreamChatOptions,
    onChunk?: (chunk: string, fullContent: string) => void,
    onComplete?: (fullContent: string, manuscriptId: string | null) => void,
    onError?: (error: Error) => void
  ) => {
    // 이전 스트림 취소
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    streamState.value = {
      content: '',
      isStreaming: true,
      error: null,
      manuscriptId: null,
    };

    try {
      const response = await fetch(`${API_URL}/generate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: options.service,
          keyword: options.keyword,
          ref: options.ref || '',
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 형식 파싱: data: 텍스트\n\n
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            // 종료 신호
            if (data === '[DONE]') {
              streamState.value.isStreaming = false;
              onComplete?.(streamState.value.content, streamState.value.manuscriptId);
              return;
            }

            // JSON 메타데이터 체크 (manuscriptId 등)
            if (data.startsWith('{') && data.endsWith('}')) {
              try {
                const meta = JSON.parse(data);
                if (meta._id) {
                  streamState.value.manuscriptId = meta._id;
                }
                continue;
              } catch {
                // JSON 파싱 실패하면 일반 텍스트로 처리
              }
            }

            // 일반 텍스트 청크
            streamState.value.content += data;
            onChunk?.(data, streamState.value.content);
          }
        }
      }

      // 남은 버퍼 처리
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        if (data !== '[DONE]' && !data.startsWith('{')) {
          streamState.value.content += data;
          onChunk?.(data, streamState.value.content);
        }
      }

      streamState.value.isStreaming = false;
      onComplete?.(streamState.value.content, streamState.value.manuscriptId);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        streamState.value.isStreaming = false;
        return;
      }

      streamState.value.error = (error as Error).message;
      streamState.value.isStreaming = false;
      onError?.(error as Error);
    }
  };

  const stopStream = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    streamState.value.isStreaming = false;
  };

  const resetStream = () => {
    stopStream();
    streamState.value = {
      content: '',
      isStreaming: false,
      error: null,
      manuscriptId: null,
    };
  };

  return {
    streamState,
    startStream,
    stopStream,
    resetStream,
  };
};
