/**
 * Focus Trap Utility
 * Удерживает фокус внутри указанного элемента (для модальных окон, dropdown и т.д.)
 *
 * Ключевые свойства:
 * - список tabbable-кандидатов пересчитывается на КАЖДОЕ нажатие Tab, поэтому
 *   контент, добавленный/удалённый после установки trap, учитывается сразу;
 * - скрытые (без layout-бокса, display:none, [hidden]), disabled, inert и
 *   aria-hidden элементы, а также sentinel-узлы самого trap, никогда не
 *   считаются кандидатами;
 * - если валидных кандидатов нет, фокус удерживается на корне контейнера;
 *   если корень сам не может получать фокус — цикл строится по sentinel-узлам,
 *   которые trap добавляет первым и последним ребёнком контейнера;
 * - focusin, попавший на корень контейнера снаружи, перенаправляется на
 *   первый/последний валидный кандидат; переходы между детьми контейнера
 *   не трогаются.
 */

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/** Атрибут sentinel-узлов trap (граница цикла фокуса при пустом контейнере). */
export const FOCUS_TRAP_SENTINEL_ATTR = 'data-focus-trap-sentinel';

const SENTINEL_SELECTOR = `[${FOCUS_TRAP_SENTINEL_ATTR}]`;

type SentinelPosition = 'start' | 'end';

/**
 * Движок действительно рисует layout?
 * jsdom/happy-dom возвращают пустые rect'ы для ЛЮБОГО элемента (включая body),
 * поэтому offsetParent/getClientRects-эвристики применимы только в браузере.
 */
const hasLayoutEngine = (): boolean =>
  typeof document !== 'undefined' &&
  document.body !== null &&
  document.body.getBoundingClientRect().width > 0;

/**
 * Видим ли элемент (display:none в цепочке предков, [hidden], скрытый
 * visibility, отсутствие layout-бокса).
 */
const isVisible = (element: HTMLElement): boolean => {
  let node: HTMLElement | null = element;
  while (node) {
    if (node.hasAttribute('hidden')) return false;
    if (window.getComputedStyle(node).display === 'none') return false;
    node = node.parentElement;
  }

  // Вычисленное visibility уже учитывает наследование и переопределения.
  const { visibility } = window.getComputedStyle(element);
  if (visibility === 'hidden' || visibility === 'collapse') return false;

  // Эвристики, зависящие от layout, — только когда движок умеет layout.
  if (hasLayoutEngine()) {
    if (element.getClientRects().length === 0) return false;
    const { position } = window.getComputedStyle(element);
    if (element.offsetParent === null && position !== 'fixed') return false;
  }

  return true;
};

/** Валиден ли элемент как tabbable-кандидат внутри trap. */
const isValidTabbable = (element: HTMLElement): boolean =>
  !element.hasAttribute('disabled') &&
  !element.matches(SENTINEL_SELECTOR) &&
  element.closest('[inert]') === null &&
  element.closest('[aria-hidden="true"]') === null &&
  isVisible(element);

/**
 * Находит все фокусируемые элементы внутри контейнера (без проверки видимости)
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
  return Array.from(elements);
};

/**
 * Валидные tabbable-кандидаты контейнера: видимые, не disabled, не inert,
 * не aria-hidden и не sentinel-узлы самого trap.
 * Выполняет свежий запрос в DOM — вызывайте заново при каждом действии.
 */
export const getTabbableElements = (container: HTMLElement): HTMLElement[] =>
  getFocusableElements(container).filter(isValidTabbable);

/** Находит первый ВАЛИДНЫЙ фокусируемый элемент */
export const getFirstFocusableElement = (container: HTMLElement): HTMLElement | null =>
  getTabbableElements(container)[0] ?? null;

