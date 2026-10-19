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
//   names the entity, focus starts on «Отмена»); WU-7 (OPEN-4): the state
//   machine is `useConfirmAction` (issue #302 — MyWork/Jobs/Contact
//   parity), the Modal JSX stays here (feature-scoped i18n copy).
// - WU-4 (R-3): a row Pencil opens the field-scoped AboutFieldEditForm
//   in a kit Modal owned HERE (page-owned-dialog parity with AdminJobs
//   #227): `editingField` is the single selection state, `key=field`
//   remounts the form with fresh defaults, and the Save seam
//   (persistMergedAboutField) returns false on a failed write — the
//   modal stays open with the user's values, the store does not move.
// - WU-5 (OPEN-3, R-2): `fullName` is a SCALAR — its own block with an
//   inline Save ABOVE the vitrina (Contact email D6 precedent: draft +
//   mini-pipeline, pristine-disabled Save, persist → dispatch).
// - ALL copy is i18n (R-6): labels are key lookups, never literals.

import { useState } from 'react';

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { useConfirmAction } from '@/shared/lib/hooks/useConfirmAction';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button, IconButton } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { selectAboutContent } from '../../model/selectors';
import { removeAboutContent } from '../../model/services/storage';
import { resetToDefaults, updateAboutContent } from '../../model/slices/aboutContentSlice';
import { AboutFieldEditForm } from '../AboutFieldEditForm/AboutFieldEditForm';
import {
  STAT_KEYS,
  aboutFieldSchema,
  descriptionIndexOf,
  statIndexOf,
  type AboutFieldValue,
  type EditAboutField,
} from './lib/fieldSchemas';
import { persistMergedAboutField } from './lib/saveAboutField';
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

  // R-4 / WU-7 (OPEN-4): destructive confirm — `useConfirmAction` owns
  // the state machine (MyWork/Jobs/Contact parity). Cancel holds the
  // initial focus; there is NO persist-fail branch below because
  // removeAboutContent is idempotent and never throws (storage.ts) —
  // the hook's keep-open-on-false contract stays unused, as before.
  const {
    pending: pendingReset,
    cancelRef: cancelResetRef,
    request: requestReset,
    cancel: closeResetConfirm,
    confirm: handleConfirmReset,
  } = useConfirmAction<'reset'>({
    onConfirm: () => {
      // §7 order: remove → dispatch. NO fail branch — removeAboutContent
      // is idempotent and never throws (storage.ts), so the hook's
      // keep-open-on-false contract stays unused, as before WU-7.
      removeAboutContent();
      dispatch(resetToDefaults());
      return true;
    },
  });

  // WU-4 (R-3): the field-scoped edit selection — null = closed. The
  // overlay of an open modal blocks Reset, so the two dialogs never
  // coexist (AdminJobs #227 page-owned-dialog parity).
  const [editingField, setEditingField] = useState<EditAboutField | null>(null);

  const closeFieldModal = () => setEditingField(null);

  // WU-5 (R-2, OPEN-3): the fullName scalar block — Contact email (D6)
  // precedent: its own draft + mini-pipeline, no whole-document form.
  const [fullNameDraft, setFullNameDraft] = useState(content.fullName);
  const fullNameParsed = aboutFieldSchema('fullName').safeParse(fullNameDraft);
  const fullNameValid = fullNameParsed.success;
  const fullNameDirty = fullNameDraft !== content.fullName;

  const handleSaveFullName = () => {
    if (!fullNameParsed.success) return; // the Input shows aboutNameRequired
    const merged = persistMergedAboutField(content, 'fullName', fullNameParsed.data);
    if (merged === null) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return; // store unchanged; the draft stays for a retry
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('aboutSaved'), type: 'success' });
  };

  /** Translated label of ANY vitrina row — the modal title names the field. */
  const fieldLabel = (field: EditAboutField): string => {
    if (field === 'fullName') return t('aboutFieldFullName');
    if (field === 'ctaLabel') return t('aboutFieldCta');
    if (field.startsWith('description-')) {
      return `${t('aboutFieldDescriptions')} ${descriptionIndexOf(field) + 1}`;
    }
    return t(STAT_KEYS[statIndexOf(field)]);
  };

  /**
   * §4 / R-3 order: persist → dispatch → toast. `persistMergedAboutField`
   * is the WU-2 seam — a failed write returns null and the store stays
   * untouched. WU-4: this is the field-modal Save's `onSave` — returning
   * false keeps the modal open with the user's values.
   */
  const handleSaveField = (field: EditAboutField, value: AboutFieldValue): boolean => {
    const merged = persistMergedAboutField(content, field, value);
    if (merged === null) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return false;
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('aboutSaved'), type: 'success' });
    return true;
  };

  // 8 rows in document order: 3 descriptions, 4 stats, the CTA label.
  // Labels reuse the form-era keys; per-row description labels carry the
  // 1-based index (`aboutFieldDescriptions 1..3`), stats are their own
  // keys (aboutStatYears …), the CTA is aboutFieldCta.
  const rows: AboutTableRow[] = [
    ...content.descriptions.map((paragraph, index) => ({
      id: `description-${index}` as VitrinaField,
      label: fieldLabel(`description-${index}` as EditAboutField),
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
        <Button type="button" variant="outline" size="sm" onClick={() => requestReset('reset')}>
          {t('aboutReset')}
        </Button>
      </div>

      {/* WU-5 (R-2): fullName is a SCALAR — its own block with an inline
          Save above the vitrina (Contact email D6 parity): pristine and
          invalid drafts keep the Save disabled, a failed persist keeps
          the draft for a retry. */}
      <div className={styles.nameRow}>
        <div className={styles.nameInput}>
          <Input
            label={t('aboutFieldFullName')}
            value={fullNameDraft}
            onChange={(event) => setFullNameDraft(event.target.value)}
            error={fullNameValid ? undefined : t('aboutNameRequired')}
            maxLength={80}
            fullWidth
          />
        </div>
        <Button
          type="button"
          variant="primary"
          disabled={!fullNameDirty || !fullNameValid}
          onClick={handleSaveFullName}
        >
          {t('aboutSave')}
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
                    onClick={() => setEditingField(row.id)}
                  />
                </Tooltip>
              </div>
            ),
          },
        ]}
      />

      {/* R-1/WU-7: kit Modal confirm — title/button share `aboutReset`,
          the subtitle IS the confirm copy and names the entity ({{name}} =
          current fullName); focus starts on «Отмена» (hook's cancelRef). */}
      <Modal
        isOpen={pendingReset !== null}
        onClose={closeResetConfirm}
        title={t('aboutReset')}
        subtitle={
          pendingReset !== null ? t('aboutResetConfirm', { name: content.fullName }) : undefined
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

      {/* WU-4 (R-3): field-scoped edit modal — the LIST owns the dialog
          state (AdminJobs #227 parity): `editingField` selects the row,
          `key=field` remounts the form with fresh defaults, the title
          names the field (aria-dialog-name). ESC/overlay close via the kit
          Modal defaults; a seam failure (persist-fail) toasts aboutSaveError
          and keeps this modal open with the user's values. */}
      <Modal
        isOpen={editingField !== null}
        onClose={closeFieldModal}
        title={
          editingField !== null
            ? t('adminAboutEditFieldTitle', { field: fieldLabel(editingField) })
            : t('adminAboutEditRow')
        }
        size="md"
      >
        {editingField !== null ? (
          <AboutFieldEditForm
            key={editingField}
            field={editingField}
            document={content}
            onSave={handleSaveField}
            onExitEdit={closeFieldModal}
          />
        ) : null}
      </Modal>
    </section>
  );
};

AboutEditorList.displayName = 'AboutEditorList';
