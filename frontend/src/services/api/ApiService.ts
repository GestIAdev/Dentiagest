/**
 * 🚀 APOLLO API SERVICE - V2 MIGRATION COMMAND CENTER
 * OPERACIÓN APOLLO - Centralized API management with V1/V2 switching
 * 
 * @author PunkClaude & RaulVisionario
 * @date 17 Agosto 2025
 * @mission Replace scattered fetch calls with bulletproof service
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ApiVersion = 'v1' | 'v2';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  executionTime: number;
  version: ApiVersion;
  endpoint: string;
}

export interface ApiConfig {
  baseUrl: string;
  defaultVersion: ApiVersion;
  timeout: number;
  enableLogging: boolean;
  enablePerformanceMonitoring: boolean;
}

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  version?: ApiVersion;
  timeout?: number;
  requiresAuth?: boolean;
}

// ============================================================================
// ENDPOINT REGISTRY - SINGLE SOURCE OF TRUTH
// ============================================================================

export const API_ENDPOINTS = {
  // 📄 DOCUMENTS
  DOCUMENTS: {
    UPLOAD: '/medical-records/documents/upload',
    LIST: '/medical-records/documents',
    DOWNLOAD: '/medical-records/documents/{id}/download',
    DELETE: '/medical-records/documents/{id}',
    DELETION_STATS: '/documents/deletion-stats',
    DELETION_REQUESTS: '/documents/deletion-requests'
  },
  
  // 👥 PATIENTS  
  PATIENTS: {
    LIST: '/patients',
    GET: '/patients/{id}',
    CREATE: '/patients',
    UPDATE: '/patients/{id}',
    DELETE: '/patients/{id}',
    SEARCH: '/patients/search/suggestions'
  },
  
  // 📅 APPOINTMENTS
  APPOINTMENTS: {
    LIST: '/appointments',
    GET: '/appointments/{id}',
    CREATE: '/appointments',
    UPDATE: '/appointments/{id}',
    DELETE: '/appointments/{id}'
  },
  
  // 🏥 MEDICAL RECORDS
  MEDICAL_RECORDS: {
    LIST: '/medical-records',
    GET: '/medical-records/{id}',
    CREATE: '/medical-records',
    UPDATE: '/medical-records/{id}',
    DELETE: '/medical-records/{id}'
  },
  
  // 🔐 AUTHENTICATION
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    MFA_STATUS: '/auth/mfa/status',
    MFA_SETUP: '/auth/mfa/setup',
    MFA_VERIFY: '/auth/mfa/verify',
    MFA_DISABLE: '/auth/mfa/disable'
  }
} as const;

// ============================================================================
// APOLLO API SERVICE CLASS
// ============================================================================

class ApolloApiService {
  private config: ApiConfig;
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      baseUrl: 'http://localhost:8005', // 🔥 SELENE NODE 1 - AUTH & API
      defaultVersion: 'v1',
      timeout: 10000,
      enableLogging: true,
      enablePerformanceMonitoring: true,
      ...config
    };

    this.log('🚀 Apollo API Service initialized', { config: this.config });
  }

  // ============================================================================
  // CORE REQUEST METHOD
  // ============================================================================

  public async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    
    const {
      method = 'GET',
      headers = {},
      body,
      version = this.config.defaultVersion,
      timeout = this.config.timeout,
      requiresAuth = true
    } = options;

    const fullUrl = this.buildUrl(endpoint, version);
    const requestHeaders = this.buildHeaders(headers, requiresAuth);

    this.log(`🌐 ${method} ${fullUrl}`, { 
      endpoint, 
      version, 
      headers: requestHeaders 
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);

      const executionTime = performance.now() - startTime;
      this.recordPerformance(endpoint, executionTime);

      let data: T | undefined;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (method !== 'DELETE') {
        data = await response.text() as any;
      }

      const result: ApiResponse<T> = {
        success: response.ok,
        data,
        status: response.status,
        executionTime,
        version,
        endpoint: fullUrl
      };

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
        this.log(`❌ Request failed: ${result.error}`, result);
      } else {
        this.log(`✅ Request successful (${executionTime.toFixed(2)}ms)`, result);
      }

      return result;

    } catch (error: any) {
      const executionTime = performance.now() - startTime;
      
      const result: ApiResponse<T> = {
        success: false,
        error: error.name === 'AbortError' ? 'Request timeout' : error.message,
        status: 0,
        executionTime,
        version,
        endpoint: fullUrl
      };

      this.log(`💥 Request error: ${result.error}`, result);
      return result;
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // ============================================================================
  // URL & HEADER BUILDERS
  // ============================================================================

  private buildUrl(endpoint: string, version: ApiVersion): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.config.baseUrl}/api/${version}${cleanEndpoint}`;
  }

  private buildHeaders(customHeaders: Record<string, string>, requiresAuth: boolean): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (requiresAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // ============================================================================
  // TEMPLATE REPLACEMENT
  // ============================================================================

  public replaceUrlParams(template: string, params: Record<string, string | number>): string {
    let result = template;
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(`{${key}}`, String(value));
    });
    return result;
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  private recordPerformance(endpoint: string, executionTime: number): void {
    if (!this.config.enablePerformanceMonitoring) return;

    if (!this.performanceMetrics.has(endpoint)) {
      this.performanceMetrics.set(endpoint, []);
    }
    
    const metrics = this.performanceMetrics.get(endpoint)!;
    metrics.push(executionTime);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  public getPerformanceMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};
    
    this.performanceMetrics.forEach((times, endpoint) => {
      result[endpoint] = {
        avg: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length
      };
    });
    
    return result;
  }

  // ============================================================================
  // VERSION MANAGEMENT
  // ============================================================================

  public setDefaultVersion(version: ApiVersion): void {
    this.config.defaultVersion = version;
    this.log(`🔄 Default API version changed to ${version}`);
  }

  public getApiInfo(): { version: ApiVersion; baseUrl: string; endpoints: number } {
    const endpointCount = Object.values(API_ENDPOINTS)
      .reduce((count, category) => count + Object.keys(category).length, 0);
    
    return {
      version: this.config.defaultVersion,
      baseUrl: this.config.baseUrl,
      endpoints: endpointCount
    };
  }

  // ============================================================================
  // LOGGING
  // ============================================================================

  private log(message: string, data?: any): void {
    if (!this.config.enableLogging) return;
    
    console.log(`🚀 Apollo: ${message}`, data || '');
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  public async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.get('/health', { requiresAuth: false });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apolloApi = new ApolloApiService();

// ============================================================================
// QUICK ACCESS FUNCTIONS
// ============================================================================

export const api = {
  get: apolloApi.get.bind(apolloApi),
  post: apolloApi.post.bind(apolloApi),
  put: apolloApi.put.bind(apolloApi),
  delete: apolloApi.delete.bind(apolloApi),
  request: apolloApi.request.bind(apolloApi),
  replaceParams: apolloApi.replaceUrlParams.bind(apolloApi),
  setVersion: apolloApi.setDefaultVersion.bind(apolloApi),
  getMetrics: apolloApi.getPerformanceMetrics.bind(apolloApi),
  healthCheck: apolloApi.healthCheck.bind(apolloApi),
  info: apolloApi.getApiInfo.bind(apolloApi)
};

export default apolloApi;

/**
 * 🎸 APOLLO USAGE EXAMPLES:
 * 
 * // Simple GET request
 * const patients = await api.get(API_ENDPOINTS.PATIENTS.LIST);
 * 
 * // POST with body
 * const newPatient = await api.post(API_ENDPOINTS.PATIENTS.CREATE, patientData);
 * 
 * // URL with parameters
 * const patientUrl = api.replaceParams(API_ENDPOINTS.PATIENTS.GET, { id: '123' });
 * const patient = await api.get(patientUrl);
 * 
 * // Force V2 API
 * const documents = await api.get(API_ENDPOINTS.DOCUMENTS.LIST, { version: 'v2' });
 * 
 * // Performance monitoring
 * const metrics = api.getMetrics();
 * console.log('API Performance:', metrics);
 * 
 * // Health check
 * const health = await api.healthCheck();
 * 
 * "One service to rule them all!" 🎸⚡💀
 */

