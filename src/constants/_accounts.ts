export interface AccountPreset {
  name: string;
  id: string;
  password: string;
  mvpn?: string;
}

export const ACCOUNT_PRESETS: AccountPreset[] = [
  // gkgb6060
  {
    name: '레플전용',
    id: 'boy848',
    password: 'jito308154',
    mvpn: 'gkgb6060',
  },
  {
    name: '타래',
    id: 'dhfosk1p',
    password: 'dhtksk1pp',
    mvpn: 'gkgb6060',
  },
  {
    name: '핫바 - 준4',
    id: 'ecjroe6558',
    password: 'skg10i03',
    mvpn: 'gkgb6060',
  },
  {
    name: '빨간모자앤 - 준3',
    id: 'dhtksk1p',
    password: 'dhtksk1pp',
    mvpn: 'gkgb6060',
  },
  // gkgb9900
  {
    name: 'chill guy - 준3',
    id: 'dlfgydnjs1p',
    password: 'dlfgydnjs1ppa12',
    mvpn: 'gkgb9900',
  },
  {
    name: '정의 - 준4',
    id: 'eqsdxv2863',
    password: '1ll2$8rl',
    mvpn: 'gkgb9900',
  },
  {
    name: '찐찐찐찐찐이야',
    id: 'ags2oigb',
    password: 'dlrbghdqudtls',
    mvpn: 'gkgb9900',
  },
  // gkgb4040
  {
    name: '에스앤비안과-준4',
    id: 'vocabulary1215',
    password: 'AKFALWK12',
    mvpn: 'gkgb4040',
  },
  {
    name: '에스앤비안과-준6',
    id: 'zoeofx5611',
    password: 'ddito3088',
    mvpn: 'gkgb4040',
  },
  // gkgb6600
  {
    name: '토토로-준3',
    id: 'tjthtjs5p',
    password: 'tjthtjs7pp',
    mvpn: 'gkgb6600',
  },
  {
    name: '지구탐구생활-준5',
    id: 'wd6edn3b',
    password: 'akfalwk12',
    mvpn: 'gkgb6600',
  },
  {
    name: '부활 - 준6',
    id: 'ihut9094',
    password: 'AKFALWK12',
    mvpn: 'gkgb6600',
  },
  {
    name: '으라차차-준3',
    id: '3goc9xkq',
    password: 'akfalwk12',
    mvpn: 'gkgb6600',
  },
  {
    name: '글로벌',
    id: 'gmezz',
    password: 'sadito0006',
    mvpn: 'gkgb6600',
  },
  {
    name: '새로운',
    id: 'zhuwl',
    password: 'akfalwk12',
    mvpn: 'gkgb6600',
  },
  {
    name: '으리의리',
    id: 'enugii',
    password: 'sadito0229!',
    mvpn: 'gkgb6600',
  },
  {
    name: '이야기',
    id: 'nnhha',
    password: 'akfalwk12',
    mvpn: 'gkgb6600',
  },
  // gkgb660
  {
    name: '얼음땡 - 준4',
    id: 'cookie4931',
    password: 'akfalwk12!',
    mvpn: 'gkgb660',
  },
  {
    name: '투디치과 스킨블',
    id: 'wound12567',
    password: 'akfalwk12',
    mvpn: 'gkgb660',
  },
  {
    name: '토토리토',
    id: 'precede1451',
    password: 'akfalwk12!!',
    mvpn: 'gkgb660',
  },
  // gkgb5050
  {
    name: '도그마루(강아지) - 웨드',
    id: 'weddindg1218',
    password: 'akfalwk12!',
    mvpn: 'gkgb5050',
  },
  {
    name: '도그마루(강아지) - 에일리',
    id: 'alien8118',
    password: 'akfalwk12',
    mvpn: 'gkgb5050',
  },
  {
    name: '도그마루(고양이) - 마이블',
    id: 'disadvantage6171',
    password: 'akfalwk12',
    mvpn: 'gkgb5050',
  },
  {
    name: '운명의 마법사',
    id: 'dyulp',
    password: 'sadito0229!',
    mvpn: 'gkgb5050',
  },
  {
    name: '맛집 탐험대',
    id: 'lesyt',
    password: 'sadito0229!',
    mvpn: 'gkgb5050',
  },
  {
    name: '먹방 여행기',
    id: 'aryunt',
    password: 'sadito0229!',
    mvpn: 'gkgb5050',
  },
  // gkgb5005
  {
    name: '라우드',
    id: 'loand3324',
    password: 'akfalwk123!',
    mvpn: 'gkgb5005',
  },
  {
    name: '고구마스틱',
    id: 'fail5644',
    password: 'akfalwk11!',
    mvpn: 'gkgb5005',
  },
  {
    name: '룰루랄라',
    id: 'compare14310',
    password: 'akfalwk112!',
    mvpn: 'gkgb5005',
  },
  // 테스트 계정
  {
    name: '테스트1',
    id: 'ganggyunggyu',
    password: '12Qwaszx!@',
  },
  {
    name: '테스트2',
    id: 'akepzkthf12',
    password: '12qwaszx',
  },
  {
    name: '테스트3',
    id: 'qwzx8019',
    password: '12Qwaszx!@',
  },
  {
    name: '테스트4',
    id: 'qwzx16',
    password: '12Qwaszx!@',
  },
];

export const ACCOUNT_OPTIONS = ACCOUNT_PRESETS.map((account) => ({
  label: `${account.name} (${account.id})`,
  value: account.id,
}));
