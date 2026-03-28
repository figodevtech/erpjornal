import pino from 'pino';

/**
 * Logger estruturado (Pino) para observabilidade avançada.
 * Configurado para saída JSON (Log Drain compatível) e pino-pretty em desenvolvimento.
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
    },
  } : undefined,
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },
});

export default logger;
