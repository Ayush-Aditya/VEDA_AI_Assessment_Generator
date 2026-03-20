import { createClient, RedisClientType } from 'redis';

const JOB_STATE_TTL_SECONDS = 60 * 60 * 24;

let redisClient: RedisClientType | null = null;
let redisReady = false;

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  return url ? url : null;
}

export async function initializeRedis(): Promise<boolean> {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    console.warn('Redis disabled: REDIS_URL not set');
    return false;
  }

  if (redisClient && redisReady) {
    return true;
  }

  try {
    redisClient = createClient({ url: redisUrl });

    redisClient.on('error', (error) => {
      console.error('Redis client error:', error.message);
    });

    await redisClient.connect();
    redisReady = true;
    console.log('✅ Redis connected');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    redisClient = null;
    redisReady = false;
    return false;
  }
}

export function isRedisAvailable(): boolean {
  return redisReady && redisClient !== null;
}

export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

export async function saveJobState(jobId: string, payload: Record<string, unknown>): Promise<void> {
  if (!isRedisAvailable() || !redisClient) {
    return;
  }

  const key = `question-job:${jobId}`;
  await redisClient.set(key, JSON.stringify(payload), { EX: JOB_STATE_TTL_SECONDS });
}

export async function getJobState(jobId: string): Promise<Record<string, unknown> | null> {
  if (!isRedisAvailable() || !redisClient) {
    return null;
  }

  const key = `question-job:${jobId}`;
  const raw = await redisClient.get(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.quit();
  } catch {
    // Ignore close errors during shutdown.
  } finally {
    redisClient = null;
    redisReady = false;
  }
}
