// ============================================
// AboutEditorList — admin vitrina for the About document
// (about-admin-sections WU-4: 5 cards, collapsed by default)
// ============================================
//
// SPEC R-1..R-6: пять независимых kit Cards («Основное», «Описания»,
// «Технологии», «Показатели», «CTA») вместо единой таблицы и пагинации.
// Каждая карточка свёрнута по умолчанию; состояние сворачивания persist-ится
// в localStorage (admin-about:collapsed, версия, try/catch + prune). Шапка
// редактора и все модальные окна доступны ВСЕГДА (вне карточек).
//
// Seam saveAboutField / persistAboutContentToApi не менялись (stack = WU-5).

import { useCallback, useEffect, useState } from 'react';

import type { AboutContent } from '@/entities/AboutContent';
import { apiSlice } from '@/shared/api';
import aboutPortrait from '@/shared/assets/Firefly_RemoveBackground.webp';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { ensureRootWithinGesture } from '@/shared/lib/imageDir';
import { useConfirmAction } from '@/shared/lib/hooks/useConfirmAction';
import { classNames } from '@/shared/lib/utils/classNames';
import { Avatar } from '@/shared/ui/Avatar';
import { Button, IconButton } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FileUpload, type FileUploadSelection } from '@/shared/ui/FileUpload';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';

import { Textarea } from '@/shared/ui/Textarea';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { createAboutSeed } from '../../model/services/seed';
import { selectAllTechnologies } from '@/entities/Technology';
import { selectAboutContent } from '../../model/selectors/selectors';
import { removeAboutContent } from '../../model/services/storage';
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
import { SectionKey, readCollapseState, writeCollapseState } from './lib/collapseState';

export interface AboutEditorListProps {
  className?: string;
  'data-testid'?: string;
}

