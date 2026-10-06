import { CONTACT_EMAIL, type ContactContent } from '@/entities/ContactContent';
import { SOCIAL_LINKS } from '@/entities/Developer';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Button } from '@/shared/ui/Button';
import { CardGrid, ContactCard } from '@/shared/ui/Card';
import { Container } from '@/shared/ui/Container';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Input, InputEmail } from '@/shared/ui/Input';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import { Textarea } from '@/shared/ui/Textarea';
import { Mail } from 'lucide-react';
import { useRef } from 'react';
import { useContactForm } from '../../hooks/useContactForm';
import type { ContactProps } from '../../model/types/types';
import styles from './Contact.module.scss';

export function Contact({ content }: ContactProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { t, language } = useLanguage();

  // Fallback branch keeps rendering constants/t() — identical to the
  // pre-store behavior (the 3 legacy tests assert this, §11).
  const email = content?.email ?? CONTACT_EMAIL;
  const text = (key: keyof ContactContent['texts']): string =>
    content?.texts[key][language] ?? t(key);

  // ✅ Используем хук формы (внутри уже есть Toast); admin-edited
  // formTexts reach the Create toasts via the texts option (R-11).
  const { formData, status, setFormData, handleSubmit } = useContactForm({
    texts: content?.formTexts,
  });

  return (
    <Section id="contact" size="xl" className={styles.container}>
      <Container size="lg" padding="lg">
        <AnimatedSection animation="fadeUp">
          <Heading level={2} theme="inverted" className={styles.title}>
            {t('contact')}
          </Heading>
        </AnimatedSection>

        <CardGrid columns={2} gap="lg">
          <AnimatedSection delay={200}>
            <div className={styles.formContainer}>
              {/* Браузерная валидация отключена (своя в хуке) */}
              <Form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
                {/* Имя */}
                <Input
                  type="text"
                  name="user_name"
                  label={text('nameField')}
                  placeholder={text('namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={status === 'submitting'}
                  fullWidth
                  required
                />

                {/* Email */}
                <InputEmail
                  name="user_email"
                  label={text('email')}
                  placeholder={text('emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={status === 'submitting'}
                  fullWidth
                  required
                />

                {/* Сообщение */}
                <Textarea
                  name="message"
                  label={text('message')}
                  placeholder={text('messagePlaceholder')}
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={status === 'submitting'}
                  required
                  aria-required="true"
                  variant="outline"
                  size="md"
                  resize="none"
                  fullWidth
                />

                {/* Кнопка отправки */}
                <Button type="submit" loading={status === 'submitting'} fullWidth>
                  {status === 'submitting' ? text('sending') : text('sendMessage')}
                </Button>

                {/* ✅ УБРАНЫ блоки errorMessage и successMessage */}
                {/* Теперь уведомления показываются через Toast */}
              </Form>

              {/* Прямой email + социальные ссылки (audit P1: видимый mailto) */}
              <div className={styles.socialLinks}>
                <Link
                  href={`mailto:${email}`}
                  variant="text-on-dark"
                  showExternalIcon={false}
                  icon={<Icon name={Mail} size="sm" color="inherit" decorative />}
                >
                  {email}
                </Link>
                {SOCIAL_LINKS.map((link, index: number) => (
                  <Link
                    key={index}
                    href={link.href}
                    external
                    variant="text-on-dark"
                    showExternalIcon={false}
                    icon={<Icon name={link.icon} size="sm" color="inherit" decorative />}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Декоративная секция */}
          <AnimatedSection delay={400}>
            <ContactCard
              title={t('contact')}
              icon={<Icon name={Mail} size={40} color="var(--color-accent)" decorative />}
            >
              <Paragraph theme="muted" align="center">
                {text('contactDescription')}
              </Paragraph>
              <Paragraph size="s" align="center">
                {text('responseTimeHint')}
              </Paragraph>
            </ContactCard>
          </AnimatedSection>
        </CardGrid>
      </Container>
    </Section>
  );
}
