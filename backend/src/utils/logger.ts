/**
 * Logger utility using Winston
 */

import winston from 'winston';
import { config } from '../config/config';

const { combine, timestamp, errors, json, simple, colorize, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  let metaStr = '';
  if (Object.keys(meta).length > 0) {
    metaStr = ` ${JSON.stringify(meta)}`;
  }
  return `${timestamp} [${level}]: ${message}${metaStr}`;
});

// Create logger instance
export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: { service: 'lexiloop-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: config.nodeEnv === 'production' 
        ? combine(json())
        : combine(colorize(), devFormat)
    }),
    
    // File transport for errors (in production)
    ...(config.nodeEnv === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: combine(json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ] : [])
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console({
      format: combine(colorize(), simple())
    }),
    ...(config.nodeEnv === 'production' ? [
      new winston.transports.File({
        filename: 'logs/exceptions.log',
        format: combine(json())
      })
    ] : [])
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.Console({
      format: combine(colorize(), simple())
    }),
    ...(config.nodeEnv === 'production' ? [
      new winston.transports.File({
        filename: 'logs/rejections.log',
        format: combine(json())
      })
    ] : [])
  ]
});

// Create specialized loggers for different contexts
export const authLogger = logger.child({ context: 'auth' });
export const dbLogger = logger.child({ context: 'database' });
export const aiLogger = logger.child({ context: 'ai-service' });
export const testLogger = logger.child({ context: 'testing' });

export default logger;