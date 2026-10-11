export type BuildMode = 'production' | 'development';

export interface BuildPath {
  src: string;
  locales: string;
  buildLocales: string;
  /** Project showcase images — source of truth tracked in git. */
  imagesProjects: string;
  /** vite-plugin-static-copy dest for project images (emitted into public/). */
  buildImagesProjects: string;
  app: string;
  pages: string;
  widgets: string;
  features: string;
  entities: string;
  shared: string;
}

export interface BuildOptions {
  mode: BuildMode;
  paths: BuildPath;
  isDev: boolean;
  port: number;
  apiUrl?: string;
  project: 'storybook' | 'frontend' | 'jest';
  analyze?: boolean;
}

export interface BuildEnv {
  mode: BuildMode;
  port: number;
  apiUrl: string;
  analyze?: boolean;
}
