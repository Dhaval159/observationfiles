import { apiConfig } from "@/config/api";
import type { ApiResponse, ApiError } from "@/types/api";

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  headers: Record<string, string>;
}

type Interceptor<T> = (value: T) => T | Promise<T>;

type RequestInterceptor = Interceptor<RequestInit>;
type ResponseInterceptor = Interceptor<ApiResponse<unknown>>;

export class ApiClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? apiConfig.baseUrl,
      timeout: config.timeout ?? apiConfig.timeout,
      retryCount: config.retryCount ?? apiConfig.retryCount,
      retryDelay: config.retryDelay ?? apiConfig.retryDelay,
      headers: config.headers ?? {},
    };
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const idx = this.requestInterceptors.indexOf(interceptor);
      if (idx >= 0) this.requestInterceptors.splice(idx, 1);
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const idx = this.responseInterceptors.indexOf(interceptor);
      if (idx >= 0) this.responseInterceptors.splice(idx, 1);
    };
  }

  async get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url, params);
    return this.request<T>(fullUrl, { method: "GET" });
  }

  async post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    return this.request<T>(fullUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    return this.request<T>(fullUrl, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    return this.request<T>(fullUrl, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    return this.request<T>(fullUrl, { method: "DELETE" });
  }

  async upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    return this.request<T>(fullUrl, {
      method: "POST",
      body: formData,
    });
  }

  private buildUrl(url: string, params?: Record<string, string>): string {
    const fullPath = url.startsWith("http") ? url : `${this.config.baseUrl}${url}`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params).toString();
      return `${fullPath}?${searchParams}`;
    }
    return fullPath;
  }

  private getHeaders(isFormData = false): Record<string, string> {
    const headers: Record<string, string> = { ...this.config.headers };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async request<T>(
    url: string,
    options: RequestInit,
    attempt = 0,
  ): Promise<ApiResponse<T>> {
    const isFormData = options.body instanceof FormData;

    let requestOptions: RequestInit = {
      ...options,
      headers: this.getHeaders(isFormData),
    };

    for (const interceptor of this.requestInterceptors) {
      requestOptions = (await interceptor(requestOptions)) as RequestInit;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let result: ApiResponse<T>;

      if (options.method === "DELETE" && response.status === 204) {
        result = { data: null, error: null, status: 204 };
      } else {
        result = await this.handleResponse<T>(response);
      }

      for (const interceptor of this.responseInterceptors) {
        result = (await interceptor(result)) as ApiResponse<T>;
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (
        attempt < this.config.retryCount &&
        (error instanceof TypeError ||
          (error instanceof DOMException && error.name === "AbortError"))
      ) {
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(url, options, attempt + 1);
      }

      return this.handleError(error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;

    if (!response.ok) {
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        // no body available
      }

      const apiError: ApiError = {
        code: status.toString(),
        message:
          body && typeof body === "object" && body !== null && "message" in body
            ? String((body as Record<string, unknown>).message)
            : "Request failed",
        ...(body && typeof body === "object" && body !== null
          ? { details: body as Record<string, unknown> }
          : {}),
      };

      return { data: null, error: apiError, status };
    }

    if (status === 204) {
      return { data: null, error: null, status };
    }

    const data = await response.json();
    return { data: data as T, error: null, status };
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    let message = "Network error";
    let code = "NETWORK_ERROR";

    if (error instanceof DOMException && error.name === "AbortError") {
      message = "Request timed out";
      code = "TIMEOUT";
    } else if (error instanceof TypeError) {
      message = "Network request failed";
      code = "NETWORK_ERROR";
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      data: null,
      error: { code, message },
      status: 0,
    };
  }
}

export const apiClient = new ApiClient({
  baseUrl: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  retryCount: apiConfig.retryCount,
  retryDelay: apiConfig.retryDelay,
});
