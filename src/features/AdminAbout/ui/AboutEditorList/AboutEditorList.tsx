// ============================================
// AboutEditorList — admin vitrina for the About document
// (admin-about-table WU-3, SPEC R-1/R-4/R-5)
// ============================================
//
// The inline RHF form is gone (OPEN-1 = а): every editable field is a
// TABLE ROW — [Поле | EN | RU | Действия] — exactly like the Contact
// (#283/#286), Jobs (#225) and MyWork vitrinas. The document contract is
// FIXED (3 descriptions + 4 stats + ctaLabel): rows are edited, never
// added or removed (honest data).
//
// Invariants:
// - persist happens BEFORE dispatch (R-3): a failed write must never
//   leave the store ahead of storage; on failure the toast is an error
//   and nothing dispatches.
// - Reset stays the admin-about-refactor R-1 kit-Modal-confirm (subtitle
//   names the entity, focus starts on «Отмена»); `useConfirmAction`
//   takes the state machine over in WU-7 (OPEN-4).
// - The fullName scalar block is WU-5 (OPEN-3) — not here yet.
// - ALL copy is i18n (R-6): labels are key lookups, never literals.

import { useRef, useState } from 'react';

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button, IconButton } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { selectAboutContent } from '../../model/selectors';
import { removeAboutContent } from '../../model/services/storage';
import { resetToDefaults, updateAboutContent } from '../../model/slices/aboutContentSlice';
import { STAT_KEYS } from './lib/fieldSchemas';
import { persistMergedAboutField } from './lib/saveAboutField';
import type { EditAboutField } from './lib/fieldSchemas';
import styles from './AboutEditorList.module.scss';

/**
 * Every vitrina row is a two-locale field; `fullName` is a scalar and
 * gets its own WU-5 block, so it is NOT a table row (SPEC R-2).
 */
type VitrinaField = Exclude<EditAboutField, 'fullName'>;

/** One vitrina row: translated label + the field's EN/RU values. */
interface AboutTableRow {
  id: VitrinaField;
  label: string;
  en: string;
  ru: string;
}

export interface AboutEditorListProps {
  className?: string;
  'data-testid'?: string;
}

export const AboutEditorList: React.FC<AboutEditorListProps> = ({
  className = '',
  'data-testid': testId = 'about-editor-list',
}) => {
  // Same-feature selector + dispatch — legal inside AdminAbout (§8).
  const content = useSelector(selectAboutContent);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  // R-4: destructive confirm — kit Modal, own state until WU-7 swaps in
  // useConfirmAction (OPEN-4). Cancel holds the initial focus.
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const cancelResetRef = useRef<HTMLButtonElement>(null);

  const closeResetConfirm = () => setIsResetConfirmOpen(false);

  /**
   * §4 / R-3 order: persist → dispatch → toast. `persistMergedAboutField`
   * is the WU-2 seam — a failed write returns null and the store stays
   * untouched. WU-4's field-modal Save will call this same path.
   */
  const handleSaveField = (row: AboutTableRow) => {
    const merged = persistMergedAboutField(content, row.id, { en: row.en, ru: row.ru });
    if (merged === null) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return;
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('aboutSaved'), type: 'success' });
  };

  /**
   * §7 order: remove → dispatch. `removeAboutContent` is idempotent and
   * never throws (storage.ts), so there is NO fail branch (parity with
   * the admin-about-refactor behavior R-4 keeps unchanged).
   */
  const handleConfirmReset = () => {
    removeAboutContent();
    dispatch(resetToDefaults());
    closeResetConfirm();
  };

  // 8 rows in document order: 3 descriptions, 4 stats, the CTA label.
  // Labels reuse the form-era keys; per-row description labels carry the
  // 1-based index (`aboutFieldDescriptions 1..3`), stats are their own
  // keys (aboutStatYears …), the CTA is aboutFieldCta.
  const rows: AboutTableRow[] = [
    ...content.descriptions.map((paragraph, index) => ({
      id: `description-${index}` as VitrinaField,
      label: `${t('aboutFieldDescriptions')} ${index + 1}`,
      en: paragraph.en,
      ru: paragraph.ru,
    })),
    ...STAT_KEYS.map((key, index) => ({
      id: `stat-${index}` as VitrinaField,
      label: t(key),
      en: content.stats[key].en,
      ru: content.stats[key].ru,
    })),
    {
      id: 'ctaLabel',
      label: t('aboutFieldCta'),
      en: content.ctaLabel.en,
      ru: content.ctaLabel.ru,
    },
  ];

  return (
    <section className={classNames(styles.editor, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={2}>{t('adminAboutTitle')}</Heading>
          <Paragraph theme="muted">{t('adminAboutHint')}</Paragraph>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsResetConfirmOpen(true)}
        >
          {t('aboutReset')}
        </Button>
      </div>

      <Table<AboutTableRow>
        caption={t('adminAboutTitle')}
        rows={rows}
        getKey={(row) => row.id}
        columns={[
          {
            key: 'field',
            header: t('adminAboutTableField'),
            width: '20%',
            render: (row) => row.label,
          },
          { key: 'en', header: 'EN', render: (row) => row.en },
          { key: 'ru', header: 'RU', render: (row) => row.ru },
          {
            // R-1: only a Pencil per row — add/remove rows is forbidden
            // (fixed contract); `.cellActions` keeps the icon row nowrap.
            key: 'actions',
            header: t('adminAboutTableActions'),
            width: '120px',
            align: 'right',
            render: (row) => (
              <div className={styles.cellActions}>
                <Tooltip content={t('adminAboutEditRow')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminAboutEditRow')}
                    data-testid={`admin-about-edit-${row.id}`}
                    onClick={() => handleSaveField(row)}
                  />
                </Tooltip>
              </div>
            ),
          },
        ]}
      />

      {/* R-1: kit Modal confirm — title/button share `aboutReset`, the
          subtitle IS the confirm copy and names the entity ({{name}} =
          current fullName); focus starts on «Отмена». */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={closeResetConfirm}
        title={t('aboutReset')}
        subtitle={
          isResetConfirmOpen ? t('aboutResetConfirm', { name: content.fullName }) : undefined
        }
        size="sm"
        initialFocusRef={cancelResetRef}
        footer={
          <>
            <Button
              ref={cancelResetRef}
              type="button"
              variant="outline"
              onClick={closeResetConfirm}
            >
              {t('aboutCancel')}
            </Button>
            <Button type="button" variant="danger" onClick={handleConfirmReset}>
              {t('aboutReset')}
            </Button>
          </>
        }
      >
        {null}
      </Modal>
    </section>
  );
};

AboutEditorList.displayName = 'AboutEditorList';
