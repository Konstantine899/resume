import { ImgHTMLAttributes, ReactNode, CSSProperties } from 'react';

/**
 * Варианты визуального стиля изображения
 * @description Определяет форму и оформление изображения
 * @example variant="default" — стандартное прямоугольное изображение
 * @example variant="rounded" — изображение со скруглёнными углами
 * @example variant="circular" — круглое изображение (avatar-style)
 * @example variant="thumbnail" — изображение с рамкой и тенью
 */
export type ImageVariant = 'default' | 'rounded' | 'circular' | 'thumbnail';

/**
 * Размеры изображения
 * @description Контролирует ширину и высоту изображения
 * @example size="sm" — 64px (миниатюры, иконки)
 * @example size="md" — 128px (стандартные изображения)
 * @example size="lg" — 256px (крупные изображения)
 * @example size="full" — 100% ширины контейнера
 */
export type ImageSize = 'sm' | 'md' | 'lg' | 'full';

/**
 * Режимы заполнения объекта (object-fit)
 * @description Контролирует как изображение заполняет контейнер
 * @example objectFit="cover" — заполняет контейнер с обрезкой (default)
 * @example objectFit="contain" — вписывается полностью с сохранением пропорций
 * @example objectFit="fill" — растягивается на весь контейнер
 * @example objectFit="none" — оригинальный размер
 * @example objectFit="scale-down" — как none или contain, whichever is smaller
 */
export type ImageObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/**
 * Типы placeholder'ов
 * @description Определяет вид заглушки во время загрузки
 * @example placeholder="blur" — размытая версия изображения
 * @example placeholder="skeleton" — анимированный скелетон
 * @example placeholder="color" — сплошной цвет фона
 */
export type ImagePlaceholder = 'blur' | 'skeleton' | 'color' | 'spinner';

/**
 * Режимы lazy loading
 * @description Определяет стратегию отложенной загрузки
 * @example lazyMode="native" — нативный loading="lazy"
 * @example lazyMode="intersection" — Intersection Observer API
 * @example lazyMode="eager" — немедленная загрузка
 */
export type ImageLazyMode = 'native' | 'intersection' | 'eager';

/**
 * Форматы изображений для оптимизации (Senior+ requirement #11)
 * @description Поддерживаемые форматы для WebP/AVIF detection
 */
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif';

/**
 * Конфигурация LQIP placeholder (Senior+ requirement #12)
 * @description Low-Quality Image Placeholder — маленькое размытое превью
 */
export interface LQIPConfig {
  /** Включить LQIP режим */
  enabled?: boolean;
  /** Ширина превью (по умолчанию 20px) */
  previewWidth?: number;
  /** Сила blur эффекта (по умолчанию 20) */
  blurAmount?: number;
  /** Качество превью (0-100, по умолчанию 10) */
  quality?: number;
}

// ============================================
// Base props для Image компонента
// ============================================

/**
 * Базовые props для компонента Image
 * @description Расширяет стандартные HTML img атрибуты с дополнительными возможностями
 * @group Base
 *
 * @example
 * <Image
 *   src="/photo.jpg"
 *   alt="Описание изображения"
 *   variant="rounded"
 *   size="lg"
 * />
 *
 * @example
 * <Image
 *   src="/avatar.png"
 *   alt="Аватар пользователя"
 *   variant="circular"
 *   objectFit="cover"
 *   placeholder="blur"
 * />
 */
/**
 * Polymorphic component prop для Image (MUI pattern).
 * @description Позволяет рендерить Image как `<figure>` (default), `<picture>`, `<div>` или кастомный компонент.
 * @example as="picture" — для `<picture>` с `<source>` элементами
 * @example as="div" — для кастомной обёртки без семантики
 * @default 'figure'
 */
export type ImageAsProp = React.ElementType;

