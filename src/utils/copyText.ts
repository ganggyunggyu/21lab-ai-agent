
export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false;

    // 1) 표준 API (보안 컨텍스트)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 2) Fallback (비보안/구형 브라우저)
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // 화면 밖 배치
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length); // iOS 대응

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};