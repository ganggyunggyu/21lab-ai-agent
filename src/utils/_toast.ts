/**
 * TDS Toast 패턴 기반 토스트 알림 시스템
 *
 * @example
 * toast.success('저장되었습니다');
 * toast.error('오류가 발생했습니다', { duration: 5000 });
 * toast.warning('주의가 필요합니다', { closable: true });
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  closable?: boolean;
  position?: ToastPosition;
}

interface ToastConfig {
  duration?: number;
  closable?: boolean;
  position?: ToastPosition;
}

const ICONS: Record<ToastType, string> = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-close-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

let toastContainer: HTMLElement | null = null;
const activeToasts: Set<HTMLElement> = new Set();

const getContainer = (position: ToastPosition): HTMLElement => {
  const containerId = `toast-container-${position}`;
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = `toast-container toast-container-${position}`;
    document.body.appendChild(container);
  }

  return container;
};

const createToast = (options: ToastOptions) => {
  const {
    message,
    type = 'info',
    duration = 3000,
    closable = false,
    position = 'top',
  } = options;

  const container = getContainer(position);

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Icon
  const iconWrapper = document.createElement('span');
  iconWrapper.className = 'toast-icon-wrapper';
  iconWrapper.innerHTML = ICONS[type];
  toast.appendChild(iconWrapper);

  // Message
  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  // Close button
  if (closable) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close-btn';
    closeBtn.innerHTML = CLOSE_ICON;
    closeBtn.setAttribute('aria-label', '닫기');
    closeBtn.onclick = () => removeToast(toast, container);
    toast.appendChild(closeBtn);
  }

  container.appendChild(toast);
  activeToasts.add(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });
  });

  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast, container);
    }, duration);
  }

  return toast;
};

const removeToast = (toast: HTMLElement, container: HTMLElement) => {
  if (!activeToasts.has(toast)) return;

  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');

  setTimeout(() => {
    activeToasts.delete(toast);
    toast.remove();

    // Remove container if empty
    if (container.children.length === 0) {
      container.remove();
    }
  }, 200);
};

export const toast = {
  success: (message: string, config?: ToastConfig) =>
    createToast({ message, type: 'success', ...config }),
  error: (message: string, config?: ToastConfig) =>
    createToast({ message, type: 'error', ...config }),
  warning: (message: string, config?: ToastConfig) =>
    createToast({ message, type: 'warning', ...config }),
  info: (message: string, config?: ToastConfig) =>
    createToast({ message, type: 'info', ...config }),
};

export const message = toast;
