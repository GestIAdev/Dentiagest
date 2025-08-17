/**
 * 🚀 APOLLO NUCLEAR - WEBPACK BYPASS EDITION
 * By PunkClaude & RaulVisionario - August 17, 2025
 * 
 * MISSION: Apollo perfection WITHOUT webpack drama
 * STRATEGY: Single file, maximum power, zero imports
 */

// ============================================================================
// APOLLO TYPES - PERFECT TYPESCRIPT SAFETY
// ============================================================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
    detail?: string;
    code?: string;
  };
  status?: number;
  performance?: {
    responseTime: number;
    endpoint: string;
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  version?: 'v1' | 'v2';
  timeout?: number;
  requiresAuth?: boolean;
}

// ============================================================================
// APOLLO CORE ENGINE - PURE POWER
// ============================================================================

class ApolloEngine {
  private baseUrl: string = 'http://localhost:8002';
  private defaultTimeout: number = 10000;
  private performanceMetrics: Map<string, number[]> = new Map();
  
  // 🎯 CORE REQUEST METHOD - THE HEART OF APOLLO
  public async request<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    
    const {
      method = 'GET',
      headers = {},
      body,
      version = 'v1',
      timeout = this.defaultTimeout,
      requiresAuth = true
    } = options;

    const fullUrl = `${this.baseUrl}/api/${version}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // 🛡️ AUTO AUTHENTICATION
    const requestHeaders: Record<string, string> = {
      'Content-Type': body instanceof FormData ? '' : 'application/json',
      ...headers
    };
    
    if (requiresAuth) {
      const token = localStorage.getItem('accessToken');
      console.log('🚀 Apollo Auth Debug:', { 
        token: token ? 'EXISTS' : 'MISSING', 
        tokenLength: token?.length,
        fullToken: token ? token.substring(0, 50) + '...' : 'NULL'
      });
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Auth Header Set:', requestHeaders['Authorization'].substring(0, 50) + '...');
      } else {
        console.log('⚠️ No token found, redirecting to login...');
        // Clear any invalid tokens and redirect
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('No authentication token available');
      }
    }
    
    // Clean Content-Type for FormData
    if (body instanceof FormData) {
      delete requestHeaders['Content-Type'];
    }

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
        error: !response.ok ? { 
          message: `HTTP ${response.status}`,
          detail: response.statusText,
          code: response.status.toString()
        } : undefined,
        status: response.status,
        performance: {
          responseTime: executionTime,
          endpoint
        }
      };

      console.log(`🚀 Apollo ${method} ${endpoint}:`, {
        success: result.success,
        responseTime: `${executionTime.toFixed(2)}ms`,
        status: response.status
      });

      return result;

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      console.error(`❌ Apollo ${method} ${endpoint} failed:`, error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          detail: 'Request failed',
          code: 'NETWORK_ERROR'
        },
        performance: {
          responseTime: executionTime,
          endpoint
        }
      };
    }
  }

  // 🎯 HTTP METHODS - CLEAN & POWERFUL
  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
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

  // 📊 PERFORMANCE MONITORING
  private recordPerformance(endpoint: string, responseTime: number): void {
    if (!this.performanceMetrics.has(endpoint)) {
      this.performanceMetrics.set(endpoint, []);
    }
    
    const metrics = this.performanceMetrics.get(endpoint)!;
    metrics.push(responseTime);
    
    // Keep only last 10 measurements
    if (metrics.length > 10) {
      metrics.shift();
    }
  }

  public getPerformanceStats(endpoint: string): { avg: number; min: number; max: number } | null {
    const metrics = this.performanceMetrics.get(endpoint);
    if (!metrics || metrics.length === 0) return null;
    
    return {
      avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
      min: Math.min(...metrics),
      max: Math.max(...metrics)
    };
  }
}

// ============================================================================
// SPECIALIZED API MODULES - DOMAIN EXPERTS
// ============================================================================

class DocumentsAPI {
  constructor(private engine: ApolloEngine) {}

  async upload(formData: FormData) {
    const response = await this.engine.post('/medical-records/documents/upload', formData);
    if (!response.success) throw new Error(response.error?.message || 'Upload failed');
    return response.data;
  }

  async list(params?: string | Record<string, any>): Promise<{ items: any[], total: number, pages: number }> {
    let endpoint = '/medical-records/documents';
    
    if (params) {
      if (typeof params === 'string') {
        endpoint = `/medical-records/documents?${params}`;
      } else {
        // Convert object to URLSearchParams
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
        endpoint = `/medical-records/documents?${queryParams.toString()}`;
      }
    }
    
    const response = await this.engine.get(endpoint);
    if (!response.success) throw new Error(response.error?.message || 'List failed');
    
    // 🎯 RETURN EXACTLY WHAT COMPONENTS EXPECT
    const data = response.data as any;
    return {
      items: data?.items || data || [],
      total: data?.total || 0,
      pages: data?.pages || 0
    };
  }

  async download(documentId: string): Promise<Blob> {
    const response = await this.engine.get(`/medical-records/documents/${documentId}/download`);
    if (!response.success) throw new Error(response.error?.message || 'Download failed');
    
    // 🎯 RETURN DIRECT BLOB FOR URL.createObjectURL()
    return response.data as Blob;
  }

  async delete(documentId: string) {
    const response = await this.engine.delete(`/medical-records/documents/${documentId}`);
    if (!response.success) throw new Error(response.error?.message || 'Delete failed');
    return response.data;
  }
}

class PatientsAPI {
  constructor(private engine: ApolloEngine) {}

  async list(params?: string | Record<string, any>): Promise<{ items: any[] }> {
    let endpoint = '/patients';
    
    if (params) {
      if (typeof params === 'string') {
        endpoint = `/patients?${params}`;
      } else {
        // Convert object to URLSearchParams
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
        endpoint = `/patients?${queryParams.toString()}`;
      }
    }
    
    const response = await this.engine.get(endpoint);
    if (!response.success) throw new Error(response.error?.message || 'List failed');
    
    // 🎯 DUAL FORMAT SUPPORT - items OR patients
    const data = response.data as any;
    return {
      items: data?.items || data?.patients || data || []
    };
  }

  async get(patientId: string) {
    const response = await this.engine.get(`/patients/${patientId}`);
    if (!response.success) throw new Error(response.error?.message || 'Get failed');
    return response.data;
  }

  async getAppointments(patientId: string): Promise<{ appointments: any[] }> {
    const response = await this.engine.get(`/patients/${patientId}/appointments`);
    if (!response.success) throw new Error(response.error?.message || 'Get appointments failed');
    
    // 🎯 RETURN APPOINTMENTS STRUCTURE
    const data = response.data as any;
    return {
      appointments: data?.appointments || []
    };
  }

  async create(patientData: any) {
    const response = await this.engine.post('/patients', patientData);
    if (!response.success) throw new Error(response.error?.message || 'Create failed');
    return response.data;
  }

  async update(patientId: string, patientData: any) {
    const response = await this.engine.put(`/patients/${patientId}`, patientData);
    if (!response.success) throw new Error(response.error?.message || 'Update failed');
    return response.data;
  }

  async delete(patientId: string) {
    const response = await this.engine.delete(`/patients/${patientId}`);
    if (!response.success) throw new Error(response.error?.message || 'Delete failed');
    return response.data;
  }

  async search(query: string): Promise<{ items: any[] }> {
    const response = await this.engine.get(`/patients/search/suggestions?query=${encodeURIComponent(query)}`);
    if (!response.success) throw new Error(response.error?.message || 'Search failed');
    
    // 🎯 CONSISTENT ITEMS FORMAT
    const data = response.data as any;
    return {
      items: data?.items || data?.patients || data || []
    };
  }
}

class MedicalRecordsAPI {
  constructor(private engine: ApolloEngine) {}

  async list(recordType?: string, patientId?: string, filters?: any) {
    const params = new URLSearchParams();
    if (recordType) params.append('record_type', recordType);
    if (patientId) params.append('patient_id', patientId);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = params.toString() ? `/medical-records?${params}` : '/medical-records';
    const response = await this.engine.get(endpoint);
    if (!response.success) throw new Error(response.error?.message || 'List failed');
    return response.data;
  }

  async get(recordId: string) {
    const response = await this.engine.get(`/medical-records/${recordId}`);
    if (!response.success) throw new Error(response.error?.message || 'Get failed');
    return response.data;
  }

  // 🎯 ALIAS FOR COMPONENT COMPATIBILITY
  async getById(recordId: string) {
    return this.get(recordId);
  }

  async create(recordData: any) {
    const response = await this.engine.post('/medical-records', recordData);
    if (!response.success) throw new Error(response.error?.message || 'Create failed');
    return response.data;
  }

  async update(recordId: string, recordData: any) {
    const response = await this.engine.put(`/medical-records/${recordId}`, recordData);
    if (!response.success) throw new Error(response.error?.message || 'Update failed');
    return response.data;
  }

  async delete(recordId: string): Promise<{ success: boolean; message?: string }> {
    const response = await this.engine.delete(`/medical-records/${recordId}`);
    
    // 🎯 RETURN SUCCESS/MESSAGE FORMAT EXPECTED BY COMPONENTS
    return {
      success: response.success,
      message: response.error?.message || (response.success ? 'Deleted successfully' : 'Delete failed')
    };
  }
}

// ============================================================================
// APOLLO MASTER OBJECT - THE ONE IMPORT TO RULE THEM ALL
// ============================================================================

class Apollo {
  private engine: ApolloEngine;
  public api: ApolloEngine;
  public docs: DocumentsAPI;
  public patients: PatientsAPI;
  public medicalRecords: MedicalRecordsAPI;

  constructor() {
    this.engine = new ApolloEngine();
    this.api = this.engine; // Direct access to core engine
    this.docs = new DocumentsAPI(this.engine);
    this.patients = new PatientsAPI(this.engine);
    this.medicalRecords = new MedicalRecordsAPI(this.engine);
  }

  // 📊 Global performance monitoring
  getGlobalStats() {
    return {
      totalRequests: Array.from(this.engine['performanceMetrics'].keys()).length,
      performance: Object.fromEntries(
        Array.from(this.engine['performanceMetrics'].keys()).map(endpoint => [
          endpoint,
          this.engine.getPerformanceStats(endpoint)
        ])
      )
    };
  }

  // 🔧 Configuration methods
  setBaseUrl(url: string) {
    this.engine['baseUrl'] = url;
    return this;
  }

  setTimeout(ms: number) {
    this.engine['defaultTimeout'] = ms;
    return this;
  }
}

// ============================================================================
// EXPORT THE PERFECT APOLLO INSTANCE
// ============================================================================

const apollo = new Apollo();

export default apollo;
export { Apollo, ApolloEngine };
export type { ApiResponse, RequestOptions };

// 🚀 APOLLO READY FOR DOMINATION! 
// No webpack imports, no drama, just pure power!
