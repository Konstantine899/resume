// Main component
export { Code } from './ui/Code';

// UI components (для переиспользования)
export { CodeInlineUi } from './ui/CodeInlineUi';
export type { CodeInlineUiProps } from './ui/CodeInlineUi';
export { CodeBlockUi } from './ui/CodeBlock/CodeBlock';
export { CodeBlockHeader } from './ui/CodeBlockHeader/CodeBlockHeader';

// Constants
export { CODE_CONSTANTS, CODE_DEFAULTS, CODE_SIZES, CODE_VARIANTS } from './model/constants';

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