export const AboutEditorList: React.FC<AboutEditorListProps> = ({
  className = '',
  'data-testid': testId = 'about-editor-list',
}) => {
  const content = useSelector(selectAboutContent);
  const technologiesCatalog = useSelector(selectAllTechnologies);
  const dispatch = useDispatch<ThunkDispatch<AboutContentRootState, unknown, UnknownAction>>();
  const { t, language } = useLanguage();
  const { addToast } = useToast();

  const persistAboutContentToApi = useCallback(
    async (doc: AboutContent) => {
      try {
        await dispatch(
          apiSlice.endpoints.updateAboutContent.initiate({
            fullName: doc.fullName,
            descriptions: doc.descriptions,
            stats: doc.stats,
            statLabels: doc.statLabels,
            ctaLabel: doc.ctaLabel,
            portrait: doc.portrait,
            expectedUpdatedAt: doc.updatedAt,
          })
        ).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [dispatch]
  );

  const {
    pending: pendingReset,
    cancelRef: cancelResetRef,
    request: requestReset,
    cancel: closeResetConfirm,
    confirm: handleConfirmReset,
  } = useConfirmAction<'reset'>({
    onConfirm: async () => {
      removeAboutContent();
      dispatch(resetToDefaults());
      void persistAboutContentToApi(createAboutSeed());
      return true;
    },
  });

  const {
    pending: deletingField,
    confirming: deleting,
    cancelRef: cancelDeleteRef,
    request: requestDelete,
    cancel: closeDeleteConfirm,
    confirm: handleConfirmDelete,
  } = useConfirmAction<AboutRowField>({
    onConfirm: async (field) => {
      const merged = await persistRemovedAboutRow(content, field, persistAboutContentToApi);
      if (merged === null) {
        addToast({ message: t('aboutSaveError'), type: 'error' });
        return false;
      }
      dispatch(updateAboutContent(merged));
      addToast({ message: t('adminAboutRowDeleted'), type: 'success' });
      return true;
    },
  });

  const [editingField, setEditingField] = useState<EditAboutField | null>(null);
  const [adding, setAdding] = useState(false);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [fullNameDraft, setFullNameDraft] = useState(content.fullName);
  const [stackDraft, setStackDraft] = useState<string[] | undefined>(content.stack);
  const [stackDirty, setStackDirty] = useState(false);

  const fullNameParsed = aboutFieldSchema('fullName').safeParse(fullNameDraft);
  const fullNameValid = fullNameParsed.success;
  const fullNameDirty = fullNameDraft !== content.fullName;

  const handleSaveFullName = async (): Promise<void> => {
    if (!fullNameParsed.success) return;
    const merged = await persistMergedAboutField(
      content,
      'fullName',
      fullNameParsed.data as string,
      persistAboutContentToApi
    );
    if (merged === null) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return;
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('aboutSaved'), type: 'success' });
  };

  const [ctaNlDraft, setCtaNlDraft] = useState(content.ctaLabel?.en ?? '');
  const [ctaRuDraft, setCtaRuDraft] = useState(content.ctaLabel?.ru ?? '');
  const [ctaHidden, setCtaHidden] = useState(content.ctaLabel === null);

  const closeFieldModal = () => setEditingField(null);
  const closeAddModal = () => setAdding(false);
  const closePortraitModal = () => setPortraitOpen(false);

  const toggleTech = (key: string) => {
    setStackDraft((prev) => {
      const next = [...(prev ?? [])];
      const idx = next.indexOf(key);
      if (idx >= 0) next.splice(idx, 1);
      else next.push(key);
      return next;
    });
    setStackDirty(true);
  };

  const handleSaveTech = async (): Promise<void> => {
    const merged: AboutContent = { ...content, stack: stackDraft };
    const ok = await persistAboutContentToApi(merged);
    if (!ok) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return;
    }
    dispatch(updateAboutContent(merged));
    setStackDirty(false);
    addToast({ message: t('aboutSaved'), type: 'success' });
  };

  // collapse state (persisted)
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>(readCollapseState);

  useEffect(() => {
    writeCollapseState(collapsed);
  }, [collapsed]);

  useEffect(() => {
    writeCollapseState(collapsed);
  }, [collapsed]);

  const toggleSection = (section: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [stagedPortrait, setStagedPortrait] = useState<UploadedPortrait | null>(null);
  const [portraitError, setPortraitError] = useState<PortraitUploadFailure | null>(null);
  const [portraitDetail, setPortraitDetail] = useState<string | null>(null);
  const [savingPortrait, setSavingPortrait] = useState(false);

  const handlePortraitFile = async (file: FileUploadSelection): Promise<void> => {
    setPortraitError(null);
    setPortraitDetail(null);
    const outcome = await uploadPortrait(file);
    if (!outcome.ok) {
      if (outcome.reason !== 'aborted') setPortraitError(outcome.reason);
      if (outcome.detail) setPortraitDetail(outcome.detail);
      return;
    }
    setStagedPortrait(outcome.file);
  };

  const clearStagedPortrait = () => {
    setStagedPortrait(null);
    setPortraitError(null);
    setPortraitDetail(null);
  };

  const handleSavePortrait = async (): Promise<void> => {
    if (stagedPortrait === null || savingPortrait) return;
    setSavingPortrait(true);
    const merged: AboutContent = { ...content, portrait: stagedPortrait.key };
    try {
      await dispatch(
        apiSlice.endpoints.updateAboutPortrait.initiate({
          content: merged,
          persist: (doc) => persistAboutContentToApi(doc as AboutContent),
        })
      ).unwrap();
    } catch {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return;
    } finally {
      setSavingPortrait(false);
    }
    dispatch(updateAboutContent(merged));
    setStagedPortrait(null);
    addToast({ message: t('aboutSaved'), type: 'success' });
  };

  const handleSaveField = async (
    field: EditAboutField,
    value: AboutFieldValue
  ): Promise<boolean> => {
    const merged = await persistMergedAboutField(content, field, value, persistAboutContentToApi);
    if (merged === null) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return false;
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('aboutSaved'), type: 'success' });
    return true;
  };

  const handleAddRow = async (payload: AboutRowPayload): Promise<boolean> => {
    const merged = await persistAddedAboutRow(content, payload, persistAboutContentToApi);
    if (merged === null) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return false;
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('adminAboutRowAdded'), type: 'success' });
    return true;
  };

  const fieldLabel = (field: EditAboutField): string => {
    if (field === 'fullName') return t('aboutFieldFullName');
    if (field === 'ctaLabel') return t('aboutFieldCta');
    if (field.startsWith('description-'))
      return `${t('aboutFieldDescriptions')} ${descriptionIndexOf(field) + 1}`;
    return statRowLabel(content, statKeyOf(field), language, (key) => t(key));
  };

  const handleSaveCta = async (): Promise<void> => {
    const merged: AboutContent = {
      ...content,
      ctaLabel: ctaHidden ? null : { en: ctaNlDraft, ru: ctaRuDraft },
    };
    const ok = await persistAboutContentToApi(merged);
    if (!ok) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return;
    }
    dispatch(updateAboutContent(merged));
    addToast({ message: t('aboutSaved'), type: 'success' });
  };

  const iconToggle = (section: SectionKey, placement: 'expanded' | 'collapsed') => {
    if (placement === 'expanded') {
      return (
        <Tooltip content={t('adminAboutCollapseTable')} position="top" showDelay={0}>
          <IconButton
            type="button"
            variant="outline"
            size="md"
            icon={<Icon name={Minus} size={20} color="inherit" decorative />}
            ariaLabel={t('adminAboutCollapseTable')}
            aria-expanded={true}
            data-testid={`admin-about-collapse-${section}`}
            onClick={() => toggleSection(section)}
          />
        </Tooltip>
      );
    }
    const cid = `about-card-content-${section}`;
    return (
      <Tooltip content={t('adminAboutExpandTable')} position="top" showDelay={0}>
        <IconButton
          type="button"
          variant="outline"
          size="md"
          fullWidth
          className={styles.strip}
          icon={<Icon name={Plus} size={20} color="inherit" decorative />}
          ariaLabel={t('adminAboutExpandTable')}
          aria-expanded={false}
          aria-controls={cid}
          data-testid={`admin-about-expand-${section}`}
          onClick={() => toggleSection(section)}
        />
      </Tooltip>
    );
  };

  const renderCollapseCard = (
    titleKey: string,
    section: SectionKey,
    contentNode: React.ReactNode
  ) => {
    const cid = `about-card-content-${section}`;
    const expanded = !collapsed[section];
    return (
      <Card
        variant="default"
        size="default"
        hoverable={false}
        className={styles.block}
        data-testid={`admin-about-card-${section}`}
      >
        <h3 className={styles.cardTitle}>{t(titleKey)}</h3>
        {expanded ? iconToggle(section, 'expanded') : iconToggle(section, 'collapsed')}
        <div id={cid} className={styles.cardContent} hidden={!expanded}>
          {expanded ? contentNode : null}
        </div>
      </Card>
    );
  };

  return (
    <section className={classNames(styles.editor, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={2}>{t('adminAboutTitle')}</Heading>
          <Paragraph theme="muted">{t('adminAboutHint')}</Paragraph>
        </div>
        <div className={styles.headerActions}>
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            {t('adminAboutAddRow')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="admin-about-portrait-button"
            onClick={() => setPortraitOpen(true)}
          >
            {t('adminAboutPortraitEdit')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => requestReset('reset')}>
            {t('aboutReset')}
          </Button>
        </div>
      </div>

      {/* Card 1: Основное */}
      {renderCollapseCard(
        'adminAboutCardMain',
        'main',
        <>
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
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => setPortraitOpen(true)}>
              {t('adminAboutPortraitEdit')}
            </Button>
          </div>
        </>
      )}

      {/* Card 2: Описания */}
      {renderCollapseCard(
        'adminAboutCardDescriptions',
        'descriptions',
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            {t('adminAboutAddRow')}
          </Button>
          <ul className={styles.rowList}>
            {content.descriptions.map((paragraph, index) => {
              const field = `description-${index}` as EditAboutField;
              return (
                <li key={index} className={styles.rowItem}>
                  <span className={styles.rowLabel}>
                    {t('aboutFieldDescriptions')} {index + 1}
                  </span>
                  <div className={styles.rowActions}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminAboutEditRow')}
                      data-testid={`admin-about-edit-description-${index}`}
                      onClick={() => setEditingField(field)}
                    />
                    <IconButton
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminAboutDeleteRow')}
                      data-testid={`admin-about-delete-description-${index}`}
                      onClick={() => requestDelete(field as AboutRowField)}
                    />
                  </div>
                  <details open={false} className={styles.rowDetails}>
                    <summary>{t('aboutFieldDescriptions')}</summary>
                    <div className={styles.localeColumns}>
                      <span>EN: {paragraph.en}</span>
                      <span>RU: {paragraph.ru}</span>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Card 3: Технологии — placeholder WU-5 */}
      {renderCollapseCard(
        'adminAboutCardTechnologies',
        'technologies',
        technologiesCatalog.length === 0 ? (
          <EmptyState
            title={<Heading>{t('adminAboutCardTechnologies')}</Heading>}
            description={
              <Paragraph theme="muted">{t('adminAboutTechnologiesPlaceholder')}</Paragraph>
            }
          />
        ) : (
          <>
            <div className={styles.chipRow}>
              {(stackDraft ?? []).map((key) => {
                const entry = technologiesCatalog.find((t) => t.key === key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={styles.chipSelected}
                    onClick={() => toggleTech(key)}
                  >
                    {entry?.key ?? key} ×
                  </button>
                );
              })}
              {technologiesCatalog
                .filter((tech) => !(stackDraft ?? []).includes(tech.key))
                .map((tech) => (
                  <button
                    key={tech.key}
                    type="button"
                    className={styles.chip}
                    onClick={() => toggleTech(tech.key)}
                  >
                    {tech.key}
                  </button>
                ))}
            </div>
            {stackDraft?.some((key) => !technologiesCatalog.some((t) => t.key === key)) ? (
              <Paragraph theme="muted">{t('adminAboutTechUnknown')}</Paragraph>
            ) : null}
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!stackDirty}
              onClick={handleSaveTech}
            >
              {t('aboutSave')}
            </Button>
          </>
        )
      )}

      {/* Card 4: Показатели */}
      {renderCollapseCard(
        'adminAboutCardStats',
        'stats',
        <ul className={styles.rowList}>
          {Object.keys(content.stats).map((key) => {
            const field = `stat-${key}` as EditAboutField;
            const val = content.stats[key];
            return (
              <li key={key} className={styles.rowItem}>
                <span className={styles.rowLabel}>
                  {statRowLabel(content, key, language, (k) => t(k))}
                </span>
                <div className={styles.rowActions}>
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminAboutEditRow')}
                    data-testid={`admin-about-edit-stat-${key}`}
                    onClick={() => setEditingField(field)}
                  />
                  <IconButton
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminAboutDeleteRow')}
                    data-testid={`admin-about-delete-stat-${key}`}
                    onClick={() => requestDelete(field as AboutRowField)}
                  />
                </div>
                <div className={styles.localeColumns}>
                  <span>EN: {val?.en ?? ''}</span>
                  <span>RU: {val?.ru ?? ''}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Card 5: CTA */}
      {renderCollapseCard(
        'adminAboutCardCta',
        'cta',
        <>
          <Textarea
            value={ctaNlDraft}
            onChange={(event) => setCtaNlDraft(event.target.value)}
            rows={2}
            maxLength={40}
          />
          <Textarea
            value={ctaRuDraft}
            onChange={(event) => setCtaRuDraft(event.target.value)}
            rows={2}
            maxLength={40}
          />
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={ctaHidden}
              onChange={(event) => setCtaHidden(event.target.checked)}
            />
            <span>{t('adminAboutCtaHidden')}</span>
          </label>
          <Button type="button" variant="primary" size="sm" onClick={handleSaveCta}>
            {t('aboutSave')}
          </Button>
        </>
      )}

      {/* portait modal etc unchanged blocks from original */}
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

      <Modal isOpen={adding} onClose={closeAddModal} title={t('adminAboutAddRowTitle')} size="md">
        <AboutRowAddForm
          document={content}
          canAddCta={content.ctaLabel === null}
          onAdd={handleAddRow}
          onExitAdd={closeAddModal}
        />
      </Modal>

      <Modal
        isOpen={portraitOpen}
        onClose={closePortraitModal}
        title={t('adminAboutPortraitTitle')}
        size="lg"
      >
        <div className={styles.portraitModal}>
          <div className={styles.portraitUpload}>
            <FileUpload
              label={t('adminAboutPortraitLabel')}
              acceptExtensions={['.jpg', '.jpeg', '.png', '.webp']}
              texts={{
                button: t('adminAboutPortraitButton'),
                hint: t('adminAboutPortraitHint'),
                notImage: t('adminAboutPortraitNotImage'),
                tooLarge: t('adminAboutPortraitTooLarge'),
                undecodable: t('adminAboutPortraitUndecodable'),
                wrongFormat: t('adminAboutPortraitFormat'),
                selected: t('adminAboutPortraitSelected'),
              }}
              onBeforeSelect={() => ensureRootWithinGesture()}
              onFileSelect={handlePortraitFile}
            />
            {portraitError === 'unsupported' ? (
              <Paragraph asChild theme="error" size="s">
                <span role="alert">{t('adminAboutPortraitUnsupported')}</span>
              </Paragraph>
            ) : null}
            {portraitError === 'write-failed' ||
            portraitError === 'security' ||
            portraitError === 'quota' ||
            portraitError === 'conflict' ? (
              <Paragraph asChild theme="error" size="s">
                <span role="alert">
                  {t('adminAboutPortraitSaveError')}
                  {portraitDetail ? ` (${portraitDetail})` : ''}
                </span>
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
          <Avatar
            data-testid="admin-about-portrait-preview"
            src={content.portrait ?? aboutPortrait}
            alt={t('adminAboutPortraitPreview')}
            variant="portrait"
            className={styles.portraitModalPreview}
          />
        </div>
      </Modal>

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
