// Input Component Public API

export { Input } from './ui/Input';
export type { InputProps, InputStatus, InputVariant, InputSize } from './model/types';
export { INPUT_CONSTANTS } from './model/constants';
export { validateInputProps } from './lib/utils/validateInputProps';
export type { InputValidationWarning } from './lib/utils/validateInputProps';

// Sub-components
export { InputLabel } from './ui/InputLabel/InputLabel';
export type { InputLabelProps } from './ui/InputLabel/InputLabel';

export { InputCounter } from './ui/InputCounter/InputCounter';
export type { InputCounterProps } from './ui/InputCounter/InputCounter';

export { InputClearButton } from './ui/InputClearButton/InputClearButton';
export type { InputClearButtonProps } from './ui/InputClearButton/InputClearButton';

export { InputAddon } from './ui/InputAddon/InputAddon';
export type { InputAddonProps } from './ui/InputAddon/InputAddon';

export { InputGroup } from './ui/InputGroup/InputGroup';
export type { InputGroupProps, InputGroupAddonProps } from './ui/InputGroup/InputGroup';

export { InputSearch } from './ui/InputSearch/InputSearch';
export type { InputSearchProps } from './ui/InputSearch/InputSearch';

// Specialized inputs
export { InputPhone } from './ui/InputPhone/InputPhone';
export type { InputPhoneProps } from './ui/InputPhone/InputPhone';

export { InputEmail } from './ui/InputEmail/InputEmail';
export type { InputEmailProps } from './ui/InputEmail/InputEmail';
