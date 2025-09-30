const INVALID_CHAR_PATTERN = /[<>:"/\\|?*\u0000-\u001F]/g;

export const sanitizeFileName = (value: string): string => {
  const fallback = 'result';
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const cleaned = trimmed
    .replace(INVALID_CHAR_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '');

  return cleaned.length > 0 ? cleaned : fallback;
};
