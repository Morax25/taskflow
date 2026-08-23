import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';
import { logger } from './logger.js';

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();

    logger.info('Database connected successfully');
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      'Database connection failed',
    );

    process.exit(1);
  }
}

export default prisma