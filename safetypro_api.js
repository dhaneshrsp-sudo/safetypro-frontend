/* ═══════════════════════════════════════════════════
   SafetyPro AI — API Service Layer
   Connects all frontend screens to the NestJS backend
   ═══════════════════════════════════════════════════ */

const API_BASE = 'https://distinguished-serenity-production-37d1.up.railway.app/api/v1';

/* ── TOKEN MANAGEMENT ── */
const Auth = {
  getToken: () => localStorage.getItem('sp_token'),
  setToken: (t) => localStorage.setItem('sp_token', t),
  getUser: () => JSON.parse(localStorage.getItem('sp_user') || '{}'),
  setUser: (u) => localStorage.setItem('sp_user', JSON.stringify(u)),
  isLoggedIn: () => !!localStorage.getItem('sp_token'),
  logout: () => {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
    window.location.href = 'safetypro_login.html';
  },
};

/* ── BASE FETCH ── */
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    Auth.logout();
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

/* ── AUTH API ── */
const AuthAPI = {
  login: (email, password, companyId) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, companyId }),
    }),
  me: () => apiFetch('/auth/me'),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

/* ── DASHBOARD API ── */
const DashboardAPI = {
  kpis: (projectId) =>
    apiFetch('/dashboard/kpis' + (projectId ? `?projectId=${projectId}` : '')),
  trends: (projectId) =>
    apiFetch('/dashboard/trends' + (projectId ? `?projectId=${projectId}` : '')),
  activity: () => apiFetch('/dashboard/activity'),
  accountability: () => apiFetch('/dashboard/accountability'),
  escalations: () => apiFetch('/dashboard/escalations'),
};

/* ── INCIDENTS API ── */
const IncidentsAPI = {
  create: (data) =>
    apiFetch('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  list: (projectId) =>
    apiFetch('/incidents' + (projectId ? `?projectId=${projectId}` : '')),
  get: (id) => apiFetch(`/incidents/${id}`),
  update: (id, data) =>
    apiFetch(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

/* ── NCR API ── */
const NcrAPI = {
  create: (data) =>
    apiFetch('/ncr', { method: 'POST', body: JSON.stringify(data) }),
  list: (projectId) =>
    apiFetch('/ncr' + (projectId ? `?projectId=${projectId}` : '')),
  get: (id) => apiFetch(`/ncr/${id}`),
  close: (id) => apiFetch(`/ncr/${id}/close`, { method: 'PATCH' }),
};

/* ── ACTIONS API ── */
const ActionsAPI = {
  list: (projectId, status) => {
    let q = [];
    if (projectId) q.push(`projectId=${projectId}`);
    if (status) q.push(`status=${status}`);
    return apiFetch('/actions' + (q.length ? '?' + q.join('&') : ''));
  },
  myActions: () => apiFetch('/actions/my-actions'),
  overdue: () => apiFetch('/actions/overdue'),
  get: (id) => apiFetch(`/actions/${id}`),
  update: (id, data) =>
    apiFetch(`/actions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  close: (id) => apiFetch(`/actions/${id}/close`, { method: 'PATCH' }),
};

/* ── USERS API ── */
const UsersAPI = {
  list: () => apiFetch('/users'),
};

/* ── GUARD — redirect to login if not authenticated ── */
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'safetypro_login.html';
  }
}

/* ── DISPLAY LOGGED IN USER IN NAV ── */
function renderNavUser() {
  const user = Auth.getUser();
  const el = document.getElementById('nav-user');
  if (el && user.name) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="Auth.logout()">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#22C55E,#16A34A);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#0B0E12">
          ${user.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
        </div>
        <div style="font-size:12px;color:var(--t2)">${user.name.split(' ')[0]}</div>
        <div style="font-size:10px;color:var(--t3)">↗</div>
      </div>`;
  }
}
