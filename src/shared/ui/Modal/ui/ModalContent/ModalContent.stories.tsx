import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { ModalContent } from './ModalContent';

const meta = {
  title: 'Shared/Modal/Content',
  component: ModalContent,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ModalContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Simple content inside ModalContent' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Simple content inside ModalContent')).toBeInTheDocument();
  },
};

export const WithCustomClass: Story = {
  args: { children: 'Content with custom class', className: 'custom-class' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Content with custom class')).toBeInTheDocument();
  },
};

export const WithComplexContent: Story = {
  args: {
    children: (
      <div>
        <h3>Complex Content</h3>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Complex Content')).toBeInTheDocument();
    expect(canvas.getByText('Paragraph 1')).toBeInTheDocument();
    expect(canvas.getByText('Paragraph 2')).toBeInTheDocument();
  },
};

export const WithScroll: Story = {
  args: {
    children: (
      <div style={{ height: '300px', overflow: 'auto' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i}>Line {i + 1} - Scrollable content</p>
        ))}
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Line 1 - Scrollable content')).toBeInTheDocument();
    expect(canvas.getByText('Line 20 - Scrollable content')).toBeInTheDocument();
  },
};
