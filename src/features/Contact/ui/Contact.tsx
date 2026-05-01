import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
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
    <section id="contact" className={styles.container}>
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.title}>{t('contact')}</h2>
      </AnimatedSection>

      <div className={styles.grid}>
        <AnimatedSection delay={200}>
          <div className={styles.formContainer}>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className={styles.form}
              noValidate // ✅ Браузерная валидация отключена (своя в хуке)
            >
              {/* Имя */}
              <input
                type="text"
                name="user_name"
                placeholder={t('namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={status === 'submitting'}
                className={styles.input}
                required
                aria-required="true"
              />

              {/* Email */}
              <input
                type="email"
                name="user_email"
                placeholder={t('emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={status === 'submitting'}
                className={styles.input}
                required
                aria-required="true"
              />

              {/* Сообщение */}
              <textarea
                name="message"
                placeholder={t('messagePlaceholder')}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={status === 'submitting'}
                className={styles.textarea}
                required
                aria-required="true"
              />

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={styles.submitButton}
                aria-busy={status === 'submitting'}
              >
                {status === 'submitting' ? t('sending') : t('sendMessage')}
              </button>

              {/* ✅ УБРАНЫ блоки errorMessage и successMessage */}
              {/* Теперь уведомления показываются через Toast */}
            </form>

            {/* Социальные ссылки */}
            <div className={styles.socialLinks}>
              {SOCIAL_LINKS.map((link, index: number) => {
                const Icon = link.icon as React.ComponentType<{ className?: string }>;
                return (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    <Icon className={styles.icon} />
                    <span>{link.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Декоративная секция */}
        <AnimatedSection delay={400}>
          <div className={styles.contactCard}>
            <div className={styles.decorativeSection}>
              <div className={styles.decorativeCard}>
                <div className={styles.content}>
                  <div className={styles.iconWrapper}>
                    <Mail className={styles.mailIcon} />
                  </div>
                  <h3 className={styles.subtitle}>{t('contact')}</h3>
                  <p className={styles.description}>{t('contactDescription')}</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
