declare const __IS_DEV__: boolean;
declare const __API__: string;
declare const __PROJECT__: 'storybook' | 'frontend' | 'jest'; // что бы был автокомплит

declare module '*.svg' {
  import React from 'react';

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
