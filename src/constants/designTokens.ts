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

// 21Lab Design System - CSS Variables 기반
export const COLORS = {
  // Brand
  primary: 'var(--color-primary)',
  primaryHover: 'var(--color-primary-hover)',
  accent: 'var(--color-accent)',
  navy: 'var(--color-navy)',

  // Text
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textTertiary: 'var(--color-text-tertiary)',
  textDisabled: 'var(--color-text-disabled)',

  // Background
  bgPrimary: 'var(--color-bg-primary)',
  bgSecondary: 'var(--color-bg-secondary)',
  bgTertiary: 'var(--color-bg-tertiary)',

  // Border
  borderPrimary: 'var(--color-border-primary)',
  borderSecondary: 'var(--color-border-secondary)',

  // Semantic
  success: 'var(--color-success)',
  urgent: 'var(--color-urgent)',
  cautious: 'var(--color-cautious)',
} as const;

export const colorTokens: ColorToken[] = [
  {
    class: 'primary',
    hex: '#62C2B0',
    usage: 'Primary actions, links',
    textColor: 'white',
  },
  {
    class: 'primary-hover',
    hex: '#4FA99A',
    usage: 'Hover states',
    textColor: 'white',
  },
  {
    class: 'accent',
    hex: '#F3C969',
    usage: 'Accent highlights',
    textColor: 'dark',
  },
  {
    class: 'navy',
    hex: '#191F28',
    usage: 'Dark backgrounds, headings',
    textColor: 'white',
  },
  {
    class: 'success',
    hex: '#00C471',
    usage: 'Success states',
    textColor: 'white',
  },
  {
    class: 'urgent',
    hex: '#F04452',
    usage: 'Error states',
    textColor: 'white',
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