/** true, если node идёт после reference в порядке документа. */
const isAfter = (node: Node, reference: Node): boolean =>
  (reference.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

/**
 * Ближайший кандидат перед `from` (backward) или после него (forward);
 * null — если в нужную сторону кандидатов нет.
 */
const nearestCandidate = (
  candidates: HTMLElement[],
  from: HTMLElement,
  backward: boolean
): HTMLElement | null => {
  if (!backward) {
    return candidates.find((candidate) => isAfter(candidate, from)) ?? null;
  }
  for (let index = candidates.length - 1; index >= 0; index--) {
    const candidate = candidates[index];
    if (candidate && isAfter(from, candidate)) return candidate;
  }
  return null;
};

/** Может ли элемент вообще удерживать фокус (корень trap с tabindex и т.п.). */
const canHoldFocus = (element: HTMLElement): boolean =>
  element.matches('button, input, select, textarea, a[href], [tabindex], [contenteditable="true"]');

const createSentinel = (doc: Document, position: SentinelPosition): HTMLElement => {
  const sentinel = doc.createElement('span');
  sentinel.setAttribute(FOCUS_TRAP_SENTINEL_ATTR, position);
  sentinel.setAttribute('tabindex', '-1');
  sentinel.setAttribute('aria-hidden', 'true');
  return sentinel;
};

/** Гарантирует наличие sentinel-узлов первым и последним ребёнком контейнера. */
const ensureSentinels = (container: HTMLElement): [HTMLElement, HTMLElement] => {
  const doc = container.ownerDocument;

  let start = container.querySelector<HTMLElement>(`[${FOCUS_TRAP_SENTINEL_ATTR}="start"]`);
  if (!start) {
    start = createSentinel(doc, 'start');
    container.insertBefore(start, container.firstChild);
  }

  let end = container.querySelector<HTMLElement>(`[${FOCUS_TRAP_SENTINEL_ATTR}="end"]`);
  if (!end) {
    end = createSentinel(doc, 'end');
    container.appendChild(end);
  }

  return [start, end];
};

const removeSentinels = (container: HTMLElement): void => {
  container.querySelectorAll(SENTINEL_SELECTOR).forEach((node) => node.remove());
};

/**
 * Включает trap фокуса внутри элемента
 * @param container - Элемент, внутри которого нужно удерживать фокус
 * @returns Функция для отключения trap
 *
 * @example
 * const untrap = focusTrap(modalElement);
 * // ... позже
 * untrap();
 */
export const focusTrap = (container: HTMLElement | null): (() => void) => {
  if (!container) return () => {};

  const doc = container.ownerDocument;
  const [startSentinel, endSentinel] = ensureSentinels(container);
  let previousFocusTarget: EventTarget | null = null;

  /** Удержание фокуса, когда валидных кандидатов нет. */
  const holdBoundary = (backward: boolean, active: HTMLElement | null): void => {
    if (canHoldFocus(container)) {
      // Корень контейнера сам удерживает фокус — он и есть граница цикла.
      container.focus();
      return;
    }
    // Корень не фокусируется — циклируем между sentinel-узлами.
    let boundary: HTMLElement;
    if (backward) {
      boundary = active === endSentinel ? startSentinel : endSentinel;
    } else {
      boundary = active === startSentinel ? endSentinel : startSentinel;
    }
    boundary.focus();
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    // Свежая выборка на каждое нажатие: DOM мог измениться после установки trap.
    const candidates = getTabbableElements(container);
    const active = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    const backward = event.shiftKey;

    if (candidates.length === 0) {
      event.preventDefault();
      holdBoundary(backward, active);
      return;
    }

    const first = candidates[0];
    const last = candidates[candidates.length - 1];

    if (active && candidates.includes(active)) {
      if (backward && active === first) {
        event.preventDefault();
        last?.focus();
        return;
      }
      if (!backward && active === last) {
        event.preventDefault();
        first?.focus();
        return;
      }
      // Внутри списка кандидатов — даём браузеру перейти естественным порядком:
      // disabled/скрытые элементы между кандидатами пропустит сам браузер.
      return;
    }

    // Фокус стоит на том, что trap не считает tabbable: корень контейнера,
    // sentinel, отфильтрованный элемент или элемент снаружи контейнера.
    event.preventDefault();
    const nearest = active ? nearestCandidate(candidates, active, backward) : null;
    (nearest ?? (backward ? last : first))?.focus();
  };

  const handleFocusIn = (event: FocusEvent): void => {
    const target = event.target;
    const origin = previousFocusTarget;
    previousFocusTarget = target;

    // Фокус внутри детей контейнера (или снаружи контейнера) не трогаем.
    if (target !== container) return;

    // Корень получил фокус извне → перенаправляем на край списка кандидатов.
    const cameFromOutside = !(origin instanceof Node) || !container.contains(origin);
    if (!cameFromOutside) return;

    const candidates = getTabbableElements(container);
    if (candidates.length === 0) return; // корень и есть граница (см. holdBoundary)

    // Пришли из элемента после контейнера — на последний кандидат, иначе на первый.
    const fromAfter = origin instanceof Node && isAfter(origin, container);
    const destination = fromAfter ? candidates[candidates.length - 1] : candidates[0];
    destination?.focus();
  };

  container.addEventListener('keydown', handleKeyDown);
  doc.addEventListener('focusin', handleFocusIn);

  // Возвращаем функцию очистки
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    doc.removeEventListener('focusin', handleFocusIn);
    removeSentinels(container);
  };
};
