declare const __IS_DEV__: boolean;
declare const __API__: string;
declare const __PROJECT__: 'storybook' | 'frontend' | 'jest'; // что бы был автокомплит

// ============================================
// SCSS/CSS Modules Declarations
// ============================================

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.sass' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.less' {
  const content: Record<string, string>;
  export default content;
}

// ============================================
// Asset Declarations
// ============================================

declare module '*.svg' {
  import React from 'react';

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

// ============================================
// Vite Client Types
// ============================================

/// <reference types="vite/client" />
