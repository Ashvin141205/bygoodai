/**
 * Production-ready Server & Client Logging Strategy
 * Ensures credentials, tokens, and PII are sanitized before output
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  userId?: string;
  toolId?: string;
  durationMs?: number;
  [key: string]: any;
}

class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : true;
  }

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization', 'bearer', 'cookie'];
    const clean: Record<string, any> = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        clean[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        clean[key] = this.sanitize(value);
      } else {
        clean[key] = value;
      }
    }
    return clean;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const tag = context?.module ? `[${context.module}]` : '[ByGoodAI]';
    return `${timestamp} [${level.toUpperCase()}] ${tag} ${message}`;
  }

  public debug(message: string, context?: LogContext) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context), this.sanitize(context || {}));
    }
  }

  public info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context), this.sanitize(context || {}));
  }

  public warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context), this.sanitize(context || {}));
  }

  public error(message: string, error?: any, context?: LogContext) {
    const errorDetails = error instanceof Error
      ? { message: error.message, name: error.name, stack: this.isDev ? error.stack : undefined }
      : error;

    console.error(
      this.formatMessage('error', message, context),
      this.sanitize({ ...context, error: errorDetails })
    );
  }
}

export const logger = new Logger();
