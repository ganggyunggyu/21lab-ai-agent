export interface AccountPreset {
  name: string;
  id: string;
  password: string;
}

export const ACCOUNT_PRESETS: AccountPreset[] = [
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
    name: '핫바 - 준4',
    id: 'ecjroe6558',
    password: 'skg10i03',
  },
  {
    name: '빨간모자앤 - 준3',
    id: 'dhtksk1p',
    password: 'dhtksk1pp',
  },
  {
    name: '정의 - 준4',
    id: 'eqsdxv2863',
    password: '1ll2$8rl',
  },
  {
    name: '찐찐찐찐찐이야',
    id: 'ags2oigb',
    password: 'dlrbghdqudtls',
  },
  {
    name: '얼음땡 - 준4',
    id: 'cookie4931',
    password: 'akfalwk12!',
  },
  {
    name: '토토리토',
    id: 'precede1451',
    password: 'akfalwk12!!',
  },
  {
    name: '투디치과 스킨블',
    id: 'wound12567',
    password: 'akfalwk12',
  },
  {
    name: '에스앤비안과-준4',
    id: 'vocabulary1215',
    password: 'jito308138',
  },
  {
    name: '에스앤비안과-준6',
    id: 'zoeofx5611',
    password: 'ddito3088',
  },
];

export const ACCOUNT_OPTIONS = ACCOUNT_PRESETS.map((account) => ({
  label: `${account.name} (${account.id})`,
  value: account.id,
}));
