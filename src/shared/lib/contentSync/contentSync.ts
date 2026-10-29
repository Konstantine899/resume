// Cross-tab state synchronization for backend-backed admin content.
// BroadcastChannel is optional (see storage fallback below); treat absent
// support or message parsing as "no event" rather than a hard failure.
export const CONTENT_SYNC_CHANNEL = 'resume-content';

export interface ContentSyncMessage {
  readonly entity: 'about';
  readonly updatedAt: string;
  readonly sourceTabId: string;
}

function hasBroadcastChannel(): boolean {
  return typeof globalThis.BroadcastChannel !== 'undefined';
}

export function publishAboutUpdate(updatedAt: string): void {
  if (!hasBroadcastChannel()) return;

  try {
    const channel = new BroadcastChannel(CONTENT_SYNC_CHANNEL);
    const message: ContentSyncMessage = {
      entity: 'about',
      updatedAt,
      sourceTabId: crypto.randomUUID(),
    };
    channel.postMessage(message);
    channel.close();
  } catch {
    // Sync is best-effort; About mutation callers remain the failure reporter.
  }
}

export function isContentSyncMessage(value: unknown): value is ContentSyncMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<ContentSyncMessage>).entity === 'about' &&
    typeof (value as Partial<ContentSyncMessage>).updatedAt === 'string' &&
    typeof (value as Partial<ContentSyncMessage>).sourceTabId === 'string'
  );
}
