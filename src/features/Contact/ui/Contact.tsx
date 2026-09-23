import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Button } from '@/shared/ui/Button';
import { ContactCard, CardGrid } from '@/shared/ui/Card';
import { Container } from '@/shared/ui/Container';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Input, InputEmail } from '@/shared/ui/Input';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import { Textarea } from '@/shared/ui/Textarea';
import { Mail } from 'lucide-react';
import { useRef } from 'react';
import { useContactForm } from '../hooks/useContactForm';
import { SOCIAL_LINKS } from '../model/constants';
import styles from './Contact.module.scss';

export function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  // ✅ Используем хук формы (внутри уже есть Toast)
  const { formData, status, setFormData, handleSubmit } = useContactForm();

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
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className={styles.form}
                noValidate // ✅ Браузерная валидация отключена (своя в хуке)
              >
                {/* Имя */}
                <Input
                  type="text"
                  name="user_name"
                  placeholder={t('namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={status === 'submitting'}
                  fullWidth
                  required
                />

                {/* Email */}
                <InputEmail
                  name="user_email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={status === 'submitting'}
                  fullWidth
                  required
                />

                {/* Сообщение */}
                <Textarea
                  name="message"
                  placeholder={t('messagePlaceholder')}
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
                  {status === 'submitting' ? t('sending') : t('sendMessage')}
                </Button>

                {/* ✅ УБРАНЫ блоки errorMessage и successMessage */}
                {/* Теперь уведомления показываются через Toast */}
              </form>

              {/* Социальные ссылки */}
              <div className={styles.socialLinks}>
                {SOCIAL_LINKS.map((link, index: number) => {
                  const Icon = link.icon as React.ComponentType<{ className?: string }>;
                  return (
                    <Link
                      key={index}
                      href={link.href}
                      external
                      variant="ghost"
                      underline="never"
                      showExternalIcon={false}
                      className={styles.socialLink}
                    >
                      <Icon className={styles.icon} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
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
                {t('contactDescription')}
              </Paragraph>
            </ContactCard>
          </AnimatedSection>
        </CardGrid>
      </Container>
    </Section>
  );
}
