import { Wine, ApiResponse } from '../../types';
import { config } from '../../utils/config';
import { mockWines } from '../../data/mockWines';

// External API interfaces
export interface ExternalApiToken {
  access: string;
  refresh: string;
  expires_in: number;
}

export interface ExternalWineData {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  wine_type: string;
  region: string;
  vintage: number;
  alcohol_content: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

// Wine API service interfaces
export interface WineFilters {
  category?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  vintage?: number;
  color?: string;
  inStock?: boolean;
  search?: string;
}

export interface WineSortOptions {
  field: 'name' | 'price' | 'vintage' | 'alcoholContent';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedWineResponse {
  wines: Wine[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateWineData {
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  color: string;
  history: string;
  vintage: number;
  region: string;
  alcoholContent: number;
  category: string;
  stockQuantity: number;
}

export interface UpdateWineData extends Partial<CreateWineData> {
  id: string;
}

// External Wine API client
class ExternalWineApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    // Prevent instantiation in browser to avoid CORS issues
    if (typeof window !== 'undefined') {
      throw new Error('ExternalWineApiClient should not be instantiated in browser environment');
    }
    this.baseUrl = config.api.externalWineApi.baseUrl;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isTokenValid(): boolean {
    return this.token !== null && Date.now() < this.tokenExpiry;
  }

  private async getAuthToken(): Promise<string | null> {
    if (this.isTokenValid()) {
      return this.token;
    }

    // Check if credentials are available
    const username = process.env.EXTERNAL_WINE_API_USERNAME;
    const password = process.env.EXTERNAL_WINE_API_PASSWORD;

    if (!username || !password) {
      console.warn('External wine API credentials not configured, skipping authentication');
      return 'no-auth-required'; // Return a placeholder to indicate no auth needed
    }

    try {
      const response = await fetch(`${this.baseUrl}${config.api.externalWineApi.tokenEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Authentication failed: ${response.status} - ${errorText}`);
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const tokenData: ExternalApiToken = await response.json();
      this.token = tokenData.access;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // Refresh 1 minute early

      return this.token;
    } catch (error) {
      console.error('Failed to get authentication token:', error);
      return null;
    }
  }

  private async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Only add Authorization header if we have a real token
      if (token && token !== 'no-auth-required') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // If unauthorized, clear token and retry once
        if (response.status === 401 && retryCount === 0) {
          this.token = null;
          return this.makeAuthenticatedRequest<T>(url, options, retryCount + 1);
        }

        const errorText = await response.text();
        console.error(`External API error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.makeAuthenticatedRequest<T>(url, options, retryCount + 1);
      }

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { retryCount, url, baseUrl: this.baseUrl }
        }
      };
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true; // Network error
    }
    if (error.message.includes('HTTP 5')) {
      return true; // Server error
    }
    return false;
  }

  async getWines(
    filters: WineFilters = {},
    sort: WineSortOptions = { field: 'name', direction: 'asc' },
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ApiResponse<ExternalWineData[]>> {
    // Build URL with the correct parameters that match the external API
    let url = config.api.externalWineApi.winesEndpoint;
    const params = new URLSearchParams();

    // Add pagination parameters (page-based, not offset-based)
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());

    // Add sorting parameters
    params.append('sortBy', sort.field);
    params.append('sortOrder', sort.direction);

    // Add filter parameters
    if (filters.inStock !== undefined) {
      params.append('inStock', filters.inStock.toString());
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.region) {
      params.append('region', filters.region);
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.vintage) {
      params.append('vintage', filters.vintage.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    url += `?${params.toString()}`;

    // First try without authentication (some APIs don't require auth for read operations)
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`External API returned ${Array.isArray(data) ? data.length : 'unknown'} wines`);
        return { success: true, data };
      }

      // If 401/403, try with authentication
      if (response.status === 401 || response.status === 403) {
        console.log('Trying with authentication...');
        return this.makeAuthenticatedRequest<ExternalWineData[]>(url);
      }

      // For other errors, log and return error
      const errorText = await response.text();
      console.error(`External API error: ${response.status} - ${errorText}`);

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: { status: response.status, errorText }
        }
      };
    } catch (error) {
      console.error('Error accessing external wine API:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
          details: error
        }
      };
    }
  }

  // Get all wines (without pagination) - for backward compatibility
  async getAllWines(): Promise<ApiResponse<ExternalWineData[]>> {
    return this.getWines();
  }

  // Transform external wine data to internal Wine interface
  transformWineData(externalWine: ExternalWineData): Wine {
    return {
      id: externalWine.id,
      name: externalWine.name,
      description: externalWine.description,
      price: externalWine.price,
      image: externalWine.image_url,
      ingredients: [], // Not provided by external API
      color: externalWine.wine_type,
      history: '', // Not provided by external API
      vintage: externalWine.vintage,
      region: externalWine.region,
      alcoholContent: externalWine.alcohol_content,
      category: externalWine.wine_type,
      inStock: externalWine.stock_quantity > 0,
      stockQuantity: externalWine.stock_quantity,
    };
  }
}

// Base API client with retry logic
class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    // In browser, always use internal API to avoid CORS issues
    if (typeof window !== 'undefined') {
      this.baseUrl = config.api.baseUrl; // Use internal API base URL
      this.apiKey = ''; // No API key needed for internal API
      console.log('ApiClient: Browser detected, using internal API:', this.baseUrl);
    } else {
      // On server, can use external API
      this.baseUrl = config.api.wineApiUrl;
      this.apiKey = config.api.wineApiKey;
      console.log('ApiClient: Server detected, using external API:', this.baseUrl);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // Only add Authorization header if we have an API key (for external API)
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest<T>(url, options, retryCount + 1);
      }

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { retryCount, url }
        }
      };
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true; // Network error
    }
    if (error.message.includes('HTTP 5')) {
      return true; // Server error
    }
    return false;
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'DELETE' });
  }
}

// Wine service class
class WineService {
  private apiClient: ApiClient;
  private externalApiClient: ExternalWineApiClient | null = null;

  constructor() {
    this.apiClient = new ApiClient();
    // Don't instantiate external API client in browser to avoid CORS issues
    if (typeof window === 'undefined') {
      try {
        this.externalApiClient = new ExternalWineApiClient();
      } catch (error) {
        console.warn('Failed to create external API client:', error);
        this.externalApiClient = null;
      }
    }
  }

  private getExternalApiClient(): ExternalWineApiClient | null {
    // Only create external API client on server side
    if (typeof window === 'undefined' && !this.externalApiClient) {
      this.externalApiClient = new ExternalWineApiClient();
    }
    return this.externalApiClient;
  }

  // Fetch wines with pagination and filtering
  async getWines(
    filters: WineFilters = {},
    sort: WineSortOptions = { field: 'name', direction: 'asc' },
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ApiResponse<PaginatedWineResponse>> {
    // Check if we're running in the browser
    const isBrowser = typeof window !== 'undefined';

    if (isBrowser) {
      // In browser, ALWAYS use our internal API routes to avoid CORS issues
      console.log('Browser detected: Using internal API route to avoid CORS');

      try {
        const queryParams = new URLSearchParams();

        // Add pagination
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());

        // Add sorting
        queryParams.append('sortBy', sort.field);
        queryParams.append('sortOrder', sort.direction);

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });

        console.log(`Making request to: /api/wines?${queryParams.toString()}`);
        const response = await fetch(`/api/wines?${queryParams.toString()}`);

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully fetched wines from internal API');
          console.log('Internal API response structure:', JSON.stringify(data, null, 2));

          // Ensure the response is in the correct ApiResponse format
          if (data.success && data.data) {
            return data; // Already in ApiResponse<PaginatedWineResponse> format
          } else {
            // If it's raw data, wrap it in ApiResponse format
            return { success: true, data: data };
          }
        } else {
          const errorText = await response.text();
          console.error(`Internal API error: ${response.status} - ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Internal API failed, using mock data:', error);

        // Final fallback: use mock data
        let wines = [...mockWines];

        // Apply filters to mock data
        wines = this.applyFilters(wines, filters);

        // Apply sorting to mock data
        wines = this.applySorting(wines, sort);

        // Apply pagination to mock data
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedWines = wines.slice(startIndex, endIndex);

        const paginatedResponse: PaginatedWineResponse = {
          wines: paginatedWines,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: wines.length,
            totalPages: Math.ceil(wines.length / pagination.limit),
            hasNext: endIndex < wines.length,
            hasPrev: pagination.page > 1,
          },
        };

        console.log('Serving mock wine data as fallback');
        return { success: true, data: paginatedResponse };
      }
    }

