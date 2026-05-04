// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { I18nProvider } from '../src/app/providers/I18nProvider';
import { ThemeProvider } from '../src/app/providers/ThemeProvider';
import { ToastProvider } from '../src/app/providers/ToastProvider';
import '../src/shared/styles/globals/index.scss';

const withProviders = (Story: React.ComponentType, context: { globals: { theme?: string } }) => {
  const theme = context.globals.theme || 'dark';

  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <div data-theme={theme} style={{ padding: '2rem' }}>
            <Story />
          </div>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // A11y конфигурация
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
    // Docs конфигурация
    docs: {
      description: {
        component: 'Компоненты UI Kit для портфолио',
      },
    },
    backgrounds: {
      disable: true,
    },
    //Layout для всех stories
    layout: 'centered',
  },
  decorators: [withProviders],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
      },
    },
  },
  tags: ['autodocs'], // Авто-документация для всех
};

export default preview;
