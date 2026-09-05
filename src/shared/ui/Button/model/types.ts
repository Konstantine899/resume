// src/shared/ui/Button/model/types.ts

import { ReactNode } from 'react';

/**
 * Варианты визуального стиля кнопки
 * @description Определяет цветовую схему и границы кнопки
 * @example variant="primary" — основная кнопка действия (CTA)
 * @example variant="secondary" — вторичное действие (отмена)
 * @example variant="danger" — деструктивное действие (удаление)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sidebar';

/**
 * Размеры кнопки
 * @description Контролирует padding, font-size и высоту кнопки
 * @example size="xs" — экстра-компактные (12px icon, 0.75rem text)
 * @example size="sm" — компактные кнопки (16px icon, 0.875rem text)
 * @example size="md" — стандартные кнопки (20px icon, 1rem text)
 * @example size="lg" — крупные кнопки (24px icon, 1.125rem text)
 * @example size="xl" — экстра-крупные (28px icon, 1.25rem text)
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Варианты индикатора загрузки
 * @description Определяет тип loader компонента при loading=true
 * @example loadingVariant="spinner" — анимированный spinner (Loader компонент)
 * @example loadingVariant="skeleton" — скелетон заглушка (Skeleton компонент)
 */
export type LoadingVariant = 'spinner' | 'skeleton';

// ============================================
// Base props для всех кнопок
// ============================================

/**
 * Базовые props для всех типов кнопок
 * @description Содержит только props, используемые компонентами Button.
 * Без extends ButtonHTMLAttributes — type и другие button-атрибуты
 * проксируются через PolymorphicProps при as="button".
 * @group Base
 */
interface BaseButtonProps {
  /**
   * Визуальный стиль кнопки
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Размер кнопки
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * HTML type атрибут
   * @default 'button'
   * @description Проксируется только при as="button"
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Отключенное состояние
   * @default false
   * @description Блокирует взаимодействие и добавляет aria-disabled
   */
  disabled?: boolean;

  /**
   * Состояние загрузки
   * @default false
   * @description Скрывает контент и показывает loader
   */
  loading?: boolean;

  /**
   * Тип индикатора загрузки
   * @default 'spinner'
   * @description Выбирает между spinner и skeleton
   */
  loadingVariant?: LoadingVariant;

  /**
   * Растянуть на всю ширину контейнера
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Дополнительный CSS класс
   */
  className?: string;
}

// ============================================
// Button — только текст
// ============================================

/**
 * Props для базовой текстовой кнопки
 * @description Кнопка только с текстовым контентом
 * @group Button
 *
 * @example
 * <Button variant="primary" size="lg" onClick={handleSubmit}>
 *   Отправить
 * </Button>
 *
 * @example
 * <Button loading>Loading...</Button>
 */
export interface ButtonProps extends BaseButtonProps {
  /**
   * Текстовый контент кнопки
   * @required
   */
  children: ReactNode;

  /**
   * Не используется для Button
   * @internal
   */
  leftIcon?: undefined;

  /**
   * Не используется для Button
   * @internal
   */
  rightIcon?: undefined;

  /**
   * Не используется для Button
   * @internal
   */
  ariaLabel?: undefined;
}

// ============================================
// IconButton — только иконка
// ============================================

/**
 * Props для кнопки-иконки
 * @description Кнопка содержащая только иконку (без текста)
 * @group IconButton
 * @accessibility Требует обязательный ariaLabel для скринридеров
 *
 * @example
 * <IconButton
 *   icon={<Mail size={20} />}
 *   ariaLabel="Отправить письмо"
 *   variant="ghost"
 *   onClick={handleSend}
 * />
 *
 * @example
 * <IconButton
 *   icon={<Menu size={24} />}
 *   ariaLabel="Открыть меню"
 *   size="lg"
 * />
 */
export interface IconButtonProps extends BaseButtonProps {
  /**
   * React компонент иконки (обычно из lucide-react)
   * @required
   * @example <Mail size={20} />
   */
  icon: ReactNode;

