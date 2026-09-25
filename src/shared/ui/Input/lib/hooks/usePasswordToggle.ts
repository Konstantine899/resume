import { useCallback, useState } from 'react';

export interface UsePasswordToggleOptions {
  type?: string;
  showPasswordToggle?: boolean;
}

export interface UsePasswordToggleResult {
  showPassword: boolean;
  inputType: string | undefined;
  handleTogglePassword: () => void;
  isPassword: boolean;
}

export function usePasswordToggle(options: UsePasswordToggleOptions): UsePasswordToggleResult {
  const { type, showPasswordToggle } = options;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = showPasswordToggle && isPassword ? (showPassword ? 'text' : 'password') : type;

  // The toggle renders a native <button>, which already activates on Enter/Space.
  // A custom keydown handler would double-toggle — keep a single click path only.
  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    showPassword,
    inputType,
    handleTogglePassword,
    isPassword,
  };
}
