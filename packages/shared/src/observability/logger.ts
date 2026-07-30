export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  correlationId?: string;
  traceId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}

class ObservabilityLogger {
  private formatLog(level: LogEntry['level'], message: string, meta?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: meta?.correlationId || `corr_${Math.random().toString(36).substr(2, 9)}`,
      traceId: meta?.traceId || `trace_${Date.now()}`,
      durationMs: meta?.durationMs,
      metadata: meta,
    };
  }

  public info(message: string, meta?: Record<string, any>) {
    console.log(JSON.stringify(this.formatLog('info', message, meta)));
  }

  public warn(message: string, meta?: Record<string, any>) {
    console.warn(JSON.stringify(this.formatLog('warn', message, meta)));
  }

  public error(message: string, error?: any, meta?: Record<string, any>) {
    console.error(
      JSON.stringify(
        this.formatLog('error', message, {
          ...meta,
          error: error?.message || error,
          stack: error?.stack,
        })
      )
    );
  }

  public startTimer(label: string) {
    const start = Date.now();
    return () => {
      const durationMs = Date.now() - start;
      this.info(`[Timer] ${label} completed in ${durationMs}ms`, { durationMs });
      return durationMs;
    };
  }
}

export const logger = new ObservabilityLogger();
