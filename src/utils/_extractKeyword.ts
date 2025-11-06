/**
 * 긴 텍스트에서 간단한 제목/키워드만 추출하는 유틸리티
 */

/**
 * 원고 하단의 "키워드:" 부분을 찾아서 추출, 없으면 첫 줄 제목 사용
 */
export const extractKeywordDisplay = (text: string): string => {
  if (!text) return '';

  // 1. 텍스트 전체에서 "키워드:" 패턴 찾기
  const keywordMatch = text.match(/키워드\s*[:：]\s*([^\n]+)/i);

  if (keywordMatch && keywordMatch[1]) {
    let extracted = keywordMatch[1].trim();

    // "업체명:", "주소:" 등 다른 라벨 전까지만 추출
    extracted = extracted.split(/(?:업체명|주소|영업시간|평일|주말|주차)\s*[:：]/i)[0].trim();

    // 괄호가 있으면 괄호 앞부분만
    const beforeParenthesis = extracted.split('(')[0].trim();
    return beforeParenthesis || extracted;
  }

  // 2. "키워드:"가 없으면 첫 줄 사용
  let firstLine = text.split('\n')[0].trim();

  // "제목:" 라벨 제거
  firstLine = firstLine.replace(/^제목\s*[:：]\s*/i, '').trim();

  // "업체명:", "주소:" 등 다른 라벨 전까지만 추출
  firstLine = firstLine.split(/(?:업체명|주소|영업시간|평일|주말|주차)\s*[:：]/i)[0].trim();

  // 괄호가 있으면 괄호 앞부분만
  const beforeParenthesis = firstLine.split('(')[0].trim();

  return beforeParenthesis || firstLine;
};
