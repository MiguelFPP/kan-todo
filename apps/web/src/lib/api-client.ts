
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function normalizeHeaders(headersInit?: HeadersInit): Record<string, string> {
  if (!headersInit) return {};
  const headers = new Headers(headersInit);
  return Object.fromEntries(headers.entries());
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = normalizeHeaders(options.headers);

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: "include", // Essential for HttpOnly cookies
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}
