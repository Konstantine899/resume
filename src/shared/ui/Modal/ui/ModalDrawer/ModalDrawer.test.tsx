import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { Button } from '@/shared/ui/Button';
import { ModalDrawer } from './ModalDrawer';
import styles from './ModalDrawer.module.scss';
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

  // M11: a drawer is a non-modal side panel — no aria-modal="true", no focus trap
  test('is non-modal: aria-modal="false"', async () => {
    const user = userEvent.setup();
    render(<DrawerWrapper />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'false');
  });

  // M4: default placement "right" must apply the .right anchor class
  test('applies right placement class by default', async () => {
    const user = userEvent.setup();
    render(<DrawerWrapper />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveClass(styles.right ?? '');
    expect(dialog).not.toHaveClass(styles.left ?? '');
  });

  // M4: explicit left placement applies the .left anchor class
  test('applies left placement class when placement="left"', async () => {
    const user = userEvent.setup();
    render(<DrawerWrapper placement="left" />);
    await user.click(screen.getByRole('button', { name: /open/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveClass(styles.left ?? '');
    expect(dialog).not.toHaveClass(styles.right ?? '');
  });
});