    // Server-side: Try external API first, then fallback to internal API
    try {
      const externalApiClient = this.getExternalApiClient();
      if (!externalApiClient) {
        throw new Error('External API client not available in browser');
      }

      // Use the external API with the same parameters (no conversion needed)
      const externalResponse = await externalApiClient.getWines(filters, sort, pagination);

      if (externalResponse.success && externalResponse.data && externalResponse.data.length > 0) {
        console.log(`Successfully fetched ${externalResponse.data.length} wines from external API (page ${pagination.page})`);

        // Transform external wine data to internal format
        const wines = externalResponse.data.map(wine =>
          externalApiClient.transformWineData(wine)
        );

        // Since the external API handles filtering, sorting, and pagination,
        // we don't need to apply them again here
        const hasMore = wines.length === pagination.limit;
        const estimatedTotal = hasMore ? (pagination.page * pagination.limit) + 1 : ((pagination.page - 1) * pagination.limit) + wines.length;

        const paginatedResponse: PaginatedWineResponse = {
          wines: wines,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: estimatedTotal,
            totalPages: hasMore ? pagination.page + 1 : pagination.page,
            hasNext: hasMore,
            hasPrev: pagination.page > 1,
          },
        };

        return { success: true, data: paginatedResponse };
      } else {
        console.warn('External API returned no data, falling back to internal API');
      }
    } catch (error) {
      console.warn('External API failed, falling back to internal API:', error);
    }

