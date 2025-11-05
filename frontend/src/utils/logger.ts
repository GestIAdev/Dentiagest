/**
 * 🚀 DENTIAGEST CYBERPUNK LOGGING SYSTEM
 * Sistema de logging profesional para debugging y monitoreo
 * @author PunkClaude Cyberanarchist & RaulVisionario UX Emperor
 * @version 1.0.0
 * @date September 17, 2025
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  error?: Error;
  stack?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  includeStackTrace: boolean;
  colorize: boolean;
}

export class CyberpunkLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private static instance: CyberpunkLogger;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableStorage: true,
      maxStoredLogs: 500, // 🔥 AGGRESSIVE LIMIT: Reduced from 1000 to prevent memory leaks
      enableRemoteLogging: false,
      includeStackTrace: true,
      colorize: true,
      ...config
    };

    // Recuperar logs del localStorage si está habilitado
    if (this.config.enableStorage) {
      this.loadStoredLogs();
    }
  }

  public static getInstance(config?: Partial<LoggerConfig>): CyberpunkLogger {
    if (!CyberpunkLogger.instance) {
      CyberpunkLogger.instance = new CyberpunkLogger(config);
    }
    return CyberpunkLogger.instance;
  }

  private getLogLevelColor(level: LogLevel): string {
    if (!this.config.colorize) return '';

    switch (level) {
      case LogLevel.DEBUG: return '\x1b[36m'; // Cyan
      case LogLevel.INFO: return '\x1b[32m';  // Green
      case LogLevel.WARN: return '\x1b[33m';  // Yellow
      case LogLevel.ERROR: return '\x1b[31m'; // Red
      case LogLevel.CRITICAL: return '\x1b[35m'; // Magenta
      default: return '\x1b[37m'; // White
    }
  }

  private getLogLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.CRITICAL: return 'CRITICAL';
      default: return 'UNKNOWN';
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const color = this.getLogLevelColor(entry.level);
    const reset = this.config.colorize ? '\x1b[0m' : '';
    const timestamp = entry.timestamp.toISOString();
    const level = this.getLogLevelName(entry.level);
    const module = entry.module.padEnd(20);
    const message = entry.message;

    let formatted = `${color}[${timestamp}] ${level} ${module} | ${message}${reset}`;

    if (entry.data) {
      formatted += `\n${color}Data: ${JSON.stringify(entry.data, null, 2)}${reset}`;
    }

    if (entry.error && this.config.includeStackTrace) {
      formatted += `\n${color}Error: ${entry.error.message}${reset}`;
      if (entry.error.stack) {
        formatted += `\n${color}Stack: ${entry.error.stack}${reset}`;
      }
    }

    return formatted;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    module: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      module,
      message,
      data,
      error,
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };

    if (error && this.config.includeStackTrace) {
      entry.stack = error.stack;
    }

    return entry;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('dentiagest_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Date.now().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('dentiagest_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string {
    // En un sistema real, esto vendría del contexto de autenticación
    return localStorage.getItem('dentiagest_user_id') || 'anonymous';
  }

  private storeLog(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    this.logs.push(entry);

    // Mantener solo los logs más recientes
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs = this.logs.slice(-this.config.maxStoredLogs);
    }

    // Guardar en localStorage
    try {
      localStorage.setItem('dentiagest_logs', JSON.stringify(this.logs));
    } catch (error) {
      // Use the logger itself to record storage failures
      try {
        this.warn('Logger', 'Failed to store logs in localStorage', { error });
      } catch (_) {
        // Swallow to avoid recursive failures
      }
    }
  }

  private loadStoredLogs(): void {
    try {
      const stored = localStorage.getItem('dentiagest_logs');
      if (stored) {
        const parsedLogs = JSON.parse(stored);
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      try {
        this.warn('Logger', 'Failed to load stored logs', { error });
      } catch (_) {
        // swallow
      }
    }
  }

  private async sendRemoteLog(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      try {
        this.warn('Logger', 'Failed to send remote log', { error });
      } catch (_) {
        // swallow
      }
    }
  }

  public log(
    level: LogLevel,
    module: string,
    message: string,
    data?: any,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, module, message, data, error);

    // Console logging
    if (this.config.enableConsole) {
      const formatted = this.formatLogEntry(entry);
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          // Error logged through structured logging system
          break;
      }
    }

    // Store log
    this.storeLog(entry);

    // Send remote log
    this.sendRemoteLog(entry);
  }

  public debug(module: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  public info(module: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, module, message, data);
  }

  public warn(module: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, module, message, data);
  }

  public error(module: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, module, message, data, error);
  }

  public critical(module: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.CRITICAL, module, message, data, error);
  }

  public getLogs(level?: LogLevel, module?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }

    return filteredLogs;
  }

  public clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('dentiagest_logs');
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byModule: Record<string, number>;
    oldest: Date | null;
    newest: Date | null;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byModule: {} as Record<string, number>,
      oldest: this.logs.length > 0 ? this.logs[0].timestamp : null,
      newest: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null
    };

    this.logs.forEach(log => {
      const levelName = this.getLogLevelName(log.level);
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
    });

    return stats;
  }

  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const logger = CyberpunkLogger.getInstance();

// Export convenience functions
export const createModuleLogger = (moduleName: string) => ({
  debug: (message: string, data?: any) => logger.debug(moduleName, message, data),
  info: (message: string, data?: any) => logger.info(moduleName, message, data),
  warn: (message: string, data?: any) => logger.warn(moduleName, message, data),
  error: (message: string, error?: Error, data?: any) => logger.error(moduleName, message, error, data),
  critical: (message: string, error?: Error, data?: any) => logger.critical(moduleName, message, error, data)
});

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  public static startTimer(label: string): void {
    // ⚡ MEMORY LEAK PREVENTION: Limit timers to 100 max
    if (this.timers.size >= 100) {
      const oldestKey = Array.from(this.timers.keys())[0];
      this.timers.delete(oldestKey);
    }
    
    this.timers.set(label, performance.now());
    logger.debug('PerformanceMonitor', `Started timer: ${label}`);
  }

  public static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn('PerformanceMonitor', `Timer not found: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    logger.info('PerformanceMonitor', `Timer ended: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
      label
    });

    return duration;
  }

  public static measureFunction<T>(
    label: string,
    fn: () => T
  ): T {
    this.startTimer(label);
    try {
      const result = fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  public static async measureAsyncFunction<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
}

export default logger;
