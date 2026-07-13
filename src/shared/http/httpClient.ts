import { env } from "@/shared/config/env";
import { ApiError } from "@/shared/http/httpError";

/**
 * Thin fetch wrapper around the separate backend API.
 *
 * Responsibilities: base URL, JSON (de)serialization, auth header injection,
 * and normalizing failures into {@link ApiError}. Feature `infrastructure`
 * layers build their repositories on top of this — no feature talks to `fetch`
 * directly.
 *
 * Runs on the server by default (Server Components / Server Actions), so the
 * backend base URL and credentials stay off the client.
 */

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON-serializable body; set automatically with the right Content-Type. */
  body?: unknown;
  /** Bearer token for authenticated calls (resolved by the auth feature). */
  token?: string;
  /** Next.js fetch cache controls (revalidate/tags). */
  next?: { revalidate?: number | false; tags?: string[] };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, next, ...rest } = options;

  const url = path.startsWith("http") ? path : `${env.apiUrl}${path}`;

  const response = await fetch(url, {
    ...rest,
    next,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsed: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request to ${path} failed with ${response.status}`,
      parsed,
    );
  }

  return parsed as T;
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export type HttpClient = typeof httpClient;
