import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { Button } from '@/shared/ui/Button';
import { ModalDrawer } from './ModalDrawer';
import { useState } from 'react';

function DrawerWrapper({ placement }: { placement?: 'right' | 'left' }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open</Button>
      <ModalDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Test Drawer"
        placement={placement}
      >
        <p>Drawer content</p>
      </ModalDrawer>
    </div>
  );
}

describe('ModalDrawer', () => {
  test('renders when open', async () => {
    const user = userEvent.setup();
    render(<DrawerWrapper />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  test('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<DrawerWrapper />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders title and close button', async () => {
    const user = userEvent.setup();
    render(<DrawerWrapper />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(await screen.findByText('Test Drawer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
  });

  test('renders content', async () => {
    const user = userEvent.setup();
    render(<DrawerWrapper />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(await screen.findByText('Drawer content')).toBeInTheDocument();
  });
});
