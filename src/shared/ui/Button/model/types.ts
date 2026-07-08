// src/shared/ui/Button/model/types.ts

import { ButtonHTMLAttributes, ReactNode } from 'react';

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
 * @example size="sm" — компактные кнопки (16px icon, 0.875rem text)
 * @example size="md" — стандартные кнопки (20px icon, 1rem text)
 * @example size="lg" — крупные кнопки (24px icon, 1.125rem text)
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

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
 * @description Расширяет стандартные HTML button атрибуты
 * @group Base
 */
interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
   * @description Обычно используется для действия (Download, Edit, Delete)
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
// Union type для экспорта
// ============================================

/**
 * Union type всех вариантов кнопок
 * @description Используется для полиморфных компонентов
 * @group Types
 */
export type ButtonComponentProps = ButtonProps | IconButtonProps | ButtonWithIconProps;
