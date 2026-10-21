// ============================================
// ContactEditorForm — admin edit surface for the Contact section
// ============================================
//
// contact-rows-crud (plan rev.5 §10, Трек D): the whole-document form is
// gone — texts/formTexts are per-row CRUD tables inside COLLAPSIBLE Cards
// (owner directive 2026-10-18, AdminSkills/AdminJobs parity):
// - all three Cards are collapsed by default (Skills A15/A17 geometry);
// - table cells hold plain strings — NO inputs inside rows (R-4);
// - every row carries Pencil/Trash2 in a nowrap `.cellActions` cell;
// - the Card header holds «Add row» + «Reset table» (D5);
// - row add/edit happens in a kit Modal around <ContactRowForm/> (R-5);
// - delete/reset are kit Modal confirms with Cancel-focus (R-6);
// - the email keeps its own inline Save (D6, merged snapshot via the
//   full-replace `updateContactContent`).
//
// contact-social-crud (plan rev.7 §10.2, R-5): the socials Card joins the
// CRUD set (owner directive 2026-10-18 — D8 read-only is closed): rows
// render from ContactContent.socialLinks, every URL cell is a ghost-variant
// kit Link, rows carry Pencil/Trash2 in `.cellActions`, the header has
// Add/Reset, and row add/edit goes through <ContactSocialForm/> in its
// own Modal. SOCIAL_LINKS stays the SEED source (vitrina/Nav keep
// reading the constant — split-brain accepted until the DB lands).
//
// Invariants kept from the stage-1 form:
// - persist BEFORE dispatch; a failed write toasts and keeps the modal open.
// - ALL copy is i18n key lookups, never literals.

import type { ContactContent, ContactSocialLink, LocalizedText } from '@/entities/ContactContent';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { useConfirmAction } from '@/shared/lib/hooks/useConfirmAction';
import { classNames } from '@/shared/lib/utils/classNames';
import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { Link } from '@/shared/ui/Link';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Minus, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { selectContactContent } from '../../model/selectors/selectors';
import { createContactSeed } from '../../model/services/seed';
import { persistContactContent } from '../../model/services/storage';
import {
  contactTableField,
  removeContactTableRow,
  resetContactTable,
  updateContactContent,
  type ContactTableRow,
  type ContactTextTableRow,
} from '../../model/slices/contactContentSlice';
import { ContactRowForm } from '../ContactRowForm/ContactRowForm';
import { ContactSocialForm } from '../ContactSocialForm/ContactSocialForm';
import { withTableRows } from '../ContactRowForm/lib/withTableRows';
import styles from './ContactEditorForm.module.scss';

/** The three collapsible groups of the editor. */
type GroupId = ContactTableRow | 'socials';

/** One rendered table row: the object key and its bilingual value. */
interface TableRow {
  key: string;
  value: LocalizedText;
}

/** The email must stay a syntactically valid address (schema parity). */
const emailSchema = z.string().trim().pipe(z.email());

/** Row deletion without the TS2790 `delete` restriction (slice parity). */
const omitKey = (
  rows: Record<string, LocalizedText> | Record<string, ContactSocialLink>,
  key: string
) => {
  const copy = { ...rows };
  Reflect.deleteProperty(copy, key);
  return copy;
};

export interface ContactEditorFormProps {
  className?: string;
  'data-testid'?: string;
}

