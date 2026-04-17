import { randomBytes } from 'crypto';
import type { Credentials } from 'google-auth-library';

export interface Share {
  sheetId: string;
  gid?: string;
  tokens: Credentials;
  createdByName: string;
  createdByEmail: string;
  createdAt: number;
  label?: string;
}

interface Store {
  set(id: string, share: Share): Promise<void>;
  get(id: string): Promise<Share | null>;
  delete(id: string): Promise<void>;
  list(email: string): Promise<Array<{ id: string; share: Share }>>;
}

class MemoryStore implements Store {
  private store = new Map<string, Share>();

  async set(id: string, share: Share) {
    this.store.set(id, share);
  }

  async get(id: string) {
    return this.store.get(id) || null;
  }

  async delete(id: string) {
    this.store.delete(id);
  }

  async list(email: string) {
    return Array.from(this.store.entries())
      .filter(([, s]) => s.createdByEmail === email)
      .map(([id, share]) => ({ id, share }));
  }
}

class KVStore implements Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private kv: any;

  constructor() {
    // Lazy require so the package isn't loaded if KV isn't configured
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { kv } = require('@vercel/kv');
    this.kv = kv;
  }

  async set(id: string, share: Share) {
    await this.kv.set(`share:${id}`, share);
    await this.kv.sadd(`shares:by:${share.createdByEmail}`, id);
  }

  async get(id: string) {
    return (await this.kv.get(`share:${id}`)) as Share | null;
  }

  async delete(id: string) {
    const share = await this.get(id);
    if (share) {
      await this.kv.srem(`shares:by:${share.createdByEmail}`, id);
    }
    await this.kv.del(`share:${id}`);
  }

  async list(email: string) {
    const ids: string[] = await this.kv.smembers(`shares:by:${email}`);
    const shares = await Promise.all(
      ids.map(async (id) => ({ id, share: await this.get(id) }))
    );
    return shares.filter((s): s is { id: string; share: Share } => s.share !== null);
  }
}

let storeInstance: Store | null = null;

export function getShareStore(): Store {
  if (storeInstance) return storeInstance;

  if (process.env.KV_REST_API_URL || process.env.KV_URL) {
    try {
      storeInstance = new KVStore();
      console.log('[share-store] Using Vercel KV');
    } catch (err) {
      console.warn('[share-store] KV configured but not available, falling back to memory:', err);
      storeInstance = new MemoryStore();
    }
  } else {
    storeInstance = new MemoryStore();
    console.log('[share-store] Using in-memory store (configure KV for persistence)');
  }

  return storeInstance;
}

export function generateShareId(): string {
  return randomBytes(16).toString('hex');
}
