console.log('[21Lab AI Agent] Content script loaded');

interface LoginPayload {
  id: string;
  password: string;
}

interface ContentMessage {
  type: string;
  payload?: LoginPayload;
}

const isNaverLogin = (): boolean => {
  return window.location.href.includes('nid.naver.com');
};

const isNaverBlogEditor = (): boolean => {
  const url = window.location.href;
  return url.includes('blog.naver.com') && (
    url.includes('postwrite') ||
    url.includes('PostWrite') ||
    url.includes('editor')
  );
};

const executeLogin = async (id: string, password: string): Promise<boolean> => {
  console.log('[21Lab] Executing login for:', id);

  try {
    // 아이디 입력
    const idInput = document.querySelector('#id') as HTMLInputElement;
    if (idInput) {
      idInput.focus();
      idInput.value = id;
      idInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    // 비밀번호 입력
    const pwInput = document.querySelector('#pw') as HTMLInputElement;
    if (pwInput) {
      pwInput.focus();
      pwInput.value = password;
      pwInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    // 로그인 버튼 클릭
    const loginBtn = document.querySelector('.btn_login') as HTMLButtonElement;
    if (loginBtn) {
      loginBtn.click();
      console.log('[21Lab] Login button clicked');
      return true;
    }

    console.error('[21Lab] Login button not found');
    return false;
  } catch (error) {
    console.error('[21Lab] Login error:', error);
    return false;
  }
};

// 메시지 리스너
chrome.runtime.onMessage.addListener(
  (message: ContentMessage, _sender, sendResponse) => {
    console.log('[21Lab] Content script received message:', message.type);

    if (message.type === 'EXECUTE_LOGIN' && message.payload) {
      const { id, password } = message.payload;
      executeLogin(id, password)
        .then((success) => {
          sendResponse({ success });
        })
        .catch(() => {
          sendResponse({ success: false });
        });
      return true;
    }

    return false;
  }
);

const init = (): void => {
  if (isNaverLogin()) {
    console.log('[21Lab AI Agent] Naver Login page detected');
  } else if (isNaverBlogEditor()) {
    console.log('[21Lab AI Agent] Naver Blog Editor detected');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