  /**
   * Текстовая метка для скринридеров
   * @required
   * @description Обязательно для accessibility
   */
  ariaLabel: string;

  /**
   * Не используется для IconButton
   * @internal
   */
  children?: undefined;

  /**
   * Не используется для IconButton
   * @internal
   */
  leftIcon?: undefined;

  /**
   * Не используется для IconButton
   * @internal
   */
  rightIcon?: undefined;
}

// ============================================
// ButtonWithIcon — текст + иконка
// ============================================

/**
 * Props для кнопки с иконкой
 * @description Кнопка с текстом и одной или двумя иконками
 * @group ButtonWithIcon
 *
 * @example
 * <ButtonWithIcon
 *   leftIcon={<Download size={18} />}
 *   onClick={handleDownload}
 * >
 *   Скачать файл
 * </ButtonWithIcon>
 *
 * @example
 * <ButtonWithIcon
 *   leftIcon={<ArrowLeft size={18} />}
 *   rightIcon={<ArrowRight size={18} />}
 * >
 *   Навигация
 * </ButtonWithIcon>
 */
export interface ButtonWithIconProps extends BaseButtonProps {
  /**
   * Текстовый контент кнопки
   * @required
   */
  children: ReactNode;

  /**
   * Иконка слева от текста
   * @description Обычно используется для действие (Download, Edit, Delete)
   * @example <Mail size={18} />
   */
  leftIcon?: ReactNode;

  /**
   * Иконка справа от текста
   * @description Обычно используется для навигации (ArrowRight, ChevronDown)
   * @example <ArrowRight size={18} />
   */
  rightIcon?: ReactNode;

  /**
   * Не используется для ButtonWithIcon
   * @internal
   */
  icon?: undefined;

  /**
   * Не используется для ButtonWithIcon
   * @internal
   */
  ariaLabel?: undefined;
}

// ============================================
// Polymorphic Types
// ============================================

/**
 * Generic polymorphic props type for the `as` prop pattern.
 * @description Allows Button components to render as any HTML element or React component
 * while preserving type safety.
 *
 * @template C - The element type to render as (defaults to 'button')
 * @template P - Props owned by the component (take priority over element props)
 *
 * @example
 * ```tsx
 * <Button<'a', ButtonOwnProps> as="a" href="/about">Link</Button>
 * ```
 */
export type PolymorphicProps<C extends React.ElementType, P = Record<string, never>> = {
  as?: C;
  asChild?: boolean;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof P> &
  P;

/**
 * Props owned by Button components (not inherited from HTML element).
 * @description Used with PolymorphicProps to enable type-safe polymorphism.
 * @group Types
 */
export interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorScheme?: ButtonColorScheme;
  loading?: boolean;
  loadingVariant?: LoadingVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler;
  /**
   * Render the button as a child element instead of creating its own DOM node.
   * @description When true, the button clones its single child and merges all
   * button props (styles, events, aria attributes) into it. Useful for composition
   * with `<a>`, `<Link>`, or other custom components.
   *
   * @example
   * ```tsx
   * <Button asChild>
   *   <a href="/about">About</a>
   * </Button>
   * ```
   */
  asChild?: boolean;
}

// ============================================
// Union type для экспорта
// ============================================

/**
 * Semantic color scheme for Button components.
 * @description Controls the color palette independently of the visual style (variant).
 * Defaults to 'brand' when not specified.
 *
 * @example
 * ```tsx
 * <Button variant="primary" colorScheme="danger">Delete</Button>
 * <Button variant="outline" colorScheme="success">Approve</Button>
 * ```
 */
export type ButtonColorScheme = 'brand' | 'neutral' | 'success' | 'warning' | 'danger';

// ============================================
// Union type для экспорта
// ============================================

/**
 * Union type всех вариантов кнопок
 * @description Используется для полиморфных компонентов
 * @group Types
 */
export type ButtonComponentProps = ButtonProps | IconButtonProps | ButtonWithIconProps;
