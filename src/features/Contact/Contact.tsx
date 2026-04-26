import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Mail } from 'lucide-react';
import { useRef, useState } from 'react';
import styles from './Contact.module.scss';
import { SOCIAL_LINKS } from './constants';
import type { FormStatus } from './types';

export function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // ... validation and EmailJS logic
      // Пример:
      // await emailjs.sendForm(...);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className={styles.container}>
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.title}>{t(`contact`)}</h2>
      </AnimatedSection>

      <div className={styles.grid}>
        {/* Form */}
        <AnimatedSection delay={200}>
          <div className={styles.formContainer}>
            <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder={t(`namePlaceholder`)}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={status === 'submitting'}
                className={styles.input}
              />

              <input
                type="email"
                placeholder={t(`emailPlaceholder`)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={status === 'submitting'}
                className={styles.input}
              />

              <textarea
                placeholder={t(`messagePlaceholder`)}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={status === 'submitting'}
                className={styles.textarea}
              />

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={styles.submitButton}
              >
                {status === 'submitting' ? t(`sending`) : t(`sendMessage`)}
              </button>

              {status === 'error' && (
                <div className={styles.errorMessage}>
                  <span>{errorMessage}</span>
                </div>
              )}

              {status === 'success' && (
                <div className={styles.successMessage}>
                  <span>{t(`messageSent`)}</span>
                </div>
              )}
            </form>

            {/* Social Links */}
            <div className={styles.socialLinks}>
              {SOCIAL_LINKS.map((link, index) => {
                const Icon = link.icon;
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

        {/* Decorative section */}
        <AnimatedSection delay={400}>
          <div className={styles.contactCard}>
            <div className={styles.decorativeSection}>
              <div className={styles.decorativeCard}>
                <div className={styles.content}>
                  <div className={styles.iconWrapper}>
                    <Mail className={styles.mailIcon} />
                  </div>
                  <h3 className={styles.subtitle}>{t(`contact`)}</h3>
                  <p className={styles.description}>{t(`contactDescription`)}</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
