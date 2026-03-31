// ============================================
// Contact Feature
// ============================================

import { useLanguage } from '@/features/LanguageSwitch/hooks/useLanguage';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import React, { useState } from 'react';
import styles from './Contact.module.scss';
import type { ContactProps } from './types';

/**
 * Contact Feature Component
 *
 * Contact form and information.
 * Follows FSD architecture - features layer for user scenarios.
 */
export const Contact: React.FC<ContactProps> = ({
  className = '',
  'data-testid': testId = 'contact'
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Message sent! (This is a demo)');
      setFormData({ name: '', email: '', message: '' });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section
      id="contact"
      className={`${styles.contact} ${className}`}
      data-testid={testId}
    >
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t.contact}</h2>
      </AnimatedSection>

      <AnimatedSection animation="fadeUp" delay={100}>
        <Card className={styles.contactCard}>
          <div className={styles.contactContent}>
            <div className={styles.contactInfo}>
              <h3 className={styles.contactSubtitle}>{t.getInTouch}</h3>
              <p className={styles.contactDescription}>
                Feel free to reach out for collaborations or just a friendly hello!
              </p>
              <div className={styles.contactEmail}>
                <strong>Email:</strong> maximus@example.com
              </div>
            </div>

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <Input
                name="name"
                placeholder={t.name}
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder={t.email}
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Textarea
                name="message"
                placeholder={t.message}
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                fullWidth
              >
                {isSubmitting ? t.sending : t.sendMessage}
              </Button>
            </form>
          </div>
        </Card>
      </AnimatedSection>
    </section>
  );
};

Contact.displayName = 'Contact';

export default Contact;
