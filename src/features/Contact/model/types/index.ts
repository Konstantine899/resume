// ============================================
// Contact Feature Types
// ============================================

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactProps {
  id?: string;
  className?: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
