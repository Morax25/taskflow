import { env } from './config/env.js';
import type { Server } from 'node:http';
import app from './app.js';
import prisma, { connectDatabase } from './config/prisma.js';
import redisConnection from './config/redis.js';
import { logger } from './config/logger.js'

let server: Server;

async function start(): Promise<void> {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    logger.info(`server running on port : ${env.PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.fatal(`Port ${env.PORT} is already in use`);
    } else {
      logger.fatal({ err }, 'Server failed to start');
    }
    process.exit(1);
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.fatal('Forced shutdown after timeout — some connections did not close cleanly');
    process.exit(1);
  }, 10_000);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info('HTTP server closed');
    }

    await prisma.$disconnect();
    logger.info('Database disconnected');

    await redisConnection.quit();
    logger.info('Redis disconnected');

    clearTimeout(forceExit);
    process.exit(0);
  } catch (err) {
    logger.fatal({ err }, 'Error during shutdown');
    clearTimeout(forceExit);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();