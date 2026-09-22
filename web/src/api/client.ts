export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const AUTH_TOKEN_KEY = "sls_auth_token";

// Render's free/starter instances can take 15-30s to wake from idle, so a
// slow first request is normal, not broken - give it real time and a few
// retries before giving up.
const REQUEST_TIMEOUT_MS = 20_000;
const RETRY_DELAYS_MS = [1000, 3000, 6000];

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Only idempotent GETs are safe to retry automatically - a retried POST
  // (checkout, register, ...) could double-submit if the first attempt
  // actually went through server-side before the response was lost.
  const maxAttempts = method === "GET" ? RETRY_DELAYS_MS.length + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const isLastAttempt = attempt === maxAttempts - 1;

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status >= 500 && !isLastAttempt) continue;
        const detail = await response.json().catch(() => ({ detail: response.statusText }));
        throw new ApiError(response.status, detail.detail ?? "Request failed");
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // Network error or timeout (AbortError) - retry GETs, otherwise surface it.
      if (!isLastAttempt) continue;
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Unreachable - the loop above always returns or throws - but keeps
  // the return type honest for TypeScript.
  throw new ApiError(0, "Request failed");
}
