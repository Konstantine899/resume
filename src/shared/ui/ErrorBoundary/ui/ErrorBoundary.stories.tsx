import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { ErrorBoundary } from './ErrorBoundary';

const meta = {
  title: 'Shared/UI/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Класс-граница ошибок: ловит render-phase краши в children и заменяет их fallback'ом.
- Не может поймать сетевые события (например, \`onError\` на \`<img>\`) — это DOM-события.
- Default fallback — минимальный статичный узел (без текста, без i18n).
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'child content renders normally',
    fallback: <p>fallback</p>,
  },
  render: () => (
    <ErrorBoundary fallback={<p>fallback</p>}>
      <p>child content renders normally</p>
    </ErrorBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('child content renders normally')).toBeInTheDocument();
    await expect(canvas.queryByText('fallback')).not.toBeInTheDocument();
  },
};

const ThrowingChild = ({ message = 'boom' }: { message?: string }) => {
  throw new Error(message);
};

export const FallbackShown: Story = {
  args: {
    children: 'never rendered — child throws',
    fallback: (error: Error) => <p>fallback: {error.message}</p>,
  },
  render: () => (
    <ErrorBoundary fallback={(error) => <p>fallback: {error.message}</p>}>
      <ThrowingChild />
    </ErrorBoundary>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The throwing child is caught at render; the function fallback receives the error.
    await expect(canvas.getByText('fallback: boom')).toBeInTheDocument();
  },
};
