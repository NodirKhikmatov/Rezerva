type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogPayload = {
  level: LogLevel;
  message: string;
  context?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
};

function writeLog(payload: LogPayload): void {
  const line = JSON.stringify(payload);

  if (payload.level === 'error') {
    console.error(line);
    return;
  }

  if (payload.level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

export class AppLogger {
  constructor(private readonly context?: string) {}

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    this.log('debug', message, meta);
  }

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    writeLog({
      level,
      message,
      context: this.context,
      meta,
      timestamp: new Date().toISOString(),
    });
  }
}

export const appLogger = new AppLogger('rezerva-api');
