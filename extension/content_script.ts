console.log('[21Lab AI Agent] Content script loaded on Naver Blog');

const isNaverBlogEditor = (): boolean => {
  const url = window.location.href;
  return url.includes('blog.naver.com') && (
    url.includes('postwrite') ||
    url.includes('PostWrite') ||
    url.includes('editor')
  );
};

const init = (): void => {
  if (isNaverBlogEditor()) {
    console.log('[21Lab AI Agent] Naver Blog Editor detected');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
