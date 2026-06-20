/**
 * Извлекает текст из React.ReactNode (включая JSX)
 * Используется для копирования кода в буфер обмена
 */
export const extractTextFromNode = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (typeof node === 'bigint') return node.toString();
  if (typeof node === 'boolean') return '';
  if (node === null || node === undefined) return '';

  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).join('');
  }

  if (typeof node === 'object' && 'props' in node) {
    const reactNode = node as React.ReactElement;
    const props = reactNode.props as { children?: React.ReactNode };
    return extractTextFromNode(props.children);
  }

  return '';
};

export default extractTextFromNode;