export interface ImageBaseProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height'
> {
  /**
   * Альтернативный текст для доступности
   * @description
   * - Для content images (decorative=false или undefined): **обязателен** (WCAG 2.1 AA)
   * - Для decorative images (decorative=true): опционален, рекомендуется пустая строка
   * @example <Image alt="Photo description" /> — контентное изображение
   * @example <Image decorative alt="" /> — декоративное изображение
   */
  alt: string;

  /**
   * Декоративное изображение (скрывает от скринридеров)
   * @default false
   * @description Если true, добавляет aria-hidden и делает alt опциональным
   */
  decorative?: boolean;

  /**
   * Polymorphic компонент для root элемента (MUI best practice)
   * @default 'figure'
   * @description Позволяет изменить root элемент с `<figure>` на `<picture>`, `<div>` или кастомный компонент
   * @example <Image as="picture"> — для picture с source элементами
   * @example <Image as="div"> — для не-семантической обёртки
   */
  as?: ImageAsProp;

  /**
   * Явный HTML атрибут width (Chakra UI pattern)
   * @description Передаётся напрямую в `<img>` как HTML атрибут, не влияет на CSS
   * @example htmlWidth={800} — для SEO и accessibility
   */
  htmlWidth?: number | string;

  /**
   * Явный HTML атрибут height (Chakra UI pattern)
   * @description Передаётся напрямую в `<img>` как HTML атрибут, не влияет на CSS
   * @example htmlHeight={600} — для SEO и accessibility
   */
  htmlHeight?: number | string;

  /**
   * Визуальный стиль изображения
   * @default 'default'
   */
  variant?: ImageVariant;

  /**
   * Размер изображения
   * @default 'md'
   */
  size?: ImageSize;

  /**
   * Режим заполнения контейнера
   * @default 'cover'
   */
  objectFit?: ImageObjectFit;

  /**
   * Тип placeholder'а во время загрузки
   * @default 'skeleton'
   */
  placeholder?: ImagePlaceholder;

  /**
   * Режим отложенной загрузки
   * @default 'native'
   */
  lazyMode?: ImageLazyMode;

  /**
   * Fallback контент при ошибке загрузки
   * @description
   * - `string`: URL fallback изображения (рендерится как `<img>`)
   * - `ReactNode`: Кастомный контент (текст, иконка, etc.)
   * @example fallback="/fallback.jpg" — изображение-заглушка
   * @example fallback={<span>Image unavailable</span>} — текст
   * @example fallback={<Icon name="image-off" />} — иконка
   */
  fallback?: string | ReactNode;

  /**
   * Показывать placeholder во время загрузки
   * @default true
   */
  showPlaceholder?: boolean;

  /**
   * Blur эффект для placeholder
   * @default 10
   */
  blurAmount?: number;

  /**
   * Дополнительный CSS класс
   */
  className?: string;

  /**
   * Inline стили
   */
  style?: CSSProperties;

  /**
   * Дочерние элементы (для overlay контента)
   */
  children?: ReactNode;

  /**
   * Ширина изображения в viewport units
   * @description Переопределяет size prop
   */
  width?: string | number;

  /**
   * Высота изображения
   * @description Переопределяет size prop
   */
  height?: string | number;

  /**
   * Приоритет загрузки
   * @default false
   * @description Если true, загружается немедленно (eager loading)
   */
  priority?: boolean;

  /**
   * Принудительное состояние загрузки
   * @default false
   * @description Если true, компонент остаётся в состоянии loading независимо от реального статуса изображения.
   * Используется для демонстрации skeleton/spinner в Storybook.
   * @internal
   */
  forceLoading?: boolean;

  /**
   * Качество изображения для оптимизации
   * @default 80
   */
  quality?: number;

  /**
   * Обработчик начала загрузки
   */
  onLoadStart?: () => void;

  /**
   * Обработчик успешной загрузки
   */
  onLoadSuccess?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;

  /**
   * Обработчик ошибки загрузки
   */
  onLoadError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;

  /**
   * Телеметрия ошибки загрузки (ERB-01)
   * @description Опциональный колбэк для аналитики/AI-тулинга. Вызывается в
   * существующей воронке `if (!forceLoading)` — ПОСЛЕ hookOnError и ДО
   * `onLoadError` (порядок: телеметрия → dev-warn → onLoadError). Аддитивный,
   * опциональный, без дефолта; не переименовывает и не переупорядочивает
   * существующий контракт `onLoadError`.
   */
  onLoadErrorTelemetry?: (info: ImageLoadErrorInfo) => void;
}

/**
 * Лоадер локального изображения (discriminated union #4).
 * @description Резолвится в `{ default: string }` — тот же контракт, что у
 * Vite dynamic import (`import('./assets/hero.webp')`). Хэширование имени
 * файла и кеширование — из коробки.
 */
export type ImageImportLoader = () => Promise<{ default: string }>;

/**
 * Remote-источник изображения (по умолчанию).
 * @description `type?: 'remote'` опционален — вызов без `type` трактуется как
 * remote-изображение (обратная совместимость со всеми потребителями).
 * `src` обязателен; `lazyLoad` — булев алиас, включает IO-lazy стратегию.
 */
