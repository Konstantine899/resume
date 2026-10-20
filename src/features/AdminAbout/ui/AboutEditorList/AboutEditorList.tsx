// ============================================
// AboutEditorList — admin vitrina for the About document
// (admin-about-table WU-3 + WU-12 amendment, SPEC R-1/R-2/R-3/R-4/R-5)
// ============================================
//
// The inline RHF form is gone (OPEN-1 = а): every editable field is a
// TABLE ROW — [Поле | EN | RU | Действия] — exactly like the Contact
// (#283/#286), Jobs (#225) and MyWork vitrinas. Contract v2 (WU-12): rows
// are built from the ACTUAL document — all descriptions (addressed by
// index), every `stats` record entry (addressed BY KEY, never by a
// positional index), the CTA row while `ctaLabel` is not null — and the
// admin ADDS/REMOVES rows (R-2/R-3):
// - «Добавить строку» lives in the header next to «Сбросить» and opens a
//   kit Modal with AboutRowAddForm (kind Select → per-kind fields →
//   persist-THEN-dispatch behind `onAdd`; a failed write keeps the modal
//   open — R-2);
// - every row's Trash2 opens a confirm Modal (subtitle names the row,
//   focus starts on «Отмена» — `useConfirmAction`) and removes the row
//   via the same seam (R-3); the LAST row is deletable — the vitrina
//   tolerates empty blocks (honest data).
//
// Invariants:
// - persist happens BEFORE dispatch (R-2/R-3/R-4): a failed write must
//   never leave the store ahead of storage; on failure the toast is an
//   error and nothing dispatches.
// - Reset stays the admin-about-refactor R-1 kit-Modal-confirm (subtitle
//   names the entity, focus starts on «Отмена»); the state machine is
//   `useConfirmAction` (MyWork/Jobs/Contact parity), the Modal JSX stays
//   here (feature-scoped i18n copy).
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

