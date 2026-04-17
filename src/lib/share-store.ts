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

class RedisStore implements Store {
  private redis: import('@upstash/redis').Redis;

  constructor() {
    const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis');
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }

  async set(id: string, share: Share) {
    await this.redis.set(`share:${id}`, JSON.stringify(share));
    await this.redis.sadd(`shares:by:${share.createdByEmail}`, id);
  }

  async get(id: string) {
    const data = await this.redis.get<string>(`share:${id}`);
    if (!data) return null;
    return (typeof data === 'string' ? JSON.parse(data) : data) as Share;
  }

  async delete(id: string) {
    const share = await this.get(id);
    if (share) {
      await this.redis.srem(`shares:by:${share.createdByEmail}`, id);
    }
    await this.redis.del(`share:${id}`);
  }

  async list(email: string) {
    const ids = await this.redis.smembers(`shares:by:${email}`);
    const shares = await Promise.all(
      ids.map(async (id) => ({ id, share: await this.get(id) }))
    );
    return shares.filter((s): s is { id: string; share: Share } => s.share !== null);
  }
}

let storeInstance: Store | null = null;

export function getShareStore(): Store {
  if (storeInstance) return storeInstance;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      storeInstance = new RedisStore();
    } catch (err) {
      console.warn('[share-store] Redis not available, falling back to memory:', err);
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
