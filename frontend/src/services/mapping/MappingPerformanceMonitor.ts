/**
 * 💀 CENTRAL MAPPING SERVICE - PERFORMANCE MONITOR
 * OPERACIÓN UNIFORM - Real-time performance tracking
 * 
 * @author PunkClaude & The Anarchist  
 * @date 17 Agosto 2025
 * @mission Monitor all mapping operations like a hawk
 */

import {
  PerformanceMetrics,
  CacheStatistics,
  MappingOperation,
  PerformanceThreshold,
  AlertLevel
} from './MappingTypes';

/**
 * 🚀 PERFORMANCE MONITORING SYSTEM
 */
export class MappingPerformanceMonitor {
  
  // ============================================================================
  // SINGLETON INSTANCE
  // ============================================================================
  
  private static instance: MappingPerformanceMonitor;
  
  public static getInstance(): MappingPerformanceMonitor {
    if (!MappingPerformanceMonitor.instance) {
      MappingPerformanceMonitor.instance = new MappingPerformanceMonitor();
    }
    return MappingPerformanceMonitor.instance;
  }

  // ============================================================================
  // INTERNAL STATE
  // ============================================================================

  private metrics: PerformanceMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    totalMappings: 0,
    averageExecutionTime: 0,
    maxExecutionTime: 0,
    minExecutionTime: Infinity,
    lastOperationTime: 0,
    operationsPerSecond: 0,
    memoryUsage: 0,
    startTime: Date.now(),
    cacheHitRate: 0,
    errorRate: 0,
    lastResetTime: Date.now()
  };

  private cacheStats: CacheStatistics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalSize: 0,
    maxSize: 1000, // Max 1000 cached items
    evictions: 0,
    lastEvictionTime: 0
  };

  private recentOperations: MappingOperation[] = [];
  private executionTimes: number[] = [];
  private readonly MAX_RECENT_OPERATIONS = 100;
  private readonly MAX_EXECUTION_TIMES = 1000;

  // Performance thresholds
  private readonly thresholds: PerformanceThreshold = {
    maxExecutionTime: 100, // ms
    minCacheHitRate: 0.7,  // 70%
    maxErrorRate: 0.05,    // 5%
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minOperationsPerSecond: 10
  };

  private alertCallbacks: Array<(level: AlertLevel, message: string, metrics: PerformanceMetrics) => void> = [];

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  private constructor() {
    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  // ============================================================================
  // OPERATION TRACKING
  // ============================================================================

  /**
   * 🎯 Start tracking an operation
   */
  public startOperation(operationType: string, inputType: string): string {
    const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const operation: MappingOperation = {
      id: operationId,
      type: operationType,
      inputType,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      success: false,
      cacheHit: false,
      memoryBefore: this.getCurrentMemoryUsage(),
      memoryAfter: 0
    };

    this.recentOperations.unshift(operation);
    if (this.recentOperations.length > this.MAX_RECENT_OPERATIONS) {
      this.recentOperations.pop();
    }

    return operationId;
  }

  /**
   * ⚡ Complete tracking an operation
   */
  public endOperation(
    operationId: string, 
    success: boolean, 
    cacheHit: boolean = false,
    errorMessage?: string
  ): void {
    const operation = this.recentOperations.find(op => op.id === operationId);
    if (!operation) {
      console.warn(`Operation ${operationId} not found for completion tracking`);
      return;
    }

    // Complete the operation
    operation.endTime = performance.now();
    operation.duration = operation.endTime - operation.startTime;
    operation.success = success;
    operation.cacheHit = cacheHit;
    operation.memoryAfter = this.getCurrentMemoryUsage();
    operation.errorMessage = errorMessage;

    // Update metrics
    this.updateMetrics(operation);

    // Check thresholds
    this.checkPerformanceThresholds(operation);
  }

  // ============================================================================
  // METRICS UPDATE
  // ============================================================================

  /**
   * 💀 Update performance metrics
   */
  private updateMetrics(operation: MappingOperation): void {
    this.metrics.totalOperations++;
    
    if (operation.success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }

    // Execution time tracking
    this.executionTimes.unshift(operation.duration);
    if (this.executionTimes.length > this.MAX_EXECUTION_TIMES) {
      this.executionTimes.pop();
    }

    this.metrics.lastOperationTime = operation.duration;
    this.metrics.maxExecutionTime = Math.max(this.metrics.maxExecutionTime, operation.duration);
    this.metrics.minExecutionTime = Math.min(this.metrics.minExecutionTime, operation.duration);
    
    // Calculate average execution time
    this.metrics.averageExecutionTime = this.executionTimes.reduce((sum, time) => sum + time, 0) / this.executionTimes.length;

    // Calculate operations per second
    const timeElapsed = (Date.now() - this.metrics.startTime) / 1000;
    this.metrics.operationsPerSecond = this.metrics.totalOperations / timeElapsed;

    // Update memory usage
    this.metrics.memoryUsage = operation.memoryAfter;

    // Update cache statistics if it was a cache operation
    if (operation.cacheHit) {
      this.cacheStats.hits++;
    } else {
      this.cacheStats.misses++;
    }
    
    this.cacheStats.hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);
  }

  // ============================================================================
  // CACHE MONITORING
  // ============================================================================

  /**
   * 🎸 Update cache statistics
   */
  public updateCacheStats(operation: 'hit' | 'miss' | 'eviction', size?: number): void {
    switch (operation) {
      case 'hit':
        this.cacheStats.hits++;
        break;
      case 'miss':
        this.cacheStats.misses++;
        break;
      case 'eviction':
        this.cacheStats.evictions++;
        this.cacheStats.lastEvictionTime = Date.now();
        break;
    }

    if (size !== undefined) {
      this.cacheStats.totalSize = size;
    }

    // Recalculate hit rate
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    this.cacheStats.hitRate = totalRequests > 0 ? this.cacheStats.hits / totalRequests : 0;
  }

  // ============================================================================
  // THRESHOLD MONITORING
  // ============================================================================

  /**
   * ⚡ Check if operation exceeds performance thresholds
   */
  private checkPerformanceThresholds(operation: MappingOperation): void {
    // Execution time threshold
    if (operation.duration > this.thresholds.maxExecutionTime) {
      this.triggerAlert(
        'warning',
        `Operation ${operation.type} took ${operation.duration.toFixed(2)}ms (threshold: ${this.thresholds.maxExecutionTime}ms)`,
        this.metrics
      );
    }

    // Error rate threshold
    const errorRate = this.metrics.failedOperations / this.metrics.totalOperations;
    if (errorRate > this.thresholds.maxErrorRate) {
      this.triggerAlert(
        'error',
        `Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold ${this.thresholds.maxErrorRate * 100}%`,
        this.metrics
      );
    }

    // Cache hit rate threshold
    if (this.cacheStats.hitRate < this.thresholds.minCacheHitRate && (this.cacheStats.hits + this.cacheStats.misses) > 10) {
      this.triggerAlert(
        'warning',
        `Cache hit rate ${(this.cacheStats.hitRate * 100).toFixed(1)}% below threshold ${this.thresholds.minCacheHitRate * 100}%`,
        this.metrics
      );
    }

    // Memory usage threshold
    if (operation.memoryAfter > this.thresholds.maxMemoryUsage) {
      this.triggerAlert(
        'error',
        `Memory usage ${Math.round(operation.memoryAfter / (1024 * 1024))}MB exceeds threshold ${Math.round(this.thresholds.maxMemoryUsage / (1024 * 1024))}MB`,
        this.metrics
      );
    }
  }

  // ============================================================================
  // ALERT SYSTEM
  // ============================================================================

  /**
   * 💀 Trigger performance alert
   */
  private triggerAlert(level: AlertLevel, message: string, metrics: PerformanceMetrics): void {
    console.warn(`[MAPPING PERFORMANCE ${level.toUpperCase()}] ${message}`, metrics);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(level, message, metrics);
      } catch (error) {
        console.error('Alert callback failed:', error);
      }
    });
  }

  /**
   * 🎯 Register alert callback
   */
  public onAlert(callback: (level: AlertLevel, message: string, metrics: PerformanceMetrics) => void): void {
    this.alertCallbacks.push(callback);
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  /**
   * 🚀 Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * ⚡ Get cache statistics
   */
  public getCacheStats(): CacheStatistics {
    return { ...this.cacheStats };
  }

  /**
   * 💀 Get recent operations
   */
  public getRecentOperations(limit: number = 10): MappingOperation[] {
    return this.recentOperations.slice(0, limit).map(op => ({ ...op }));
  }

  /**
   * 🎸 Get performance summary
   */
  public getPerformanceSummary(): {
    overall: 'excellent' | 'good' | 'poor';
    metrics: PerformanceMetrics;
    cacheStats: CacheStatistics;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let overall: 'excellent' | 'good' | 'poor' = 'excellent';

    // Analyze performance
    if (this.metrics.averageExecutionTime > this.thresholds.maxExecutionTime) {
      overall = 'poor';
      recommendations.push('Consider optimizing mapping logic or using more caching');
    } else if (this.metrics.averageExecutionTime > this.thresholds.maxExecutionTime * 0.7) {
      overall = 'good';
      recommendations.push('Performance is acceptable but could be improved');
    }

    if (this.cacheStats.hitRate < this.thresholds.minCacheHitRate) {
      overall = overall === 'excellent' ? 'good' : 'poor';
      recommendations.push('Improve cache strategy or increase cache size');
    }

    const errorRate = this.metrics.failedOperations / this.metrics.totalOperations;
    if (errorRate > this.thresholds.maxErrorRate) {
      overall = 'poor';
      recommendations.push('Investigate and fix mapping errors');
    }

    if (this.metrics.operationsPerSecond < this.thresholds.minOperationsPerSecond) {
      overall = overall === 'excellent' ? 'good' : 'poor';
      recommendations.push('System throughput is below optimal levels');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent! Keep up the good work.');
    }

    return {
      overall,
      metrics: this.getMetrics(),
      cacheStats: this.getCacheStats(),
      recommendations
    };
  }

  // ============================================================================
  // PERIODIC MONITORING
  // ============================================================================

  /**
   * ⚡ Start periodic performance monitoring
   */
  private startPeriodicMonitoring(): void {
    setInterval(() => {
      this.performPeriodicChecks();
    }, 30000); // Check every 30 seconds
  }

  /**
   * 💀 Perform periodic health checks
   */
  private performPeriodicChecks(): void {
    // Check for memory leaks
    const currentMemory = this.getCurrentMemoryUsage();
    if (currentMemory > this.thresholds.maxMemoryUsage) {
      this.triggerAlert(
        'error',
        `Periodic check: Memory usage ${Math.round(currentMemory / (1024 * 1024))}MB exceeds threshold`,
        this.metrics
      );
    }

    // Check for stale operations
    const staleOperations = this.recentOperations.filter(op => 
      op.endTime === 0 && (performance.now() - op.startTime) > 10000 // 10 seconds
    );
    
    if (staleOperations.length > 0) {
      this.triggerAlert(
        'warning',
        `Found ${staleOperations.length} operations that haven't completed in 10+ seconds`,
        this.metrics
      );
    }

    // Auto-clean old operations
    this.cleanupOldOperations();
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * 🎯 Get current memory usage (approximation)
   */
  private getCurrentMemoryUsage(): number {
    // In browser environment, we can't get exact memory usage
    // This is an approximation based on object sizes
    const recentOpsSize = JSON.stringify(this.recentOperations).length;
    const executionTimesSize = this.executionTimes.length * 8; // 8 bytes per number
    const metricsSize = JSON.stringify(this.metrics).length;
    
    return recentOpsSize + executionTimesSize + metricsSize;
  }

  /**
   * ⚡ Cleanup old operations
   */
  private cleanupOldOperations(): void {
    const cutoffTime = performance.now() - (5 * 60 * 1000); // 5 minutes ago
    
    this.recentOperations = this.recentOperations.filter(op => 
      op.startTime > cutoffTime
    );

    this.executionTimes = this.executionTimes.slice(0, this.MAX_EXECUTION_TIMES);
  }

  /**
   * 💀 Reset all metrics (for testing)
   */
  public resetMetrics(): void {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalMappings: 0,
      averageExecutionTime: 0,
      maxExecutionTime: 0,
      minExecutionTime: Infinity,
      lastOperationTime: 0,
      operationsPerSecond: 0,
      memoryUsage: 0,
      startTime: Date.now(),
      cacheHitRate: 0,
      errorRate: 0,
      lastResetTime: Date.now()
    };

    this.cacheStats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      maxSize: 1000,
      evictions: 0,
      lastEvictionTime: 0
    };

    this.recentOperations = [];
    this.executionTimes = [];
  }

  /**
   * 🎸 Export metrics to JSON (for external analysis)
   */
  public exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      cacheStats: this.cacheStats,
      recentOperations: this.recentOperations.slice(0, 50), // Last 50 operations
      summary: this.getPerformanceSummary()
    }, null, 2);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const performanceMonitor = MappingPerformanceMonitor.getInstance();
export default performanceMonitor;

/**
 * 🎸 PUNK MONITORING PRINCIPLES:
 * 
 * ✅ REAL-TIME TRACKING: Every operation monitored
 * ✅ INTELLIGENT ALERTS: Smart thresholds with callbacks
 * ✅ CACHE OPTIMIZATION: Hit rate monitoring
 * ✅ MEMORY AWARENESS: Leak detection & cleanup
 * ✅ PERFORMANCE REPORTS: Comprehensive summaries
 * ✅ PERIODIC HEALTH CHECKS: Proactive monitoring
 * 
 * "Monitor like your life depends on it!" 🎸⚡💀
 */

