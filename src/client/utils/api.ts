const BASE = '/api/x_1119723_1mdataan/analyzer'

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-UserToken': (window as any).g_ck ?? '',
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = data && (data as any).error ? (data as any).error : res.statusText
    throw new Error(typeof err === 'string' ? err : (err.message || 'Request failed'))
  }
  const unwrapped = data && typeof data === 'object' && 'result' in (data as any) ? (data as any).result : data
  return unwrapped as T
}
