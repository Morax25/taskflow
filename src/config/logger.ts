import { mkdirSync } from 'node:fs';
import path from 'node:path';
import pino from 'pino';
import { env } from './env.js';

const IS_PRODUCTION = env.NODE_ENV === 'production';
const IS_TEST = env.NODE_ENV === 'test';

const LOG_DIR = path.resolve(process.cwd(), 'logs');

if (!IS_TEST) {
  mkdirSync(LOG_DIR, { recursive: true });
}

const baseLoggerOptions: pino.LoggerOptions = {
  level: IS_TEST ? 'silent' : IS_PRODUCTION ? 'info' : 'debug',
  redact: {
    paths: [
      'password',
      'passwordHash',
      '*.password',
      '*.passwordHash',
      'accessToken',
      'refreshToken',
      '*.accessToken',
      '*.refreshToken',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  base: {
    env: env.NODE_ENV,
  },

  timestamp: pino.stdTimeFunctions.isoTime,
};

export const logger = IS_TEST
  ? pino(baseLoggerOptions)
  : pino({
      ...baseLoggerOptions,

      transport: {
        targets: [
          ...(!IS_PRODUCTION
            ? [
                {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                  },
                  level: 'debug',
                },
              ]
            : [
                {
                  target: 'pino/file',
                  options: {
                    destination: 1,
                  },
                  level: 'info',
                },
              ]),

          {
            target: 'pino/file',
            options: {
              destination: path.join(LOG_DIR, 'app.log'),
              mkdir: true,
            },
            level: IS_PRODUCTION ? 'info' : 'debug',
          },

          {
            target: 'pino/file',
            options: {
              destination: path.join(LOG_DIR, 'error.log'),
              mkdir: true,
            },
            level: 'error',
          },
        ],
      },
    });

export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}

export type Logger = typeof logger;