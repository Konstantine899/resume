/**
 * Извлекает чистый текст из React.ReactNode, рекурсивно обходя JSX-дерево.
 * Поддерживает строки, числа, bigint, boolean, null, undefined, массивы, ReactElement.
 *
 * Для функциональных компонентов без hooks — пытается извлечь текст через вызов функции.
 * Для компонентов с hooks — извлекает текст из props.children (требуется явная передача).
 *
 * @param node - React-узел для извлечения текста
 * @returns Чистый текст без HTML-разметки
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

    // Для функциональных компонентов пытаемся извлечь текст
    if (typeof reactNode.type === 'function') {
      const props = reactNode.props as { children?: React.ReactNode } & Record<string, unknown>;

      // Пробуем вызвать компонент (работает для простых функций без hooks)
      try {
        const componentFn = reactNode.type as React.FC<typeof props>;
        const rendered = componentFn(props);
        // Проверяем, что это не Promise (не async компонент)
        if (rendered && typeof (rendered as Promise<unknown>).then !== 'function') {
          return extractTextFromNode(rendered as React.ReactNode);
        }
      } catch {
        // Компонент использует hooks или контекст — извлекаем из children
      }

      // Fallback: извлекаем из props.children
      return extractTextFromNode(props.children);
    }

    // Для обычных HTML-элементов извлекаем children
    const props = reactNode.props as { children?: React.ReactNode };
    return extractTextFromNode(props.children);
  }

  return '';
};

export default extractTextFromNode;
