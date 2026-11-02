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
import { Select } from '@/shared/ui/Select';
import { Table } from '@/shared/ui/Table';
import { Paragraph } from '@/shared/ui/Paragraph';

import { Textarea } from '@/shared/ui/Textarea';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { createAboutSeed } from '../../model/services/seed';
import { selectAllTechnologies } from '@/entities/Technology';
import { selectAboutContent } from '../../model/selectors/selectors';
import {
  persistAboutContent,
  readAboutContent,
  removeAboutContent,
} from '../../model/services/storage';
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
      // Persist locally FIRST so admin edits survive even if the API is
      // temporarily unavailable; the persist-THEN-dispatch rule still
      // holds for Redux state.
      persistAboutContent(doc);
      try {
        await dispatch(
          apiSlice.endpoints.updateAboutContent.initiate({
            fullName: doc.fullName,
            descriptions: doc.descriptions,
            stats: doc.stats,
            statLabels: doc.statLabels,
            ctaLabel: doc.ctaLabel,
            portrait: doc.portrait,
            stack: doc.stack,
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
  const [stackDraft, setStackDraft] = useState<string[] | undefined>(() => {
    const local = readAboutContent();
    return local?.stack ?? content.stack;
  });
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
  const [ctaOpen, setCtaOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [techPick, setTechPick] = useState(
    technologiesCatalog.some((tech) => tech.key === 'react')
      ? 'react'
      : (technologiesCatalog[0]?.key ?? '')
  );
  const [editingTech, setEditingTech] = useState('');
  const [selectAllTech, setSelectAllTech] = useState(false);

  const closeFieldModal = () => setEditingField(null);
  const closeAddModal = () => setAdding(false);
  const closePortraitModal = () => setPortraitOpen(false);
  const closeCtaModal = () => setCtaOpen(false);
  const closeTechModal = () => setTechOpen(false);

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

  const openCtaModal = () => {
    setCtaNlDraft(content.ctaLabel?.en ?? '');
    setCtaRuDraft(content.ctaLabel?.ru ?? '');
    setCtaHidden(content.ctaLabel === null);
    setCtaOpen(true);
  };
  const openTechModal = () => {
    setEditingTech('');
    setTechPick(
      technologiesCatalog.some((tech) => tech.key === 'react')
        ? 'react'
        : (technologiesCatalog[0]?.key ?? '')
    );
    setSelectAllTech(false);
    setTechOpen(true);
  };
  const openTechEditModal = (key: string) => {
    setEditingTech(key);
    setTechPick(key);
    setSelectAllTech(false);
    setTechOpen(true);
  };
  const handleSaveTechModal = async (): Promise<void> => {
    const next = [...(stackDraft ?? [])];
    if (editingTech !== '' && editingTech !== techPick) {
      const index = next.indexOf(editingTech);
      if (index >= 0) next.splice(index, 1);
    }
    if (selectAllTech)
      technologiesCatalog.forEach((tech) => {
        if (!next.includes(tech.key)) next.push(tech.key);
      });
    if (techPick !== '' && !next.includes(techPick)) next.push(techPick);
    setStackDraft(next);
    setStackDirty(true);
    setEditingTech('');
    const merged: AboutContent = { ...content, stack: next };
    const ok = await persistAboutContentToApi(merged);
    if (!ok) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return;
    }
    dispatch(updateAboutContent(merged));
    setStackDirty(false);
    addToast({ message: t('aboutSaved'), type: 'success' });
    closeTechModal();
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
    closeCtaModal();
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
          {contentNode}
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
            <Button type="button" variant="outline" size="sm" onClick={() => requestReset('reset')}>
              {t('aboutReset')}
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
          <Table
            caption="adminAboutDescriptionsTable"
            columns={[
              {
                key: 'field',
                header: t('aboutFieldDescriptions'),
                render: (row: Record<string, unknown>) => String((row as { label: string }).label),
              },
              {
                key: 'en',
                header: 'EN',
                render: (row: Record<string, unknown>) => String((row as { en: string }).en),
              },
              {
                key: 'ru',
                header: 'RU',
                render: (row: Record<string, unknown>) => String((row as { ru: string }).ru),
              },
              {
                key: 'actions',
                header: t('adminAboutEditRow'),
                render: (row: Record<string, unknown>) => (
                  <div className={styles.cellActions}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminAboutEditRow')}
                      data-testid={
                        'admin-about-edit-description-' + (row as { index: number }).index
                      }
                      onClick={() =>
                        setEditingField(
                          ('description-' + (row as { index: number }).index) as EditAboutField
                        )
                      }
                    />
                    <IconButton
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminAboutDeleteRow')}
                      data-testid={
                        'admin-about-delete-description-' + (row as { index: number }).index
                      }
                      onClick={() =>
                        requestDelete(
                          ('description-' + (row as { index: number }).index) as AboutRowField
                        )
                      }
                    />
                  </div>
                ),
              },
            ]}
            rows={content.descriptions.map((paragraph, index) => ({
              __key: index,
              index,
              label: t('aboutFieldDescriptions') + ' ' + (index + 1),
              en: paragraph.en,
              ru: paragraph.ru,
            }))}
            getKey={(row: Record<string, unknown>) => String((row as { __key: number }).__key)}
          />
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
            <Button type="button" variant="outline" size="sm" onClick={openTechModal}>
              {t('adminAboutSelectTechnology')}
            </Button>
            <Table
              caption="adminAboutTechnologiesTable"
              columns={[
                {
                  key: 'key',
                  header: 'Technology',
                  render: (row: Record<string, unknown>) => String((row as { key: string }).key),
                },
                {
                  key: 'actions',
                  header: t('adminAboutEditRow'),
                  align: 'right',
                  render: (row: Record<string, unknown>) => (
                    <div className={styles.cellActions}>
                      <IconButton
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                        ariaLabel={t('adminAboutEditRow')}
                        onClick={() => openTechEditModal((row as { key: string }).key)}
                      />
                      <IconButton
                        type="button"
                        variant="danger"
                        size="sm"
                        icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                        ariaLabel={t('adminAboutDeleteRow')}
                        onClick={() => toggleTech((row as { key: string }).key)}
                      />
                    </div>
                  ),
                },
              ]}
              rows={(stackDraft ?? []).map((key) => ({ __key: key, key }))}
              getKey={(row: Record<string, unknown>) => String((row as { __key: string }).__key)}
              emptyState={
                <EmptyState title={<Heading>{t('adminAboutTechnologiesPlaceholder')}</Heading>} />
              }
            />
            {stackDraft?.some((key) => !technologiesCatalog.some((tech) => tech.key === key)) ? (
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
        <Table
          caption="adminAboutStatsTable"
          columns={[
            {
              key: 'label',
              header: 'Field',
              render: (row: Record<string, unknown>) => String((row as { label: string }).label),
            },
            {
              key: 'en',
              header: 'EN',
              render: (row: Record<string, unknown>) => String((row as { en: string }).en),
            },
            {
              key: 'ru',
              header: 'RU',
              render: (row: Record<string, unknown>) => String((row as { ru: string }).ru),
            },
            {
              key: 'actions',
              header: t('adminAboutEditRow'),
              render: (row: Record<string, unknown>) => (
                <div className={styles.cellActions}>
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminAboutEditRow')}
                    data-testid={'admin-about-edit-stat-' + (row as { key: string }).key}
                    onClick={() =>
                      setEditingField(('stat-' + (row as { key: string }).key) as EditAboutField)
                    }
                  />
                  <IconButton
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminAboutDeleteRow')}
                    data-testid={'admin-about-delete-stat-' + (row as { key: string }).key}
                    onClick={() =>
                      requestDelete(('stat-' + (row as { key: string }).key) as AboutRowField)
                    }
                  />
                </div>
              ),
            },
          ]}
          rows={Object.keys(content.stats).map((key) => ({
            __key: key,
            key,
            label: statRowLabel(content, key, language, (k) => t(k)),
            en: content.stats[key]?.en ?? '',
            ru: content.stats[key]?.ru ?? '',
          }))}
          getKey={(row: Record<string, unknown>) => (row as { __key: string }).__key}
        />
      )}

      {/* Card 5: CTA */}
      {renderCollapseCard(
        'adminAboutCardCta',
        'cta',
        <>
          <Paragraph theme="muted">
            {content.ctaLabel === null ? t('adminAboutCtaHidden') : content.ctaLabel.en}
          </Paragraph>
          <Button type="button" variant="outline" size="sm" onClick={openCtaModal}>
            {t('adminAboutEditRow')}
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

      <Modal isOpen={ctaOpen} onClose={closeCtaModal} title={t('aboutFieldCta')} size="md">
        <div className={styles.portraitModal}>
          <Textarea
            label={t('adminAboutCtaEn')}
            value={ctaNlDraft}
            onChange={(event) => setCtaNlDraft(event.target.value)}
            rows={2}
            maxLength={40}
            showCounter
          />
          <Textarea
            label={t('adminAboutCtaRu')}
            value={ctaRuDraft}
            onChange={(event) => setCtaRuDraft(event.target.value)}
            rows={2}
            maxLength={40}
            showCounter
          />
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={ctaHidden}
              onChange={(event) => setCtaHidden(event.target.checked)}
            />
            <span>{t('adminAboutCtaHidden')}</span>
          </label>
          <div className={styles.portraitActions}>
            <Button type="button" variant="primary" onClick={handleSaveCta}>
              {t('aboutSave')}
            </Button>
            <Button type="button" variant="outline" onClick={closeCtaModal}>
              {t('aboutCancel')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={techOpen}
        onClose={closeTechModal}
        title={t('adminAboutSelectTechnology')}
        size="md"
      >
        <div className={styles.portraitModal}>
          <Select
            label={t('adminAboutSelectTechnology')}
            value={techPick}
            onChange={(value) => setTechPick(value)}
            options={technologiesCatalog.map((tech) => ({ value: tech.key, label: tech.key }))}
            fullWidth
          />
          {techPick !== '' && (stackDraft ?? []).includes(techPick) && editingTech !== techPick ? (
            <Paragraph theme="muted">{t('adminAboutTechAlreadySelected')}</Paragraph>
          ) : null}
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={selectAllTech}
              onChange={(event) => setSelectAllTech(event.target.checked)}
            />
            <span>{t('adminAboutSelectAll')}</span>
          </label>
          <div className={styles.portraitActions}>
            <Button type="button" variant="primary" onClick={handleSaveTechModal}>
              {t('aboutSave')}
            </Button>
            <Button type="button" variant="outline" onClick={closeTechModal}>
              {t('aboutCancel')}
            </Button>
          </div>
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
