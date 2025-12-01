type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const createToast = (options: ToastOptions) => {
  const { message, type = 'info', duration = 3000 } = options;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
};

export const toast = {
  success: (message: string, duration?: number) =>
    createToast({ message, type: 'success', duration }),
  error: (message: string, duration?: number) =>
    createToast({ message, type: 'error', duration }),
  warning: (message: string, duration?: number) =>
    createToast({ message, type: 'warning', duration }),
  info: (message: string, duration?: number) =>
    createToast({ message, type: 'info', duration }),
};

export const message = toast;
