const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('privascan_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('privascan_token', token);
  } else {
    localStorage.removeItem('privascan_token');
  }
}

export function getUser() {
  const u = localStorage.getItem('privascan_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('privascan_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('privascan_user');
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Identifiers
  listIdentifiers: () => request('/identifiers'),
  addIdentifier: (body) => request('/identifiers', { method: 'POST', body: JSON.stringify(body) }),
  deleteIdentifier: (id) => request(`/identifiers/${id}`, { method: 'DELETE' }),

  // Scans
  startScan: (body) => request('/scans', { method: 'POST', body: JSON.stringify(body) }),
  listScans: () => request('/scans'),
  getScanFindings: (scanId) => request(`/scans/${scanId}/findings`),

  // Removals
  createRemoval: (body) => request('/removals', { method: 'POST', body: JSON.stringify(body) }),
  listRemovals: () => request('/removals'),
  updateRemovalStatus: (id, body) => request(`/removals/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  getRemovalHistory: (id) => request(`/removals/${id}/history`),

  // Consent
  grantConsent: (body) => request('/consent', { method: 'POST', body: JSON.stringify(body) }),
  listConsents: () => request('/consent'),
  revokeConsent: (id) => request(`/consent/${id}/revoke`, { method: 'POST' }),

  // Stats & Brokers
  getSummary: () => request('/stats/summary'),
  listBrokers: (region) => request(`/stats/brokers${region ? `?region=${region}` : ''}`),
  exportData: () => request('/stats/export'),
  purgeAccount: () => request('/stats/account', { method: 'DELETE' }),
  getHealth: () => request('/health')
};
