/**
 * 마크다운 렌더링 유틸리티
 * 간단한 마크다운 문법을 HTML로 변환
 */

export const renderMarkdown = (content: string): string => {
  if (!content) return '';
  
  return content
    // 헤딩
    .replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>')
    
    // 강조
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="markdown-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="markdown-italic">$1</em>')
    
    // 코드
    .replace(/`(.*?)`/gim, '<code class="markdown-code">$1</code>')
    
    // 링크
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="markdown-link" target="_blank">$1</a>')
    
    // 리스트 (간단한 버전)
    .replace(/^- (.*$)/gim, '<li class="markdown-li">$1</li>')
    
    // 줄바꿈
    .replace(/\n/gim, '<br>');
};

/**
 * 마크다운 콘텐츠 검증
 */
export const validateMarkdown = (content: string): boolean => {
  try {
    renderMarkdown(content);
    return true;
  } catch (error) {
    console.error('Markdown validation failed:', error);
    return false;
  }
};

/**
 * 마크다운 텍스트에서 플레인 텍스트 추출
 */
export const extractPlainText = (markdownContent: string): string => {
  return markdownContent
    .replace(/^#{1,6}\s+/gm, '') // 헤딩 제거
    .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 제거
    .replace(/\*(.*?)\*/g, '$1') // 이탤릭 제거
    .replace(/`(.*?)`/g, '$1') // 코드 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 제거
    .replace(/^- /gm, '') // 리스트 마커 제거
    .trim();
};

/**
 * 마크다운 미리보기용 짧은 텍스트 생성
 */
export const generatePreviewText = (markdownContent: string, maxLength: number = 100): string => {
  const plainText = extractPlainText(markdownContent);
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...'
    : plainText;
};