    // Fallback to internal API
    try {
      const queryParams = new URLSearchParams();

      // Add pagination
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      // Add sorting
      queryParams.append('sortBy', sort.field);
      queryParams.append('sortOrder', sort.direction);

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const internalResponse = await this.apiClient.get<PaginatedWineResponse>(`/wines?${queryParams.toString()}`);

      if (internalResponse.success) {
        console.log('Successfully fetched wines from internal API');
        return internalResponse;
      } else {
        console.error('Internal API also failed:', internalResponse.error);
        return internalResponse;
      }
    } catch (error) {
      console.error('Both external and internal APIs failed, using mock data:', error);

      // Final fallback: use mock data
      let wines = [...mockWines];

      // Apply filters to mock data
      wines = this.applyFilters(wines, filters);

      // Apply sorting to mock data
      wines = this.applySorting(wines, sort);

      // Apply pagination to mock data
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedWines = wines.slice(startIndex, endIndex);

      const paginatedResponse: PaginatedWineResponse = {
        wines: paginatedWines,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: wines.length,
          totalPages: Math.ceil(wines.length / pagination.limit),
          hasNext: endIndex < wines.length,
          hasPrev: pagination.page > 1,
        },
      };

      console.log('Serving mock wine data as fallback');
      return { success: true, data: paginatedResponse };
    }
  }

  // Helper method to apply filters to wine array
  private applyFilters(wines: Wine[], filters: WineFilters): Wine[] {
    return wines.filter(wine => {
      if (filters.category && wine.category !== filters.category) return false;
      if (filters.region && wine.region !== filters.region) return false;
      if (filters.minPrice && wine.price < filters.minPrice) return false;
      if (filters.maxPrice && wine.price > filters.maxPrice) return false;
      if (filters.vintage && wine.vintage !== filters.vintage) return false;
      if (filters.color && wine.color !== filters.color) return false;
      if (filters.inStock !== undefined && wine.inStock !== filters.inStock) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = `${wine.name} ${wine.description} ${wine.region}`.toLowerCase();
        if (!searchableText.includes(searchLower)) return false;
      }
      return true;
    });
  }

  // Helper method to apply sorting to wine array
  private applySorting(wines: Wine[], sort: WineSortOptions): Wine[] {
    return wines.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  // Get single wine by ID
  async getWineById(id: string): Promise<ApiResponse<Wine>> {
    return this.apiClient.get<Wine>(`/wines/${id}`);
  }

  // Search wines with text query
  async searchWines(
    query: string,
    filters: WineFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ApiResponse<PaginatedWineResponse>> {
    return this.getWines(
      { ...filters, search: query },
      { field: 'name', direction: 'asc' },
      pagination
    );
  }

  // Get wine categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    // In browser, use internal API with simple=true parameter
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/wines/categories?simple=true');
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to fetch categories, using fallback:', error);
        // Fallback categories
        return {
          success: true,
          data: ['Red Wine', 'White Wine', 'Rosé Wine', 'Sparkling Wine', 'Dessert Wine', 'Fortified Wine']
        };
      }
    }
    
    // Server-side: use ApiClient
    return this.apiClient.get<string[]>('/wines/categories?simple=true');
  }

  // Get wine regions
  async getRegions(): Promise<ApiResponse<string[]>> {
    // In browser, use internal API with simple=true parameter
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/wines/regions?simple=true');
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to fetch regions, using fallback:', error);
        // Fallback regions
        return {
          success: true,
          data: ['Bordeaux, France', 'Champagne, France', 'Napa Valley, California', 'Piedmont, Italy', 'Loire Valley, France', 'Mosel, Germany']
        };
      }
    }
    
    // Server-side: use ApiClient
    return this.apiClient.get<string[]>('/wines/regions?simple=true');
  }

  // Staff/Admin CRUD operations
  async createWine(wineData: CreateWineData): Promise<ApiResponse<Wine>> {
    return this.apiClient.post<Wine>('/wines', {
      ...wineData,
      inStock: wineData.stockQuantity > 0,
    });
  }

  async updateWine(wineData: UpdateWineData): Promise<ApiResponse<Wine>> {
    const { id, ...updateData } = wineData;
    return this.apiClient.patch<Wine>(`/wines/${id}`, {
      ...updateData,
      ...(updateData.stockQuantity !== undefined && {
        inStock: updateData.stockQuantity > 0,
      }),
    });
  }

  async deleteWine(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.apiClient.delete<{ success: boolean }>(`/wines/${id}`);
  }

  // Bulk operations for staff/admin
  async bulkUpdateStock(updates: { id: string; stockQuantity: number }[]): Promise<ApiResponse<Wine[]>> {
    return this.apiClient.patch<Wine[]>('/wines/bulk-stock', { updates });
  }

  async getFeaturedWines(limit: number = 6): Promise<ApiResponse<Wine[]>> {
    return this.apiClient.get<Wine[]>(`/wines/featured?limit=${limit}`);
  }

  // Get low stock wines for inventory management
  async getLowStockWines(threshold: number = 10): Promise<ApiResponse<Wine[]>> {
    return this.apiClient.get<Wine[]>(`/wines/low-stock?threshold=${threshold}`);
  }

  // Get wines specifically from external API
  async getExternalWines(
    filters: WineFilters = {},
    sort: WineSortOptions = { field: 'name', direction: 'asc' },
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ApiResponse<Wine[]>> {
    const externalApiClient = this.getExternalApiClient();
    if (!externalApiClient) {
      return {
        success: false,
        error: {
          code: 'NOT_AVAILABLE',
          message: 'External API client not available in browser environment'
        }
      };
    }

    const response = await externalApiClient.getWines(filters, sort, pagination);
    if (response.success && response.data) {
      const transformedWines = response.data.map(wine =>
        externalApiClient.transformWineData(wine)
      );
      return { success: true, data: transformedWines };
    }
    return response as ApiResponse<Wine[]>;
  }

  // Sync external wines with internal database (for admin use)
  async syncExternalWines(): Promise<ApiResponse<{ synced: number; errors: string[] }>> {
    try {
      // Get all wines for syncing (use a large limit to get all wines)
      const externalResponse = await this.externalApiClient.getWines({}, { field: 'name', direction: 'asc' }, { page: 1, limit: 1000 });

      if (!externalResponse.success || !externalResponse.data) {
        return {
          success: false,
          error: {
            code: 'SYNC_ERROR',
            message: 'Failed to fetch wines from external API'
          }
        };
      }

      const syncResults = {
        synced: 0,
        errors: [] as string[]
      };

      // Process each external wine
      for (const externalWine of externalResponse.data) {
        try {
          const transformedWine = this.externalApiClient.transformWineData(externalWine);

          // Try to create the wine in internal system via API
          const response = await fetch('/api/wines', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: transformedWine.name,
              description: transformedWine.description,
              price: transformedWine.price,
              image: transformedWine.image,
              ingredients: transformedWine.ingredients,
              color: transformedWine.color,
              history: transformedWine.history,
              vintage: transformedWine.vintage,
              region: transformedWine.region,
              alcoholContent: transformedWine.alcoholContent,
              category: transformedWine.category,
              stockQuantity: transformedWine.stockQuantity,
            }),
          });

          if (response.ok) {
            syncResults.synced++;
          } else {
            const errorData = await response.json();
            syncResults.errors.push(`Failed to sync wine ${externalWine.name}: ${errorData.error?.message || 'Unknown error'}`);
          }
        } catch (error) {
          syncResults.errors.push(`Error processing wine ${externalWine.name}: ${error}`);
        }
      }

      return { success: true, data: syncResults };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SYNC_ERROR',
          message: 'Failed to sync external wines',
          details: error
        }
      };
    }
  }
}

// Export singleton instance
export const wineService = new WineService();
export default wineService;