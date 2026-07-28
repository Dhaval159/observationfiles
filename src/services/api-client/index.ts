import { apiConfig } from "@/config/api";
import type { ApiResponse } from "@/types/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const url = `${apiConfig.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: { code: response.status.toString(), message: data.message ?? "Request failed" },
        status: response.status,
      };
    }

    return { data: data as T, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: { code: "NETWORK_ERROR", message: (error as Error).message },
      status: 0,
    };
  }
}

export const apiClient = {
  get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const searchParams = params ? `?${new URLSearchParams(params)}` : "";
    return request<T>(`${endpoint}${searchParams}`);
  },

  post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  },

  put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
  },

  patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) });
  },

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: "DELETE" });
  },
};
