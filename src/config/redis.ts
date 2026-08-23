import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('reconnecting', (delay: number) => {
  logger.warn(
    { delay },
    'Redis reconnecting',
  );
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('error', (err: Error) => {
  logger.error(
    { err },
    'Redis connection error',
  );
});

redis.on('end', () => {
  logger.error('Redis connection ended');
});

export async function connectRedis(): Promise<void> {
  if (redis.status === 'ready') {
    return;
  }

  try {
    await redis.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.fatal(
      { err: error },
      'Redis initial connection failed',
    );

    throw error;
  }
}

export default redis;