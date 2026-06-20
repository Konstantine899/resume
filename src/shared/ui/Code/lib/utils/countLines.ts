import { extractTextFromNode } from './extractTextFromNode';

/**
 * Подсчитывает количество строк в React.ReactNode
 * Использует extractTextFromNode для извлечения текста и подсчёта строк
 */
export const countLines = (node: React.ReactNode): number => {
  const text = extractTextFromNode(node);
  if (text.length === 0) return 0;
  return text.split('\n').length;
};

export default countLines;