export const ContactEditorForm: React.FC<ContactEditorFormProps> = ({
  className = '',
  'data-testid': testId = 'contact-editor-form',
}) => {
  const content = useSelector(selectContactContent);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  // R-3: every group is COLLAPSED by default (owner directive 2026-10-18).
  const [collapsed, setCollapsed] = useState<Partial<Record<GroupId, boolean>>>({});
  const isCollapsed = (group: GroupId) => collapsed[group] ?? true;
  const collapseGroup = (group: GroupId) => setCollapsed((prev) => ({ ...prev, [group]: true }));
  const expandGroup = (group: GroupId) => setCollapsed((prev) => ({ ...prev, [group]: false }));

  // D6: the email draft — its own mini-pipeline, no whole-document form.
  const [emailDraft, setEmailDraft] = useState(content.email);

  // R-5: the row form modal (add when `row` is undefined, edit otherwise).
  const [pendingRow, setPendingRow] = useState<{
    table: ContactTextTableRow;
    row?: TableRow;
  } | null>(null);
  // R-6: delete-row confirm + per-table reset confirm — the destructive-
  // confirm state machines extracted to the shared hook (issue #302).
  const {
    pending: pendingDelete,
    cancelRef: cancelDeleteRef,
    request: requestDelete,
    cancel: closeDelete,
    confirm: handleConfirmDelete,
  } = useConfirmAction<{ table: ContactTableRow; key: string }>({
    onConfirm: ({ table, key }) => {
      // R-6: persist-fail toasts and KEEPS the confirm modal open.
      const next = withTableRows(content, table, omitKey(content[contactTableField(table)], key));
      if (!persistContactContent(next)) {
        addToast({ message: t('contactSaveError'), type: 'error' });
        return false; // modal stays open (gold standard)
      }
      dispatch(removeContactTableRow({ table, key }));
      addToast({ message: t('contactSaved'), type: 'success' });
      return true;
    },
  });

  const {
    pending: pendingResetTable,
    cancelRef: cancelResetRef,
    request: requestResetTable,
    cancel: closeResetTable,
    confirm: handleConfirmResetTable,
  } = useConfirmAction<ContactTableRow>({
    onConfirm: (table) => {
      const next = withTableRows(content, table, createContactSeed()[contactTableField(table)]);
      if (!persistContactContent(next)) {
        addToast({ message: t('contactSaveError'), type: 'error' });
        return false; // modal stays open
      }
      dispatch(resetContactTable({ table }));
      addToast({ message: t('contactSaved'), type: 'success' });
      return true;
    },
  });

  // R-5 (contact-social-crud): the social-row modal is its own state —
  // ContactSocialForm has a different row shape than ContactRowForm.
  const [pendingSocialRow, setPendingSocialRow] = useState<{
    row?: { key: string; value: ContactSocialLink };
  } | null>(null);

  const closeRowModal = () => setPendingRow(null);
  const closeSocialRowModal = () => setPendingSocialRow(null);
  const openAddRow = (table: ContactTextTableRow) => setPendingRow({ table });
  const openEditRow = (table: ContactTextTableRow, row: TableRow) => setPendingRow({ table, row });

  const groupName = (table: ContactTableRow) =>
    table === 'texts'
      ? t('adminFieldTexts')
      : table === 'formTexts'
        ? t('adminFieldFormTexts')
        : t('adminContactSocials');

  const tableRows = (table: ContactTextTableRow): TableRow[] =>
    Object.entries(content[table]).map(([key, value]) => ({ key, value }));

  const socialRows = Object.entries(content.socialLinks).map(([key, value]) => ({ key, value }));

  const emailParsed = emailSchema.safeParse(emailDraft);
  const emailValid = emailParsed.success;
  const emailDirty = emailDraft !== content.email;

  /** D6: email-only save — merged snapshot through the full-replace action. */
  const handleSaveEmail = () => {
    if (!emailParsed.success) return; // the Input shows contactEmailInvalid
    const next: ContactContent = { ...content, email: emailParsed.data };
    if (!persistContactContent(next)) {
      addToast({ message: t('contactSaveError'), type: 'error' });
      return; // store unchanged; the draft stays for a retry
    }
    dispatch(updateContactContent(next));
    addToast({ message: t('contactSaved'), type: 'success' });
  };

  const makeColumns = (table: ContactTextTableRow) => [
    {
      key: 'field',
      header: t('adminContactTableField'),
      render: (row: TableRow) => t(row.key),
      width: '12rem',
    },
    // R-4: values are plain strings — never inputs inside rows.
    { key: 'en', header: 'EN', render: (row: TableRow) => row.value.en || '—' },
    { key: 'ru', header: 'RU', render: (row: TableRow) => row.value.ru || '—' },
    {
      key: 'actions',
      header: t('adminContactTableActions'),
      render: (row: TableRow) => (
        <div className={styles.cellActions}>
          <Tooltip content={t('adminContactEditRow')} position="top" showDelay={0}>
            <IconButton
              type="button"
              variant="outline"
              size="sm"
              icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
              ariaLabel={t('adminContactEditRow')}
              data-testid={`contact-edit-${row.key}`}
              onClick={() => openEditRow(table, { key: row.key, value: row.value })}
            />
          </Tooltip>
          <Tooltip content={t('adminContactDeleteRow')} position="top" showDelay={0}>
            <IconButton
              type="button"
              variant="danger"
              size="sm"
              icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
              ariaLabel={t('adminContactDeleteRow')}
              data-testid={`contact-delete-${row.key}`}
              onClick={() => requestDelete({ table, key: row.key })}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const renderTableGroup = (table: ContactTextTableRow) => {
    const rows = tableRows(table);
    const name = groupName(table);
    // Stable id: aria-controls resolves before AND after the unmount
    // roundtrip (Skills ARA pattern).
    const contentId = `contact-group-content-${table}`;
    const collapseLabel = t('adminContactCollapseGroup', { name });
    const expandLabel = t('adminContactExpandGroup', { name });

    return (
      <div className={styles.blockGroup} key={table}>
        {isCollapsed(table) && (
          <div className={styles.caption} data-testid={`contact-caption-${table}`}>
            {name}
          </div>
        )}
        <Card
          variant="default"
          size="default"
          hoverable={false}
          className={styles.block}
          data-testid={`contact-block-${table}`}
        >
          {isCollapsed(table) ? (
            <Tooltip content={expandLabel} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="outline"
                size="md"
                fullWidth
                className={styles.strip}
                icon={<Icon name={Plus} size={20} color="inherit" decorative />}
                ariaLabel={expandLabel}
                aria-expanded="true"
                onClick={() => expandGroup(table)}
              />
            </Tooltip>
          ) : (
            <>
              <div className={styles.blockHeader}>
                <div className={styles.headerMain}>
                  <Tooltip content={collapseLabel} position="top" showDelay={0}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={Minus} size={20} color="inherit" decorative />}
                      ariaLabel={collapseLabel}
                      aria-expanded="false"
                      aria-controls={contentId}
                      onClick={() => collapseGroup(table)}
                    />
                  </Tooltip>
                  <Heading level={3}>
                    {name}{' '}
                    <Badge variant="outline" size="sm">
                      {rows.length}
                    </Badge>
                  </Heading>
                </div>
                <div className={styles.actions} data-testid={`contact-actions-${table}`}>
                  <Tooltip content={t('adminContactAddRow')} position="top" showDelay={0}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={Plus} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminContactAddRow')}
                      data-testid={`contact-add-${table}`}
                      onClick={() => openAddRow(table)}
                    />
                  </Tooltip>
                  <Tooltip content={t('adminContactResetRows')} position="top" showDelay={0}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={RotateCcw} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminContactResetRows')}
                      data-testid={`contact-reset-${table}`}
                      onClick={() => requestResetTable(table)}
                    />
                  </Tooltip>
                </div>
              </div>
              <div className={styles.blockContent} id={contentId}>
                <Table
                  caption={name}
                  rows={rows}
                  getKey={(row) => row.key}
                  columns={makeColumns(table)}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    );
  };

  // D8: the socials Card is a read-only preview — no actions, no Add/Reset.
  const renderSocialsGroup = () => {
    const contentId = 'contact-group-content-socials';
    const name = t('adminContactSocials');
    const collapseLabel = t('adminContactCollapseGroup', { name });
    const expandLabel = t('adminContactExpandGroup', { name });

    return (
      <div className={styles.blockGroup} key="socials">
        {isCollapsed('socials') && (
          <div className={styles.caption} data-testid="contact-caption-socials">
            {name}
          </div>
        )}
        <Card
          variant="default"
          size="default"
          hoverable={false}
          className={styles.block}
          data-testid="contact-block-socials"
        >
          {isCollapsed('socials') ? (
            <Tooltip content={expandLabel} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="outline"
                size="md"
                fullWidth
                className={styles.strip}
                icon={<Icon name={Plus} size={20} color="inherit" decorative />}
                ariaLabel={expandLabel}
                aria-expanded="true"
                onClick={() => expandGroup('socials')}
              />
            </Tooltip>
          ) : (
            <>
              <div className={styles.blockHeader}>
                <div className={styles.headerMain}>
                  <Tooltip content={collapseLabel} position="top" showDelay={0}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={Minus} size={20} color="inherit" decorative />}
                      ariaLabel={collapseLabel}
                      aria-expanded="false"
                      aria-controls={contentId}
                      onClick={() => collapseGroup('socials')}
                    />
                  </Tooltip>
                  <Heading level={3}>
                    {name}{' '}
                    <Badge variant="outline" size="sm">
                      {socialRows.length}
                    </Badge>
                  </Heading>
                </div>
                {/* Req-4: Add row + Reset table (texts/formTexts parity). */}
                <div className={styles.actions} data-testid="contact-actions-socials">
                  <Tooltip content={t('adminContactAddRow')} position="top" showDelay={0}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={Plus} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminContactAddRow')}
                      data-testid="contact-add-socials"
                      onClick={() => setPendingSocialRow({})}
                    />
                  </Tooltip>
                  <Tooltip content={t('adminContactResetRows')} position="top" showDelay={0}>
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Icon name={RotateCcw} size={20} color="inherit" decorative />}
                      ariaLabel={t('adminContactResetRows')}
                      data-testid="contact-reset-socials"
                      onClick={() => requestResetTable('socials')}
                    />
                  </Tooltip>
                </div>
              </div>
              <div className={styles.blockContent} id={contentId}>
                <Table
                  caption={name}
                  rows={socialRows}
                  getKey={(row) => row.key}
                  columns={[
                    {
                      key: 'name',
                      header: t('adminContactSocialName'),
                      render: (row) => row.value.name,
                    },
                    {
                      key: 'url',
                      header: t('adminContactSocialUrl'),
                      // Req-1: the URL cell is a ghost-variant kit Link.
                      render: (row) => (
                        <Link
                          href={row.value.href}
                          variant="ghost"
                          external
                          showExternalIcon={false}
                        >
                          {row.value.href}
                        </Link>
                      ),
                    },
                    {
                      // Req-2: Pencil/Trash2 in the nowrap `.cellActions` cell.
                      key: 'actions',
                      header: t('adminContactTableActions'),
                      render: (row) => (
                        <div className={styles.cellActions}>
                          <Tooltip content={t('adminContactEditRow')} position="top" showDelay={0}>
                            <IconButton
                              type="button"
                              variant="outline"
                              size="sm"
                              icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                              ariaLabel={t('adminContactEditRow')}
                              data-testid={`contact-edit-socials-${row.key}`}
                              onClick={() =>
                                setPendingSocialRow({ row: { key: row.key, value: row.value } })
                              }
                            />
                          </Tooltip>
                          <Tooltip
                            content={t('adminContactDeleteRow')}
                            position="top"
                            showDelay={0}
                          >
                            <IconButton
                              type="button"
                              variant="danger"
                              size="sm"
                              icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                              ariaLabel={t('adminContactDeleteRow')}
                              data-testid={`contact-delete-socials-${row.key}`}
                              onClick={() => requestDelete({ table: 'socials', key: row.key })}
                            />
                          </Tooltip>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className={classNames(styles.form, className)} data-testid={testId}>
      <div className={styles.intro}>
        <Heading level={2}>{t('adminContactTitle')}</Heading>
        <Paragraph theme="muted">{t('adminContactHint')}</Paragraph>
      </div>

      {/* D6: the email is the only scalar field — inline Input + own Save. */}
      <div className={styles.emailRow}>
        <div className={styles.emailInput}>
          <Input
            label={t('adminFieldEmail')}
            value={emailDraft}
            onChange={(event) => setEmailDraft(event.target.value)}
            error={emailDraft.trim() !== '' && !emailValid ? t('contactEmailInvalid') : undefined}
            type="email"
            maxLength={120}
            autoComplete="email"
            fullWidth
          />
        </div>
        <Button
          type="button"
          variant="primary"
          disabled={!emailDirty || !emailValid}
          onClick={handleSaveEmail}
        >
          {t('contactSave')}
        </Button>
      </div>

      {renderTableGroup('texts')}
      {renderTableGroup('formTexts')}
      {renderSocialsGroup()}

      {/* R-5: row form modal — title = the operation (A12 dialog name),
          subtitle = the target table; ContactRowForm owns Save/Cancel. */}
      <Modal
        isOpen={pendingRow !== null}
        onClose={closeRowModal}
        title={t(pendingRow?.row ? 'adminContactEditRow' : 'adminContactAddRow')}
        subtitle={pendingRow ? groupName(pendingRow.table) : undefined}
        size="md"
      >
        {pendingRow ? (
          <ContactRowForm
            key={`${pendingRow.table}-${pendingRow.row?.key ?? 'new'}`}
            content={content}
            table={pendingRow.table}
            existingKeys={Object.keys(content[pendingRow.table])}
            row={pendingRow.row}
            onExitEdit={closeRowModal}
          />
        ) : null}
      </Modal>

      {/* R-5 (contact-social-crud): the social-row form modal — the same
          operation titles, the subtitle names the socials table. */}
      <Modal
        isOpen={pendingSocialRow !== null}
        onClose={closeSocialRowModal}
        title={t(pendingSocialRow?.row ? 'adminContactEditRow' : 'adminContactAddRow')}
        subtitle={t('adminContactSocials')}
        size="md"
      >
        {pendingSocialRow ? (
          <ContactSocialForm
            key={`socials-${pendingSocialRow.row?.key ?? 'new'}`}
            content={content}
            existingKeys={Object.keys(content.socialLinks)}
            row={pendingSocialRow.row}
            onExitEdit={closeSocialRowModal}
          />
        ) : null}
      </Modal>

      {/* R-6: delete-row confirm — subtitle names the key, focus starts
          on «Отмена», persist-fail keeps the modal open. */}
      <Modal
        isOpen={pendingDelete !== null}
        onClose={closeDelete}
        title={t('adminContactDeleteRow')}
        subtitle={
          pendingDelete ? t('adminContactDeleteRowName', { key: pendingDelete.key }) : undefined
        }
        size="sm"
        initialFocusRef={cancelDeleteRef}
        footer={
          <>
            <Button ref={cancelDeleteRef} type="button" variant="outline" onClick={closeDelete}>
              {t('contactCancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              data-testid="contact-delete-confirm"
              onClick={handleConfirmDelete}
            >
              {t('adminContactDeleteRow')}
            </Button>
          </>
        }
      >
        {null}
      </Modal>

      {/* R-6: per-table reset confirm — Cancel-focus, same fail-parity. */}
      <Modal
        isOpen={pendingResetTable !== null}
        onClose={closeResetTable}
        title={t('adminContactResetRows')}
        subtitle={
          pendingResetTable
            ? t('adminContactResetRowsConfirm', { table: groupName(pendingResetTable) })
            : undefined
        }
        size="sm"
        initialFocusRef={cancelResetRef}
        footer={
          <>
            <Button ref={cancelResetRef} type="button" variant="outline" onClick={closeResetTable}>
              {t('contactCancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              data-testid="contact-reset-confirm"
              onClick={handleConfirmResetTable}
            >
              {t('adminContactResetRows')}
            </Button>
          </>
        }
      >
        {null}
      </Modal>
    </div>
  );
};

ContactEditorForm.displayName = 'ContactEditorForm';
