# Data Flow — Contact Form & EmailJS

## Contact Form Flow

```
User fills form → useContactForm hook → EmailJS API → Toast notification
```

- Hook: `features/Contact/hooks/useContactForm.ts`
- Validates required fields (name, email, message) before sending
- Uses `emailjs.sendForm()` with the form DOM element

## Required Environment Variables

| Variable                   | Purpose                     |
| -------------------------- | --------------------------- |
| `VITE_EMAILJS_SERVICE_ID`  | EmailJS service identifier  |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template identifier |
| `VITE_EMAILJS_PUBLIC_KEY`  | EmailJS public API key      |

All three must be set or the form throws "EmailJS configuration incomplete".

## Form Data Shape

```typescript
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
```

## States

- **idle** — form ready, no submission in progress
- **sending** — `isSubmitting: true`, button shows loading text
- **success** — toast notification, form resets to empty
- **error** — toast notification with error message

## Related Components

- `Contact.tsx` — form UI with Input, Textarea, Button
- `Toast` context — success/error feedback
