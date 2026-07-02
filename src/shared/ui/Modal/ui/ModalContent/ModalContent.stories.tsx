// ============================================
// ModalContent Stories
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const WithCustomClass: Story = {
  args: { children: 'Content with custom class', className: 'custom-class' },
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
};
