import { useCallback, useState } from 'react';

export interface UsePasswordToggleOptions {
  type?: string;
  showPasswordToggle?: boolean;
}

export interface UsePasswordToggleResult {
  showPassword: boolean;
  inputType: string | undefined;
  handleTogglePassword: () => void;
  handlePasswordToggleKeyDown: (e: React.KeyboardEvent) => void;
  isPassword: boolean;
}

export function usePasswordToggle(options: UsePasswordToggleOptions): UsePasswordToggleResult {
  const { type, showPasswordToggle } = options;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handlePasswordToggleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTogglePassword();
      }
    },
    [handleTogglePassword]
  );

  return {
    showPassword,
    inputType,
    handleTogglePassword,
    handlePasswordToggleKeyDown,
    isPassword,
  };
}
