import { storeToRefs } from 'pinia';
import JSZip from 'jszip';
import { useBotStore } from '../stores/botStore';
import { useBotLog } from './useBotLog';
import { axiosInstance } from '@/app/config';
import type { UploadedFolder } from '@/types';

const authApi = axiosInstance;

export const useFolderUpload = () => {
  const botStore = useBotStore();
  const { addLog } = useBotLog();
  const { uploadedFolderList, isUploading, isDragOver } = storeToRefs(botStore);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    isDragOver.value = true;
  };

  const handleDragLeave = () => {
    isDragOver.value = false;
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    isDragOver.value = false;
    const items = e.dataTransfer?.items;
    if (!items) return;

    addLog('INFO', `드랍된 아이템 수: ${items.length}`);

    const dirEntries: FileSystemDirectoryEntry[] = [];
    for (const item of Array.from(items)) {
      addLog('INFO', `아이템 kind: ${item.kind}, type: ${item.type}`);
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        addLog(
          'INFO',
          `Entry: ${entry?.name || 'null'}`,
          `isDirectory: ${entry?.isDirectory}, isFile: ${entry?.isFile}`
        );
        if (entry?.isDirectory) {
          dirEntries.push(entry as FileSystemDirectoryEntry);
        }
      }
    }

    addLog('INFO', `수집된 디렉토리 수: ${dirEntries.length}`);

    for (const dirEntry of dirEntries) {
      addLog('INFO', `처리 시작: ${dirEntry.name}`);
      await processDirectory(dirEntry);
    }
  };

  const processDirectory = async (dirEntry: FileSystemDirectoryEntry) => {
    addLog('INFO', `[processDirectory] 시작: ${dirEntry.name}`);

    const folder: UploadedFolder = {
      name: dirEntry.name,
      manuscriptFile: null,
      imageFiles: [],
    };

    const readEntries = (
      reader: FileSystemDirectoryReader
    ): Promise<FileSystemEntry[]> =>
      new Promise((resolve, reject) => reader.readEntries(resolve, reject));

    const getFile = (fileEntry: FileSystemFileEntry): Promise<File> =>
      new Promise((resolve, reject) => fileEntry.file(resolve, reject));

    const processEntry = async (entry: FileSystemEntry, path = '') => {
      if (entry.isFile) {
        const file = await getFile(entry as FileSystemFileEntry);
        addLog(
          'INFO',
          `[${folder.name}] 파일 발견: ${file.name}`,
          `path: ${path}`
        );
        if (file.name.endsWith('.txt')) {
          folder.manuscriptFile = file;
        } else if (
          file.type.startsWith('image/') ||
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
        ) {
          folder.imageFiles.push(file);
        }
      } else if (entry.isDirectory) {
        addLog(
          'INFO',
          `[${folder.name}] 서브폴더: ${entry.name}`,
          `path: ${path}`
        );
        const entries = await readEntries(
          (entry as FileSystemDirectoryEntry).createReader()
        );
        for (const subEntry of entries) {
          await processEntry(subEntry, path + entry.name + '/');
        }
      }
    };

    const entries = await readEntries(dirEntry.createReader());
    addLog('INFO', `[${folder.name}] entries 수: ${entries.length}`);

    for (const entry of entries) {
      await processEntry(entry);
    }

    if (folder.manuscriptFile || folder.imageFiles.length > 0) {
      uploadedFolderList.value.push(folder);
      addLog(
        'SUCCESS',
        `폴더 추가 완료: ${folder.name}`,
        `원고: ${folder.manuscriptFile ? '있음' : '없음'}, 이미지: ${folder.imageFiles.length}개`
      );
    } else {
      addLog('WARNING', `폴더 스킵: ${folder.name}`, '원고/이미지 없음');
    }
  };

  const removeFolder = (index: number) => {
    const removed = uploadedFolderList.value.splice(index, 1);
    if (removed.length > 0) {
      addLog('INFO', `폴더 제거: ${removed[0].name}`);
    }
  };

  const clearFolderList = () => {
    uploadedFolderList.value = [];
    addLog('INFO', '폴더 목록 초기화');
  };

  const handleUploadFolders = async () => {
    console.log('handleUploadFolders called', uploadedFolderList.value.length);
    addLog('INFO', '업로드 버튼 클릭됨');

    if (uploadedFolderList.value.length === 0) {
      addLog('ERROR', '업로드할 폴더가 없습니다');
      return;
    }

    isUploading.value = true;
    addLog(
      'INFO',
      'ZIP 압축 및 업로드 시작...',
      `${uploadedFolderList.value.length}개 폴더`
    );

    try {
      const zip = new JSZip();

      for (const folder of uploadedFolderList.value) {
        const folderZip = zip.folder(folder.name);
        if (!folderZip) continue;

        if (folder.manuscriptFile) {
          folderZip.file(
            `${folder.name}.txt`,
            await folder.manuscriptFile.text()
          );
        }

        if (folder.imageFiles.length > 0) {
          const imagesFolder = folderZip.folder('images');
          for (const img of folder.imageFiles) {
            imagesFolder?.file(img.name, await img.arrayBuffer());
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const formData = new FormData();
      formData.append('file', zipBlob, 'manuscripts.zip');

      const response = await authApi.post('/bot/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      const { success, uploaded = 0, message, error } = response.data;

      if (success) {
        addLog('SUCCESS', '업로드 완료', `${uploaded}개 폴더 업로드됨`);
        uploadedFolderList.value = [];
      } else {
        addLog('ERROR', '업로드 실패', error || message);
      }
    } catch (error: unknown) {
      addLog('ERROR', '업로드 실패', (error as { message?: string }).message);
    } finally {
      isUploading.value = false;
    }
  };

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFolder,
    clearFolderList,
    handleUploadFolders,
  };
};
