export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  iconUrl?: string;
};

export type ComboboxProps = {
  values: string[];
  options: ComboboxOption[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
};
