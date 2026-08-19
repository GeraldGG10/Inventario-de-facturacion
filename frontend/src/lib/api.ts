const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const ACCESS_TOKEN_KEY = 'inventario.accessToken';
const REFRESH_TOKEN_KEY = 'inventario.refreshToken';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let refrescando: Promise<boolean> | null = null;

async function intentarRefrescar(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refrescando) {
    refrescando = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        setTokens(data.accessToken, data.refreshToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refrescando = null;
      });
  }
  return refrescando;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  isRetry?: boolean;
}

function construirUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(construirUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && !options.isRetry) {
    const refrescado = await intentarRefrescar();
    if (refrescado) {
      return apiFetch<T>(path, { ...options, isRetry: true });
    }
    clearTokens();
    window.location.assign('/login');
    throw new ApiError(401, 'Sesión expirada');
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const mensaje = typeof data === 'object' && data?.error ? (typeof data.error === 'string' ? data.error : 'Solicitud inválida') : 'Error de red';
    throw new ApiError(res.status, mensaje, data);
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string, query?: RequestOptions['query']) => apiFetch<T>(path, { query }),
  post: <T = any>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'POST', body }),
  patch: <T = any>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
};

/** Los enlaces normales no pueden llevar el header Authorization, así que
 * para PDFs/CSV protegidos se descarga con fetch y se abre como blob. */
export async function abrirArchivoConAuth(path: string, query?: RequestOptions['query']) {
  const token = getAccessToken();
  const res = await fetch(construirUrl(path, query), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new ApiError(res.status, 'No se pudo generar el archivo');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export { BASE_URL };
