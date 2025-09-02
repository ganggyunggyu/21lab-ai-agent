import MarkdownIt from 'markdown-it';
import { MARKDOWN_OPTIONS } from '../constants/_markdown';

const md = new MarkdownIt(MARKDOWN_OPTIONS);

export const renderMarkdown = (raw: string) => md.render(raw);
