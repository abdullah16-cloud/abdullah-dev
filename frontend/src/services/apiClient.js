import { ApiError } from './errors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Universal Frontend API Client.
 * Automatically attaches credentials: 'include' for secure httpOnly session cookies.
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch {
    throw new ApiError(
      'Unable to connect to server. Please check your network connection.',
      0,
      'NETWORK_ERROR'
    );
  }

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMessage = data?.error?.message || `Request failed with status ${res.status}`;
    const errorCode = data?.error?.code || 'HTTP_ERROR';
    const details = data?.error?.details || [];
    throw new ApiError(errorMessage, res.status, errorCode, details);
  }

  const result = data?.data !== undefined ? data.data : data;
  if (result && typeof result === 'object' && (data?.meta || data?.pagination)) {
    result.pagination = data.pagination || data.meta;
    result.meta = data.meta || data.pagination;
  }
  return result;
}

export const apiClient = {
  get(endpoint, options) {
    return request(endpoint, { method: 'GET', ...options });
  },

  post(endpoint, body, options) {
    return request(endpoint, { method: 'POST', body, ...options });
  },

  patch(endpoint, body, options) {
    return request(endpoint, { method: 'PATCH', body, ...options });
  },

  delete(endpoint, options) {
    return request(endpoint, { method: 'DELETE', ...options });
  },
};
