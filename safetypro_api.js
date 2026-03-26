/* ═══════════════════════════════════════════════════
   SafetyPro AI — API Service Layer  v2.1 (fixed)
   Connects all frontend screens to the NestJS backend
   ═══════════════════════════════════════════════════ */

// ── SINGLE SOURCE OF TRUTH for API URL ──
// Change only this one constant when Railway URL changes
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
  let res;
  try {
    res = await fetch(API_BASE + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (networkErr) {
    // Network failure (no internet, Railway down, CORS)
    throw new Error('Network error — check your connection or the server may be down.');
  }

  if (res.status === 401) {
    Auth.logout();
    return null; // caller should guard with if(!data) return;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid response from server (not JSON).');
  }

  if (!res.ok) {
    // Normalize NestJS error shapes: { message: string | string[] }
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : (data.message || `Server error ${res.status}`);
    throw new Error(msg);
  }
  return data;
}

/* ── AUTH API ── */
const AuthAPI = {
  login: (email, password, companyId) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, companyId }),
    }),
  // NOTE: backend exposes /auth/me (NOT /auth/profile)
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

/* ── PROJECTS API ── */
const ProjectsAPI = {
  list: () => apiFetch('/projects'),
};

/* ── GUARD — redirect to login if not authenticated ── */
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'safetypro_login.html';
    return false;
  }
  return true;
}

/* ── DISPLAY LOGGED IN USER IN NAV ── */
async function renderNavUser() {
  // First use cache for instant display
  const cached = Auth.getUser();
  if (cached && cached.name) _applyNavUser(cached);

  // Then refresh from API using the correct /auth/me endpoint
  try {
    const user = await AuthAPI.me();
    if (user && user.name) {
      Auth.setUser(user);
      _applyNavUser(user);
    }
  } catch (e) {
    console.warn('Nav user refresh failed:', e.message);
    // Keep showing cached data — don't redirect on network errors
  }
}

function _applyNavUser(user) {
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
