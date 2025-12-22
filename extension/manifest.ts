import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: '21Lab AI Agent',
  version: '1.0.0',
  description: '네이버 블로그 원고 생성 및 관리 도구',

  icons: {
    '16': 'extension/icons/icon16.svg',
    '48': 'extension/icons/icon48.svg',
    '128': 'extension/icons/icon128.svg',
  },

  action: {
    default_title: '21Lab AI Agent',
    default_icon: {
      '16': 'extension/icons/icon16.svg',
      '48': 'extension/icons/icon48.svg',
    },
  },

  side_panel: {
    default_path: 'extension/sidepanel.html',
  },

  background: {
    service_worker: 'extension/service_worker.ts',
    type: 'module',
  },

  content_scripts: [
    {
      matches: ['https://blog.naver.com/*', 'https://*.blog.naver.com/*'],
      js: ['extension/content_script.ts'],
    },
  ],

  permissions: ['storage', 'sidePanel', 'activeTab'],

  host_permissions: [
    'https://blog.naver.com/*',
    'https://*.naver.com/*',
    'https://api.21lab.io/*',
    'http://localhost:*/*',
    'https://blog-analyzer.fly.dev/*',
  ],
});
