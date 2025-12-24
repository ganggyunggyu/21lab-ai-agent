import { storeToRefs } from 'pinia';
import { useBotStore } from '../stores/botStore';
import { useBotLog } from './useBotLog';
import { axiosInstance } from '@/app/config';

const authApi = axiosInstance;

export const useBotLogin = () => {
  const botStore = useBotStore();
  const { addLog } = useBotLog();

  const {
    sessionId,
    cookies,
    loginStatus,
    isLoginLoading,
    useManualAccount,
    currentAccount,
  } = storeToRefs(botStore);

  const handleLogin = async () => {
    if (isLoginLoading.value) return;

    const account = currentAccount.value;
    if (!account?.id || !account?.password) {
      addLog(
        'ERROR',
        '계정 정보가 없습니다',
        useManualAccount.value
          ? '아이디/비밀번호를 입력하세요'
          : 'ACCOUNTS 배열에 계정을 추가하세요'
      );
      return;
    }

    isLoginLoading.value = true;
    loginStatus.value = 'LOGGING_IN';
    addLog('INFO', '네이버 로그인 시도 중...', `계정: ${account.id}`);

    try {
      const response = await authApi.post('/auth/naver/login', {
        id: account.id,
        password: account.password,
      });

      const {
        success,
        sessionId: sid,
        cookies: responseCookies,
        message,
        error,
      } = response.data;

      if (success) {
        sessionId.value = sid;
        cookies.value = responseCookies || null;
        loginStatus.value = 'LOGGED_IN';
        addLog('SUCCESS', '네이버 로그인 성공', message);
        if (responseCookies) {
          addLog(
            'INFO',
            '쿠키 저장 완료',
            `${Object.keys(responseCookies).length}개`
          );
        }
      } else {
        loginStatus.value = 'ERROR';
        addLog('ERROR', '네이버 로그인 실패', error || message);
      }
    } catch (error: unknown) {
      const axiosError = error as { code?: string; message?: string };
      loginStatus.value = 'ERROR';
      if (
        !(
          axiosError.code === 'ECONNABORTED' ||
          axiosError.message?.includes('timeout')
        )
      ) {
        addLog('ERROR', '네이버 로그인 실패', axiosError.message);
      }
    } finally {
      isLoginLoading.value = false;
    }
  };

  const handleLogout = async () => {
    if (isLoginLoading.value) return;

    isLoginLoading.value = true;
    addLog('INFO', '네이버 로그아웃 시도 중...');

    try {
      if (sessionId.value) {
        await authApi.post('/auth/naver/logout', { sessionId: sessionId.value });
      }
      sessionId.value = null;
      cookies.value = null;
      loginStatus.value = 'LOGGED_OUT';
      addLog('SUCCESS', '네이버 로그아웃 완료');
    } catch (error: unknown) {
      addLog(
        'WARNING',
        '로그아웃 API 에러 (로컬 세션은 삭제됨)',
        (error as { message?: string }).message
      );
      sessionId.value = null;
      cookies.value = null;
      loginStatus.value = 'LOGGED_OUT';
    } finally {
      isLoginLoading.value = false;
    }
  };

  const checkAuthApiHealth = async () => {
    try {
      const response = await authApi.get('/auth/naver/health');
      if (response.data?.status === 'ok') {
        addLog('SUCCESS', 'Auth API 연결됨', authApi.defaults.baseURL);
      }
    } catch {
      addLog(
        'WARNING',
        'Auth API 연결 실패',
        `${authApi.defaults.baseURL} - 백엔드 서버 실행 필요`
      );
    }
  };

  return {
    handleLogin,
    handleLogout,
    checkAuthApiHealth,
  };
};