export interface RemoteImageProps extends ImageBaseProps {
  /** Источник изображения (remote-режим, по умолчанию) */
  type?: 'remote';
  /** URL изображения — строка или объект `{ src; srcSet? }` (IMG-04) */
  src: ImageSource;
  /** Булев алиас lazy loading: true → `lazyMode='intersection'` */
  lazyLoad?: boolean;
}

/**
 * Local-источник изображения через dynamic import.
 * @description `src` запрещён (`never`) — передача одновременно `src` и
 * `import` становится ошибкой TypeScript (семантическая защита плана #4).
 */
export interface LocalImageProps extends ImageBaseProps {
  /** Local-режим — обязателен */
  type: 'local';
  /** Запрещено для local (семантика: `import` вместо `src`) */
  src?: never;
  /** Лоадер ассета — Vite dynamic import */
  import: ImageImportLoader;
}

/**
 * Discriminated union пропсов Image (#4).
 * @description Нельзя передать `src` и `import` одновременно — TS отвергает.
 */
export type ImageProps = RemoteImageProps | LocalImageProps;

/**
 * Image source type: either a string URL or an object with `src` and optional `srcSet` for responsive images.
 * The object form enables native srcSet attribute passthrough when using the Image component.
 * @example
 * // String form
 * <Image src="/photo.jpg" alt="Photo" />
 * @example
 * // Object form with srcSet
 * <Image src={{ src: '/photo.jpg', srcSet: '/photo@2x.jpg 2x' }} alt="Photo" />
 */
export type ImageSource = string | { src: string; srcSet?: string };

/**
 * Полезная нагрузка телеметрии ошибки загрузки (ERB-01)
 * @group Diagnostics
 * @description Стабильная форма: `src` — resolved primitive source (строка из
 * union `string | { src; srcSet? }`), `alt` — prop потребителя, `event` —
 * оригинальный SyntheticEvent. Без дополнительных полей (тест shape-stable).
 */
export interface ImageLoadErrorInfo {
  /** Resolved image source (primitive string from the src union) */
  src: string;
  /** Alt prop — идентификатор изображения для аналитики */
  alt: string;
  /** Оригинальный SyntheticEvent ошибки */
  event: React.SyntheticEvent<HTMLImageElement, Event>;
}

/**
 * Внутреннее состояние компонента Image
 * @group Internal
 */
export interface ImageState {
  /** Статус загрузки изображения */
  loadingStatus: 'idle' | 'loading' | 'loaded' | 'error';
  /** Было ли изображение загружено хотя бы раз */
  hasLoaded: boolean;
  /** Текущий источник изображения */
  currentSrc: string;
}

/**
 * Конфигурация хука useImageLoading
 * @group Hooks
 */
export interface UseImageLoadingConfig {
  /** URL изображения для загрузки */
  src: string;
  /** Режим lazy loading */
  lazyMode: ImageLazyMode;
  /** Порог видимости для Intersection Observer (0-1) */
  threshold?: number;
  /** Корень для Observer (null = viewport) */
  root?: Element | null;
  /** Отступ от корня в пикселях */
  rootMargin?: string;
  /** Приоритетная загрузка */
  priority?: boolean;
  /** Принудительное состояние загрузки (для демо) */
  forceLoading?: boolean;
}

/**
 * Результат работы хука useImageLoading
 * @group Hooks
 */
export interface UseImageLoadingReturn {
  /** Текущий статус загрузки */
  loadingStatus: 'idle' | 'loading' | 'loaded' | 'error';
  /** Изображение загружено успешно */
  isLoaded: boolean;
  /** Произошла ошибка при загрузке */
  isError: boolean;
  /** Изображение сейчас загружается */
  isLoading: boolean;
  /** Ссылка на элемент для Intersection Observer */
  ref: React.RefObject<HTMLImageElement | null>;
  /** Принудительно начать загрузку */
  startLoading: () => void;
  /** Сбросить состояние загрузки */
  reset: () => void;
  /** Обработчик успешной загрузки изображения */
  onLoad: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Обработчик ошибки загрузки изображения */
  onError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Результат валидации props
 * @group Utils
 */
export interface ImageValidationResult {
  /** Валидны ли props */
  isValid: boolean;
  /** Список ошибок валидации */
  errors: string[];
  /** Список предупреждений */
  warnings: string[];
}
