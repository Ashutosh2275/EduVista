import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import env from '../config/env';

// ────────────────────────────────────────────────────────────
// Custom Log Format
// ────────────────────────────────────────────────────────────

const { combine, timestamp, errors, json, printf, colorize, align } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  align(),
  printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
    const rid = requestId ? ` [${requestId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const errorStack = stack ? `\n${stack}` : '';
    return `${timestamp} [${level}]${rid}: ${message}${metaStr}${errorStack}`;
  })
);

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ────────────────────────────────────────────────────────────
// Transports
// ────────────────────────────────────────────────────────────

const transports: winston.transport[] = [
  // Console (always on)
  new winston.transports.Console({
    format: consoleFormat,
    silent: env.NODE_ENV === 'test',
  }),
];

// File transports (production + development)
if (env.NODE_ENV !== 'test') {
  const logDir = path.resolve(process.cwd(), env.LOG_DIR);

  // Combined log (all levels)
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    })
  );

  // Error-only log
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: fileFormat,
    })
  );
}

// ────────────────────────────────────────────────────────────
// Logger Instance
// ────────────────────────────────────────────────────────────

const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'debug',
  defaultMeta: { service: 'eduvista-backend' },
  transports,
  // Don't crash on unhandled exceptions in test mode
  exitOnError: env.NODE_ENV !== 'test',
});

export default logger;
