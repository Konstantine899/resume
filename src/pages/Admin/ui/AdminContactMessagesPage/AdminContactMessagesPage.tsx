import React, { useEffect, useState } from 'react';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { apiSlice } from '@/shared/api/apiSlice';
import type { ContactMessageAdminDto, ContactMessageAdminStatus } from '@/shared/api/types';
import { Heading } from '@/shared/ui/Heading';
import { Button } from '@/shared/ui/Button';
import { Paragraph } from '@/shared/ui/Paragraph';

type Filter = 'ALL' | ContactMessageAdminStatus;

export const AdminContactMessagesPage: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();
  const [rows, setRows] = useState<ContactMessageAdminDto[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        const result = await dispatch(
          apiSlice.endpoints.getContactMessages.initiate({
            status: filter,
            take: 50,
          })
        ).unwrap();
        if (!cancelled) setRows(result);
      } catch {
        if (!cancelled) setError('Failed to load contact messages');
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, filter]);

  const patchStatus = async (row: ContactMessageAdminDto, status: ContactMessageAdminStatus) => {
    try {
      setBusyId(row.id);
      setError(null);
      const updated = await dispatch(
        apiSlice.endpoints.updateContactMessageStatus.initiate({ id: row.id, status })
      ).unwrap();
      setRows((prev) => prev.map((item) => (item.id === row.id ? updated : item)));
    } catch {
      setError('Failed to update message status');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div data-testid="admin-contact-messages">
      <Heading level={1}>Contact messages</Heading>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['ALL', 'NEW', 'READ', 'REPLIED'] as Filter[]).map((value) => (
          <Button
            key={value}
            variant={filter === value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(value)}
            data-testid={`filter-${value.toLowerCase()}`}
          >
            {value}
          </Button>
        ))}
      </div>
      {error ? <Paragraph theme="error">{error}</Paragraph> : null}
      {rows.length === 0 ? (
        <Paragraph>No contact messages.</Paragraph>
      ) : (
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.createdAt).toLocaleString()}</td>
                <td>{row.email}</td>
                <td>{row.subject ?? '—'}</td>
                <td>{row.body}</td>
                <td>{row.status}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void patchStatus(row, 'READ')}
                    disabled={row.status === 'READ' || busyId === row.id}
                  >
                    Mark read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void patchStatus(row, 'REPLIED')}
                    disabled={row.status === 'REPLIED' || busyId === row.id}
                  >
                    Mark replied
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

AdminContactMessagesPage.displayName = 'AdminContactMessagesPage';