import type { AboutContent } from '@/entities/AboutContent';
import { apiSlice } from '@/shared/api';
import aboutPortrait from '@/shared/assets/Firefly_RemoveBackground.webp';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { useConfirmAction } from '@/shared/lib/hooks/useConfirmAction';
import { classNames } from '@/shared/lib/utils/classNames';
import { Avatar } from '@/shared/ui/Avatar';
import { Button, IconButton } from '@/shared/ui/Button';
import { FileUpload, type FileUploadSelection } from '@/shared/ui/FileUpload';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { Pencil, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { selectAboutContent } from '../../model/selectors';
import { persistAboutContent, removeAboutContent } from '../../model/services/storage';
import { resetToDefaults, updateAboutContent } from '../../model/slices/aboutContentSlice';
import type { AboutContentRootState } from '../../model/types/types';
import { AboutFieldEditForm } from '../AboutFieldEditForm/AboutFieldEditForm';
import { AboutRowAddForm } from '../AboutRowAddForm/AboutRowAddForm';
import {
  aboutFieldSchema,
  descriptionIndexOf,
  statKeyOf,
  statRowLabel,
  type AboutFieldValue,
  type AboutRowField,
  type AboutRowPayload,
  type EditAboutField,
} from './lib/fieldSchemas';
import {
  persistAddedAboutRow,
  persistMergedAboutField,
  persistRemovedAboutRow,
} from './lib/saveAboutField';
import {
  uploadPortrait,
  type PortraitUploadFailure,
  type UploadedPortrait,
} from './lib/uploadPortrait';
import styles from './AboutEditorList.module.scss';

/**
 * Every vitrina row is a two-locale field; `fullName` is a scalar and
 * gets its own WU-5 block, so it is NOT a table row (SPEC R-2).
 */
type VitrinaField = AboutRowField;

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
  // WU-14: typed as ThunkDispatch so the RTK Query mutation thunk
  // (`apiSlice.endpoints…initiate()`, core-subpath — no hooks) is a legal
  // dispatch argument alongside the plain slice actions.
  const content = useSelector(selectAboutContent);
  const dispatch = useDispatch<ThunkDispatch<AboutContentRootState, unknown, UnknownAction>>();
  const { t, language } = useLanguage();
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

  // WU-12 (R-3): delete-row confirm — the pending item IS the row
  // ADDRESS (description index / stat key / ctaLabel), so the very same
  // `withRemovedRow` seam removes exactly the confirmed row. A persist
  // failure returns false → the modal stays open for a retry (R-3).
  const {
    pending: deletingField,
    confirming: deleting,
    cancelRef: cancelDeleteRef,
    request: requestDelete,
    cancel: closeDeleteConfirm,
    confirm: handleConfirmDelete,
  } = useConfirmAction<AboutRowField>({
    onConfirm: (field) => {
      const merged = persistRemovedAboutRow(content, field);
      if (merged === null) {
        addToast({ message: t('aboutSaveError'), type: 'error' });
        return false; // store unchanged; the confirm stays open (R-3)
      }
      dispatch(updateAboutContent(merged));
      addToast({ message: t('adminAboutRowDeleted'), type: 'success' });
      return true;
    },
  });

  // WU-4 (R-3): the field-scoped edit selection — null = closed. The
  // overlay of an open modal blocks Reset, so the two dialogs never
  // coexist (AdminJobs #227 page-owned-dialog parity).
  const [editingField, setEditingField] = useState<EditAboutField | null>(null);
  // WU-12 (R-2): the add-row modal flag — AboutRowAddForm remounts on
  // every open (the kit Modal unmounts its children when closed), so a
  // fresh pristine form is guaranteed without an extra key.
  const [adding, setAdding] = useState(false);

  const closeFieldModal = () => setEditingField(null);
  const closeAddModal = () => setAdding(false);

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
    // Stat rows are addressed BY KEY: known keys translate, custom keys
    // carry their stored label (D10 — statLabels).
    return statRowLabel(content, statKeyOf(field), language, (key) => t(key));
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

  /**
   * WU-12 (R-2) add seam: persist-THEN-dispatch with the row appended.
   * `false` keeps AboutRowAddForm mounted (the modal stays open) — the
   * error toast was already fired here.
   */
  const handleAddRow = (payload: AboutRowPayload): boolean => {
    const merged = persistAddedAboutRow(content, payload);
    if (merged === null) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return false;
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('adminAboutRowAdded'), type: 'success' });
    return true;
  };

  /**
   * WU-14 (R-7, D15): portrait upload — TWO phases, both storage-agnostic
   * from the form's point of view:
   * 1. `uploadPortrait(file)` writes the FILE (shared imageDir seam, root
   *    pick/remember inside) and stages `{ name, path }` — nothing in the
   *    document moves yet;
   * 2. Save runs the RTK Query mutation ONLY (`updateAboutPortrait.initiate`
   *    — the localStorage write lives inside the mutation's queryFn behind
   *    the injected `persist` seam; swap-point to Nest.js documented on the
   *    endpoint). A rejected `.unwrap()` toasts and leaves the store AND the
   *    document untouched (persist-THEN-dispatch).
   */
  const [stagedPortrait, setStagedPortrait] = useState<UploadedPortrait | null>(null);
  const [portraitError, setPortraitError] = useState<PortraitUploadFailure | null>(null);
  const [savingPortrait, setSavingPortrait] = useState(false);

  const handlePortraitFile = async (file: FileUploadSelection): Promise<void> => {
    setPortraitError(null);
    const outcome = await uploadPortrait(file);
    if (!outcome.ok) {
      // `aborted` = the user dismissed the picker — silence by design.
      if (outcome.reason !== 'aborted') setPortraitError(outcome.reason);
      return;
    }
    setStagedPortrait(outcome.file);
  };

  const clearStagedPortrait = () => {
    setStagedPortrait(null);
    setPortraitError(null);
  };

  const handleSavePortrait = async (): Promise<void> => {
    if (stagedPortrait === null || savingPortrait) return;
    setSavingPortrait(true);
    const merged: AboutContent = { ...content, portrait: stagedPortrait.path };
    try {
      await dispatch(
        apiSlice.endpoints.updateAboutPortrait.initiate({
          content: merged,
          // shared cannot know AboutContent (FSD) — the seam parameter is
          // `unknown`, down-cast to the contract this feature owns. Passing
          // `persistAboutContent` directly fails strict contravariance.
          persist: (doc) => persistAboutContent(doc as AboutContent),
        })
      ).unwrap();
    } catch {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return; // store unchanged; the staged file stays for a retry
    } finally {
      setSavingPortrait(false);
    }
    dispatch(updateAboutContent(merged));
    setStagedPortrait(null);
    addToast({ message: t('aboutSaved'), type: 'success' });
  };

  // Rows in document order (R-1 v2): every description, every stats
  // record entry in insertion order (addressed BY KEY — a custom stat is
  // a first-class row), the CTA row while it is not null. The LAST row
  // stays deletable — the vitrina tolerates empty blocks (R-3).
  const rows: AboutTableRow[] = [
    ...content.descriptions.map((paragraph, index) => ({
      id: `description-${index}` as VitrinaField,
      label: fieldLabel(`description-${index}` as EditAboutField),
      en: paragraph.en,
      ru: paragraph.ru,
    })),
    ...Object.keys(content.stats).map((key) => ({
      id: `stat-${key}` as VitrinaField,
      label: statRowLabel(content, key, language, (translate) => t(translate)),
      en: content.stats[key]?.en ?? '',
      ru: content.stats[key]?.ru ?? '',
    })),
    ...(content.ctaLabel !== null
      ? [
          {
            id: 'ctaLabel' as VitrinaField,
            label: t('aboutFieldCta'),
            en: content.ctaLabel.en,
            ru: content.ctaLabel.ru,
          },
        ]
      : []),
  ];

  return (
    <section className={classNames(styles.editor, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={2}>{t('adminAboutTitle')}</Heading>
          <Paragraph theme="muted">{t('adminAboutHint')}</Paragraph>
        </div>
        {/* WU-12 (R-2): the add trigger lives in the HEADER (never in a
            table cell) and comes BEFORE Reset in document order. */}
        <div className={styles.headerActions}>
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            {t('adminAboutAddRow')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => requestReset('reset')}>
            {t('aboutReset')}
          </Button>
        </div>
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

      {/* WU-14 (R-7): portrait block — sits with the fullName scalar block
          (the header is button-only). The Avatar preview shows the SAVED
          state with the SAME D14 variant as the showcase (static asset
          fallback while the document has no portrait); the kit FileUpload
          gates .jpg/.png by BOTH extension and MIME (`acceptExtensions`,
          `adminAboutPortraitFormat` otherwise) and previews the staged pick
          itself. Save is staged-only: file written first, then the RTK
          Query mutation persists the document, then the dispatch. */}
      <div className={styles.portraitRow} data-testid="admin-about-portrait">
        {/* The D14 portrait variant is deliberately SIZE-LESS (no
            width/height — the consumer's class owns the box, exactly like
            About.module.scss `.portrait`), so the preview box class rides
            the Avatar itself. */}
        <Avatar
          data-testid="admin-about-portrait-preview"
          src={content.portrait ?? aboutPortrait}
          alt={t('adminAboutPortraitPreview')}
          variant="portrait"
          className={styles.portraitPreview}
        />
        <div className={styles.portraitUpload}>
          <FileUpload
            label={t('adminAboutPortraitLabel')}
            acceptExtensions={['.jpg', '.png']}
            texts={{
              button: t('adminAboutPortraitButton'),
              hint: t('adminAboutPortraitHint'),
              notImage: t('adminAboutPortraitNotImage'),
              tooLarge: t('adminAboutPortraitTooLarge'),
              undecodable: t('adminAboutPortraitUndecodable'),
              wrongFormat: t('adminAboutPortraitFormat'),
              selected: t('adminAboutPortraitSelected'),
            }}
            onFileSelect={handlePortraitFile}
          />
          {/* Static keys on purpose — the existence guard scans t('…')
              literals; a dynamic t(errorKey) would go unguarded. */}
          {portraitError === 'unsupported' ? (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t('adminAboutPortraitUnsupported')}</span>
            </Paragraph>
          ) : null}
          {portraitError === 'write-failed' ? (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t('adminAboutPortraitSaveError')}</span>
            </Paragraph>
          ) : null}
          <div className={styles.portraitActions}>
            <Button
              type="button"
              variant="primary"
              disabled={stagedPortrait === null}
              loading={savingPortrait}
              onClick={handleSavePortrait}
            >
              {t('adminAboutPortraitSave')}
            </Button>
            {stagedPortrait !== null ? (
              <Button type="button" variant="outline" onClick={clearStagedPortrait}>
                {t('aboutCancel')}
              </Button>
            ) : null}
          </div>
        </div>
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
            // R-2/R-3 (WU-12): a Pencil (field edit) + a Trash2 (delete
            // confirm) per row — `.cellActions` keeps the icon row nowrap
            // (resume-table-cell-actions-row).
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
                <Tooltip content={t('adminAboutDeleteRow')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminAboutDeleteRow')}
                    data-testid={`admin-about-delete-${row.id}`}
                    onClick={() => requestDelete(row.id)}
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

      {/* WU-12 (R-3): delete-row confirm — the subtitle names the row
          ({{name}} = the row label), focus starts on «Отмена», a persist
          failure keeps this modal open (useConfirmAction keep-open-on-false). */}
      <Modal
        isOpen={deletingField !== null}
        onClose={closeDeleteConfirm}
        title={t('adminAboutDeleteRow')}
        subtitle={
          deletingField !== null
            ? t('adminAboutDeleteRowName', { name: fieldLabel(deletingField) })
            : undefined
        }
        size="sm"
        initialFocusRef={cancelDeleteRef}
        footer={
          <>
            <Button
              ref={cancelDeleteRef}
              type="button"
              variant="outline"
              onClick={closeDeleteConfirm}
            >
              {t('aboutCancel')}
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleConfirmDelete}>
              {t('adminAboutDeleteRow')}
            </Button>
          </>
        }
      >
        {null}
      </Modal>

      {/* WU-12 (R-2): add-row modal — AboutRowAddForm owns the kind Select
          and the per-kind fields; `onAdd` IS the persist-THEN-dispatch
          seam (a false return keeps this modal open with the values).
          The heading names the dialog (aria-dialog-name). */}
      <Modal isOpen={adding} onClose={closeAddModal} title={t('adminAboutAddRowTitle')} size="md">
        <AboutRowAddForm
          document={content}
          canAddCta={content.ctaLabel === null}
          onAdd={handleAddRow}
          onExitAdd={closeAddModal}
        />
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
