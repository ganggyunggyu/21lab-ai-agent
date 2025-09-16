import { api } from './_axios';

export type UploadTextItem = {
  ok: boolean;
  filename: string;
  length?: number;
  preview?: string;
  full_text?: string;
  error?: string;
};

export type UploadTextsRes = {
  ok: boolean;
  count: number;
  results: UploadTextItem[];
};

/**
 * 다중 txt 업로드
 * - files: File | File[] | FileList 모두 지원
 * - 서버 라우트: POST /analysis/upload-text  (field name: "files")
 */
export const uploadTextApi = async (
  files: File | File[] | FileList
): Promise<UploadTextsRes> => {
  const arr: File[] =
    files instanceof FileList
      ? Array.from(files)
      : Array.isArray(files)
      ? files
      : [files];

  const form = new FormData();
  arr.forEach((f) => form.append('files', f, f.name));

  const { data } = await api.post<UploadTextsRes>(
    '/analysis/upload-text',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};
