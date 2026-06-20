// Main component
export { Code } from './ui/Code';

// UI components (для переиспользования)
export { CodeInlineUi } from './ui/CodeInline';
export { CodeBlockUi } from './ui/CodeBlock';
export { CodeBlockHeader } from './ui/CodeBlockHeader';

// Hooks
export { useCopyCode } from './lib/hooks/useCopyCode';

// Types
export type {
  CodeProps,
  CodeInlineProps,
  CodeBlockProps,
  CodeSize,
  CodeVariant,
  CodeLanguage,
  CodeIcons,
} from './model/types';

// Utils
export { countLines } from './lib/utils/countLines';
export { extractTextFromNode } from './lib/utils/extractTextFromNode';
