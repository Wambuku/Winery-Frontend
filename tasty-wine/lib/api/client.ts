export interface ApiErrorPayload {
  status: number;
  message: string;
  details?: Record<string, unknown> | null;
  body?: unknown;
}

export class ApiError extends Error {
  public status: number;

  public details?: Record<string, unknown> | null;

  public body?: unknown;

  constructor({ status, message, details, body }: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.body = body;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retries?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
  query?: Record<string, string | number | boolean | undefined | null>;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://winery-backend.onrender.com").replace(
  /\/$/,
  ""
);

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;
const RETRY_STATUS_CODES = [502, 503, 504];

function buildQueryString(query: ApiRequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function resolveHeaders(options: ApiRequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  const hasJsonBody =
    options.body != null &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob);

  if (hasJsonBody) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return headers;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body == null) return undefined;
  if (body instanceof FormData || body instanceof Blob) return body;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

async function sleep(durationMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (response.status === 204 || !contentType) {
    return null;
  }
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => null);
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") {
    return fallback;
  }
  const record = body as Record<string, unknown>;
  const candidates = [record.message, record.detail, record.error, record.errors];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    retryOnStatuses = RETRY_STATUS_CODES,
    query,
  } = options;

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}${buildQueryString(query)}`;
  const headers = resolveHeaders(options);

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: serializeBody(body),
        signal,
        cache: "no-store",
      });

      const parsedBody = await parseResponse(response);

      if (!response.ok) {
        const message = extractErrorMessage(parsedBody, response.statusText || "API request failed");
        if (attempt < retries && retryOnStatuses.includes(response.status)) {
          attempt += 1;
          lastError = new ApiError({
            status: response.status,
            message,
            details: typeof parsedBody === "object" && parsedBody !== null ? (parsedBody as Record<string, unknown>) : undefined,
            body: parsedBody,
          });
          await sleep(retryDelayMs * attempt);
          continue;
        }

        throw new ApiError({
          status: response.status,
          message,
          details: typeof parsedBody === "object" && parsedBody !== null ? (parsedBody as Record<string, unknown>) : undefined,
          body: parsedBody,
        });
      }

      return parsedBody as T;
    } catch (error) {
      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      const shouldRetry =
        !isAbortError &&
        attempt < retries &&
        (!(error instanceof ApiError) || retryOnStatuses.includes(error.status));

      if (!shouldRetry) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError({
          status: (error as ApiError)?.status ?? 0,
          message: (error as Error)?.message ?? "Network request failed",
          body: lastError,
        });
      }

      attempt += 1;
      lastError = error;
      await sleep(retryDelayMs * attempt);
    }
  }

  throw lastError instanceof ApiError
    ? lastError
    : new ApiError({
        status: 0,
        message: (lastError as Error)?.message ?? "Request failed after retries",
      });
}
