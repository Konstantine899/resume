// ============================================
// classNames Utility Function
// ============================================

/**
 * Type for class names argument
 */
type ClassValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | { [key: string]: boolean | null | undefined } 
  | ClassValue[];

/**
 * A utility function for conditionally joining CSS class names together
 * Similar to the popular 'classnames' library but with TypeScript support
 * 
 * @example
 * ```ts
 * classNames('btn', 'btn-primary', { active: isActive, disabled: isDisabled });
 * // => 'btn btn-primary active'
 * ```
 */
export const classNames = (...args: ClassValue[]): string => {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) {
        classes.push(inner);
      }
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
};

/**
 * Alias for classNames for shorter usage
 */
export const cn = classNames;

/**
 * Create a BEM-style class name generator
 * 
 * @example
 * ```ts
 * const bem = createBEM('button');
 * bem(); // 'button'
 * bem('primary'); // 'button--primary'
 * bem('icon', 'large'); // 'button__icon--large'
 * ```
 */
export const createBEM = (block: string) => {
  return (element?: string, modifier?: string): string => {
    if (!element && !modifier) {
      return block;
    }
    
    if (element && !modifier) {
      return `${block}__${element}`;
    }
    
    if (!element && modifier) {
      return `${block}--${modifier}`;
    }
    
    return `${block}__${element}--${modifier}`;
  };
};

/**
 * Create namespaced class names for SCSS modules
 * 
 * @example
 * ```ts
 * const styles = { button: 'button_abc123', primary: 'primary_abc123' };
 * const ns = createNamespace(styles);
 * ns('button', 'primary'); // 'button_abc123 primary_abc123'
 * ```
 */
export const createNamespace = (styles: Record<string, string>) => {
  return (...classNames: string[]): string => {
    return classNames
      .map(className => styles[className] || className)
      .filter(Boolean)
      .join(' ');
  };
};

export default classNames;