export interface TypographyToken {
  class: string;
  size: string;
  example: string;
}

export interface ColorToken {
  class: string;
  hex: string;
  usage: string;
  textColor: 'white' | 'dark';
}

export interface SpacingToken {
  class: string;
  size: string;
  description: string;
}

export interface BorderRadiusToken {
  class: string;
  size: string;
}

export const typographyTokens: TypographyToken[] = [
  {
    class: 'text-sm',
    size: '12-14px',
    example: 'This is small text - used for captions and labels',
  },
  {
    class: 'text-base',
    size: '16px',
    example: 'This is base text - used for body content',
  },
  {
    class: 'text-lg',
    size: '18px',
    example: 'This is large text - used for emphasis',
  },
  {
    class: 'font-semibold',
    size: '600 weight',
    example: 'This is semibold text - used for headings',
  },
];

export const colorTokens: ColorToken[] = [
  {
    class: 'indigo-500',
    hex: '#6366f1',
    usage: 'Primary actions',
    textColor: 'white',
  },
  {
    class: 'indigo-600',
    hex: '#4f46e5',
    usage: 'Hover states',
    textColor: 'white',
  },
  {
    class: 'slate-900',
    hex: '#0f172a',
    usage: 'Headings',
    textColor: 'white',
  },
  {
    class: 'slate-800',
    hex: '#1e293b',
    usage: 'Body text',
    textColor: 'white',
  },
  {
    class: 'slate-600',
    hex: '#475569',
    usage: 'Secondary text',
    textColor: 'white',
  },
  {
    class: 'slate-200',
    hex: '#e2e8f0',
    usage: 'Borders, dividers',
    textColor: 'dark',
  },
];

export const spacingTokens: SpacingToken[] = [
  {
    class: 'gap-2',
    size: '0.5rem (8px)',
    description: 'Tight spacing',
  },
  {
    class: 'gap-4',
    size: '1rem (16px)',
    description: 'Default spacing',
  },
  {
    class: 'gap-6',
    size: '1.5rem (24px)',
    description: 'Comfortable spacing',
  },
  {
    class: 'gap-8',
    size: '2rem (32px)',
    description: 'Loose spacing',
  },
];

export const borderRadiusTokens: BorderRadiusToken[] = [
  {
    class: 'rounded-lg',
    size: '0.5rem (8px)',
  },
  {
    class: 'rounded-xl',
    size: '0.75rem (12px)',
  },
  {
    class: 'rounded-2xl',
    size: '1rem (16px)',
  },
  {
    class: 'rounded-3xl',
    size: '1.5rem (24px)',
  },
];
