import type {
  Draft,
  EventLog,
  StorageData,
  MessageAction,
  MessageResponse,
  DraftStatus,
} from './types';

interface GenerateDraftResponse {
  content?: string;
  _id?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://blog-analyzer.fly.dev';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getStorage = async (): Promise<StorageData> => {
  const { draftQueue = [], eventLog = [] } = await chrome.storage.local.get([
    'draftQueue',
    'eventLog',
  ]);
  return {
    draftQueue,
    eventLog,
  };
};

const saveDrafts = async (drafts: Draft[]): Promise<void> => {
  await chrome.storage.local.set({ draftQueue: drafts });
};

const addLog = async (
  log: Omit<EventLog, 'id' | 'timestamp'>
): Promise<void> => {
  const storage = await getStorage();
  const newLog: EventLog = {
    ...log,
    id: generateId(),
    timestamp: Date.now(),
  };
  const logs = [...storage.eventLog, newLog].slice(-100);
  await chrome.storage.local.set({ eventLog: logs });
};

const generateDraft = async (
  keyword: string,
  refMsg: string,
  service: string
): Promise<Draft> => {
  const id = generateId();
  const now = Date.now();

  const draft: Draft = {
    id,
    keyword,
    refMsg,
    service,
    status: 'GENERATING',
    createdAt: now,
    updatedAt: now,
  };

  const storage = await getStorage();
  await saveDrafts([...storage.draftQueue, draft]);

  await addLog({
    type: 'GENERATE_START',
    draftId: id,
    message: `원고 생성 시작: ${keyword}`,
    data: { service },
  });

  try {
    const endpoint = `${API_BASE_URL}/generate/${service}`;
    console.log('[generateDraft] Fetching:', endpoint);
    console.log('[generateDraft] Payload:', { keyword, ref: refMsg, service });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, ref: refMsg, service }),
    });

    console.log('[generateDraft] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generateDraft] Error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as GenerateDraftResponse;
    const { content = '', _id: manuscriptId } = data;

    const lines = content.split('\n');
    const title = lines[0] || keyword;

    const updatedDraft: Draft = {
      ...draft,
      content,
      title,
      manuscriptId,
      status: 'COMPLETED',
      updatedAt: Date.now(),
    };

    const currentStorage = await getStorage();
    const updatedDrafts = currentStorage.draftQueue.map((draftItem) =>
      draftItem.id === id ? updatedDraft : draftItem
    );
    await saveDrafts(updatedDrafts);

    await addLog({
      type: 'GENERATE_SUCCESS',
      draftId: id,
      message: `원고 생성 완료: ${keyword}`,
      data: { manuscriptId },
    });

    return updatedDraft;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    const errorDraft: Draft = {
      ...draft,
      status: 'ERROR',
      error: errorMessage,
      updatedAt: Date.now(),
    };

    const currentStorage = await getStorage();
    const updatedDrafts = currentStorage.draftQueue.map((draftItem) =>
      draftItem.id === id ? errorDraft : draftItem
    );
    await saveDrafts(updatedDrafts);

    await addLog({
      type: 'GENERATE_ERROR',
      draftId: id,
      message: `원고 생성 실패: ${errorMessage}`,
    });

    return errorDraft;
  }
};

const updateDraftStatus = async (
  id: string,
  status: DraftStatus
): Promise<Draft | null> => {
  const storage = await getStorage();
  const { draftQueue } = storage;
  const draftIndex = draftQueue.findIndex((draftItem) => draftItem.id === id);

  if (draftIndex === -1) return null;

  const updatedDraft: Draft = {
    ...draftQueue[draftIndex],
    status,
    updatedAt: Date.now(),
  };

  const updatedDrafts = [...draftQueue];
  updatedDrafts[draftIndex] = updatedDraft;
  await saveDrafts(updatedDrafts);

  await addLog({
    type: 'STATUS_CHANGE',
    draftId: id,
    message: `상태 변경: ${status}`,
  });

  return updatedDraft;
};

const deleteDraft = async (id: string): Promise<boolean> => {
  const storage = await getStorage();
  const updatedDrafts = storage.draftQueue.filter(
    (draftItem) => draftItem.id !== id
  );
  await saveDrafts(updatedDrafts);
  return true;
};

chrome.runtime.onMessage.addListener(
  (
    message: MessageAction,
    _sender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    const handleMessage = async (): Promise<MessageResponse> => {
      switch (message.type) {
        case 'GENERATE_DRAFT': {
          const { keyword, refMsg, service } = message.payload;
          const draft = await generateDraft(keyword, refMsg || '', service);
          return { success: true, data: draft };
        }

        case 'GET_DRAFTS': {
          const storage = await getStorage();
          return { success: true, data: storage };
        }

        case 'UPDATE_DRAFT_STATUS': {
          const { id, status } = message.payload;
          const draft = await updateDraftStatus(id, status);
          if (draft) {
            return { success: true, data: draft };
          }
          return { success: false, error: 'Draft not found' };
        }

        case 'DELETE_DRAFT': {
          await deleteDraft(message.payload.id);
          return { success: true };
        }

        case 'CLEAR_LOGS': {
          await chrome.storage.local.set({ eventLog: [] });
          return { success: true };
        }

        default:
          return { success: false, error: 'Unknown action' };
      }
    };

    handleMessage()
      .then(sendResponse)
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        sendResponse({ success: false, error: errorMessage });
      });
    return true;
  }
);

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

console.log('21Lab AI Agent Service Worker initialized');
console.log('API_BASE_URL:', API_BASE_URL);
