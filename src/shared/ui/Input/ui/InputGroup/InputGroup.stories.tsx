// InputGroup Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputGroup } from './InputGroup';
import { Input } from '../Input';

const meta = {
  title: 'Shared/Input/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  subcomponents: {
    'InputGroup.Addon': InputGroup.Addon,
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Custom CSS class',
    },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const WithStartAddon: Story = {
  render: () => (
    <InputGroup>
      <InputGroup.Addon position="start">$</InputGroup.Addon>
      <Input placeholder="0.00" />
    </InputGroup>
  ),
};

export const WithEndAddon: Story = {
  render: () => (
    <InputGroup>
      <Input placeholder="Search..." />
      <InputGroup.Addon position="end">.com</InputGroup.Addon>
    </InputGroup>
  ),
};

export const WithBothAddons: Story = {
  render: () => (
    <InputGroup>
      <InputGroup.Addon position="start">$</InputGroup.Addon>
      <Input placeholder="0.00" />
      <InputGroup.Addon position="end">.00</InputGroup.Addon>
    </InputGroup>
  ),
};

export const WithIconAddon: Story = {
  render: () => (
    <InputGroup>
      <InputGroup.Addon position="start">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </InputGroup.Addon>
      <Input placeholder="Search..." />
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: () => (
    <InputGroup>
      <Input placeholder="Enter email" />
      <InputGroup.Addon position="end">
        <button style={{ padding: '4px 8px', cursor: 'pointer' }}>Send</button>
      </InputGroup.Addon>
    </InputGroup>
  ),
};

export const MultipleAddons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <InputGroup>
        <InputGroup.Addon position="start">https://</InputGroup.Addon>
        <Input placeholder="example.com" />
      </InputGroup>
      <InputGroup>
        <InputGroup.Addon position="start">$</InputGroup.Addon>
        <Input type="number" placeholder="0.00" />
        <InputGroup.Addon position="end">/month</InputGroup.Addon>
      </InputGroup>
    </div>
  ),
};
