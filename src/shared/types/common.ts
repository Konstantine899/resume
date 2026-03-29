// ============================================
// Shared Common Types
// ============================================

/**
 * Generic object type
 */
export type AnyObject = Record<string, any>;

/**
 * Generic function type
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Nullable type wrapper
 */
export type Nullable<T> = T | null;

/**
 * Optional type wrapper
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type (nullable and optional)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Array or single value
 */
export type ArrayOrSingle<T> = T | T[];

/**
 * Promise or value
 */
export type PromiseOrValue<T> = T | Promise<T>;

/**
 * CSS units type
 */
export type CSSUnit = 
  | number 
  | `${number}px` 
  | `${number}rem` 
  | `${number}em` 
  | `${number}%` 
  | `${number}vh` 
  | `${number}vw` 
  | 'auto' 
  | 'inherit' 
  | 'initial' 
  | 'unset';

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Language types
 */
export type Language = 'en' | 'ru' | string;

/**
 * Breakpoint types
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Size types
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Color variants
 */
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Error response
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
  status: number;
}

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Generic filter interface
 */
export interface BaseFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
}

/**
 * Coordinates type
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * Dimensions type
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Position type
 */
export interface Position {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
}

/**
 * Event handler type
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Click handler
 */
export type ClickHandler = EventHandler<React.MouseEvent>;

/**
 * Change handler
 */
export type ChangeHandler = EventHandler<React.ChangeEvent>;

/**
 * Focus handler
 */
export type FocusHandler = EventHandler<React.FocusEvent>;

/**
 * Keyboard handler
 */
export type KeyboardHandler = EventHandler<React.KeyboardEvent>;

/**
 * Children type
 */
export type Children = React.ReactNode;

/**
 * Component with children
 */
export interface ComponentWithChildren {
  children?: Children;
}

/**
 * Component with className
 */
export interface ComponentWithClassName {
  className?: string;
}

/**
 * Component with style
 */
export interface ComponentWithStyle {
  style?: React.CSSProperties;
}

/**
 * Test ID interface
 */
export interface ComponentWithTestId {
  'data-testid'?: string;
}

/**
 * Common component props
 */
export type CommonProps = 
  & ComponentWithChildren 
  & ComponentWithClassName 
  & ComponentWithStyle 
  & ComponentWithTestId;

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract component props type
 */
export type ComponentProps<T extends React.ComponentType<any>> = 
  T extends React.ComponentType<infer P> ? P : never;

/**
 * Extract component props type from component that uses forwardRef
 */
export type ForwardRefComponentProps<
  T extends React.ForwardRefExoticComponent<any>
> = T extends React.ForwardRefExoticComponent<infer P> ? P : never;