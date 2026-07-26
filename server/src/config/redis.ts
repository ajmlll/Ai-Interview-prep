import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

class MemoryStorageFallback {
  private map = new Map<string, string>();
  
  async get(key: string): Promise<string | null> {
    return this.map.get(key) || null;
  }
  
  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.map.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => {
        this.map.delete(key);
      }, duration * 1000);
    }
    return 'OK';
  }
  
  async del(key: string): Promise<number> {
    const deleted = this.map.delete(key);
    return deleted ? 1 : 0;
  }
}

let useFallback = false;
const fallbackStore = new MemoryStorageFallback();

const client = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) {
      console.warn('Redis connection failed permanently. Falling back to memory storage...');
      useFallback = true;
      return null; // stop retrying
    }
    return Math.min(times * 100, 1000);
  }
});

client.on('error', (err) => {
  console.warn('Redis connection error:', err.message);
  useFallback = true;
});

client.connect()
  .then(() => {
    console.log('Connected to Redis successfully.');
  })
  .catch((err) => {
    console.warn('Could not establish initial connection with Redis. Using memory fallback.', err.message);
    useFallback = true;
  });

const redisClient = {
  get: async (key: string): Promise<string | null> => {
    if (useFallback) return fallbackStore.get(key);
    try {
      return await client.get(key);
    } catch {
      useFallback = true;
      return fallbackStore.get(key);
    }
  },
  set: async (key: string, value: string, mode?: 'EX', duration?: number): Promise<string> => {
    if (useFallback) return fallbackStore.set(key, value, mode, duration);
    try {
      if (mode === 'EX' && duration) {
        return await client.set(key, value, 'EX', duration);
      }
      return await client.set(key, value);
    } catch {
      useFallback = true;
      return fallbackStore.set(key, value, mode, duration);
    }
  },
  del: async (key: string): Promise<number> => {
    if (useFallback) return fallbackStore.del(key);
    try {
      return await client.del(key);
    } catch {
      useFallback = true;
      return fallbackStore.del(key);
    }
  }
};

export default redisClient;
