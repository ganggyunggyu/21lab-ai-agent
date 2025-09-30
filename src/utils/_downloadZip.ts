import JSZip from 'jszip';

export interface ZipFileItem {
  fileName: string;
  content: string;
}

interface DownloadZipParams {
  files: ZipFileItem[];
  zipName: string;
}

export const downloadZip = async ({ files, zipName }: DownloadZipParams) => {
  const zip = new JSZip();

  files.forEach(({ fileName, content }) => {
    const normalizedName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    zip.file(normalizedName, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
};
