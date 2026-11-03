// ============================================
// contentSync — cross-tab invalidation publisher
// ============================================
//
// Best-effort contract: absent BroadcastChannel support, a throwing
// constructor or a throwing postMessage all resolve to "no event"; the
// About mutation caller stays the single failure reporter.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONTENT_SYNC_CHANNEL, isContentSyncMessage, publishAboutUpdate } from './contentSync';

class FakeChannel {
  static instances: FakeChannel[] = [];

  readonly name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(name: string) {
    this.name = name;
    FakeChannel.instances.push(this);
  }

  static reset(): void {
    FakeChannel.instances = [];
  }
}

describe('contentSync', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    FakeChannel.reset();
  });

  it('publishes an about update on the shared channel and closes it', () => {
    vi.stubGlobal('BroadcastChannel', FakeChannel);

    publishAboutUpdate('2026-10-28T10:00:00.000Z');

    expect(FakeChannel.instances).toHaveLength(1);
    const channel = FakeChannel.instances[0] as FakeChannel;
    expect(channel.name).toBe(CONTENT_SYNC_CHANNEL);
    expect(channel.postMessage).toHaveBeenCalledWith({
      entity: 'about',
      updatedAt: '2026-10-28T10:00:00.000Z',
      sourceTabId: expect.any(String),
    });
    const message = channel.postMessage.mock.calls[0]?.[0] as { sourceTabId: string };
    expect(message.sourceTabId.length).toBeGreaterThan(0);
    expect(channel.close).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when BroadcastChannel is unavailable', () => {
    vi.stubGlobal('BroadcastChannel', undefined);

    expect(() => publishAboutUpdate('2026-10-28T10:00:00.000Z')).not.toThrow();
    expect(FakeChannel.instances).toHaveLength(0);
  });

  it('swallows a throwing channel constructor', () => {
    const ThrowingChannel = class {
      constructor() {
        throw new Error('blocked');
      }
    };
    vi.stubGlobal('BroadcastChannel', ThrowingChannel);

    expect(() => publishAboutUpdate('2026-10-28T10:00:00.000Z')).not.toThrow();
  });

  it('swallows a throwing postMessage', () => {
    const ThrowingPost = class {
      postMessage(): void {
        throw new Error('channel closed');
      }

      close(): void {
        // never reached
      }
    };
    vi.stubGlobal('BroadcastChannel', ThrowingPost);

    expect(() => publishAboutUpdate('2026-10-28T10:00:00.000Z')).not.toThrow();
  });

  describe('isContentSyncMessage', () => {
    const valid = {
      entity: 'about',
      updatedAt: '2026-10-28T10:00:00.000Z',
      sourceTabId: 'tab-1',
    };

    it('accepts a well-formed message', () => {
      expect(isContentSyncMessage(valid)).toBe(true);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['a string', 'about'],
      ['an array', [valid]],
      ['a wrong entity', { ...valid, entity: 'contact' }],
      ['a non-string updatedAt', { ...valid, updatedAt: 7 }],
      ['a missing updatedAt', { entity: 'about', sourceTabId: 'tab-1' }],
      ['a non-string sourceTabId', { ...valid, sourceTabId: 1 }],
      ['a missing sourceTabId', { entity: 'about', updatedAt: 'now' }],
    ])('rejects %s', (_label, value) => {
      expect(isContentSyncMessage(value)).toBe(false);
    });
  });
});
