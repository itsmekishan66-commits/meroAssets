import { getSessionToken } from '../shared/utils/session.js';

const BASE_URL = '/api';

// Error thrown for any non-2xx response. Exposes `response.status` and
// `response.data.error` so call sites stay simple and unchanged.
export class ApiError extends Error {
  constructor(message, response) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
  }
}

async function request(method, path, body) {
  const headers = { 'x-meroassets-client': 'true' };

  const token = getSessionToken();
  if (token) headers['x-session-token'] = token;

  const init = { method, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, init);

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    throw new ApiError(message, { status: res.status, data });
  }

  return { data, status: res.status };
}

// Minimal request surface used by the feature API services.
const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;
