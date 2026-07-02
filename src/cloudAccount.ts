const SUPABASE_URL = 'https://hykklcvvwjwhcvukbzts.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hAcM5bQMkl9a0wn7tgzupg_DeSgYQZC';
const TABLE = 'app_cloud_saves';
const STORAGE_PREFIXES = ['jigsaw_', 'hellbound_', 'h_inv_', 'combine_', 'aeos_'];

const appKey = window.location.hostname && window.location.hostname !== 'localhost'
  ? window.location.hostname.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase()
  : (document.title || 'local_app').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
const sessionKey = `${appKey}_supabase_session_v1`;

type CloudSession = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user?: { id?: string; email?: string };
} | null;

type CloudPayload = {
  appKey: string;
  capturedAt: string;
  entries: Record<string, string | null>;
};

let session: CloudSession = readSession();
let isOpen = false;

function readSession(): CloudSession {
  try {
    return JSON.parse(localStorage.getItem(sessionKey) || 'null') as CloudSession;
  } catch {
    return null;
  }
}

function writeSession(next: CloudSession) {
  session = next;
  if (next) localStorage.setItem(sessionKey, JSON.stringify(next));
  else localStorage.removeItem(sessionKey);
  renderCloudAccount();
}

async function supabaseFetch(path: string, options: RequestInit = {}, token: string | null = null) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token || SUPABASE_KEY}`,
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    let message = `Supabase ${response.status}`;
    try {
      const data = await response.json();
      message = data.error_description || data.message || message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function normalizeSession(data: any): CloudSession {
  const source = data.session || data;
  return {
    access_token: source?.access_token,
    refresh_token: source?.refresh_token,
    expires_at: source?.expires_at,
    user: data.user || source?.user
  };
}

function shouldCaptureKey(key: string) {
  return key !== sessionKey && STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function captureSnapshot(): CloudPayload {
  const entries: Record<string, string | null> = {};
  Object.keys(localStorage).forEach((key) => {
    if (shouldCaptureKey(key)) entries[key] = localStorage.getItem(key);
  });
  return { appKey, capturedAt: new Date().toISOString(), entries };
}

function restoreSnapshot(payload: CloudPayload) {
  if (!payload?.entries || typeof payload.entries !== 'object') throw new Error('Sauvegarde cloud invalide.');
  Object.entries(payload.entries).forEach(([key, value]) => {
    if (shouldCaptureKey(key) && typeof value === 'string') localStorage.setItem(key, value);
  });
}

async function signUp(email: string, password: string) {
  const data = await supabaseFetch('/auth/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  writeSession(normalizeSession(data));
}

async function signIn(email: string, password: string) {
  const data = await supabaseFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  writeSession(normalizeSession(data));
}

async function saveCloud() {
  if (!session?.user?.id || !session?.access_token) throw new Error('Compte non connecte.');
  await supabaseFetch(`/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: session.user.id, app_key: appKey, payload: captureSnapshot() })
  }, session.access_token);
}

async function loadCloud() {
  if (!session?.user?.id || !session?.access_token) throw new Error('Compte non connecte.');
  const rows = await supabaseFetch(`/rest/v1/${TABLE}?select=payload,updated_at&user_id=eq.${encodeURIComponent(session.user.id)}&app_key=eq.${encodeURIComponent(appKey)}&limit=1`, {}, session.access_token);
  if (!rows?.[0]?.payload) throw new Error('Aucune sauvegarde cloud pour cette appli.');
  restoreSnapshot(rows[0].payload as CloudPayload);
  window.location.reload();
}

function setStatus(message: string, tone = '') {
  const el = document.querySelector<HTMLElement>('[data-cloud-status]');
  if (el) {
    el.textContent = message;
    el.dataset.tone = tone;
  }
}

async function runCloudAction(action: () => Promise<void>) {
  try {
    setStatus('Operation cloud en cours...');
    await action();
    setStatus('Cloud synchronise.', 'ok');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Erreur cloud.', 'bad');
  }
}

function renderCloudAccount() {
  let root = document.getElementById('cloudAccountWidget');
  if (!root) {
    root = document.createElement('div');
    root.id = 'cloudAccountWidget';
    document.body.appendChild(root);
  }
  const connected = Boolean(session?.user?.email);
  root.innerHTML = `
    <style>
      #cloudAccountWidget{position:fixed;right:14px;top:14px;z-index:99999;font-family:Inter,Arial,sans-serif;color:#f8fbff}
      .cloud-account-toggle,.cloud-account-panel button{border:1px solid #6ee7ff;background:#071018;color:#fff;padding:8px 10px;border-radius:6px;font-weight:800;cursor:pointer;box-shadow:0 0 14px rgba(110,231,255,.18)}
      .cloud-account-panel{display:${isOpen ? 'grid' : 'none'};gap:8px;width:280px;margin-top:8px;padding:12px;background:rgba(6,10,16,.96);border:1px solid #6ee7ff;border-radius:8px;box-shadow:0 18px 40px rgba(0,0,0,.5)}
      .cloud-account-panel h3{margin:0;color:#6ee7ff;font-size:14px}.cloud-account-panel p{margin:0;color:#c9d5df;font-size:12px;line-height:1.35}
      .cloud-account-panel input{width:100%;box-sizing:border-box;border:1px solid #2b4654;background:#020508;color:#fff;border-radius:4px;padding:8px}
      .cloud-account-row{display:grid;grid-template-columns:1fr 1fr;gap:6px}.cloud-account-status{min-height:16px;color:#c9d5df;font-size:11px}.cloud-account-status[data-tone=ok]{color:#77ffbb}.cloud-account-status[data-tone=bad]{color:#ff8c8c}
    </style>
    <button class="cloud-account-toggle">${connected ? 'COMPTE: CLOUD' : 'COMPTE: LOCAL'}</button>
    <div class="cloud-account-panel">
      <h3>${document.title || appKey}</h3>
      <p>${connected ? session?.user?.email : 'Connecte un compte pour garder ta progression entre tes appareils.'}</p>
      <input data-cloud-email type="email" placeholder="email" value="${session?.user?.email || ''}">
      <input data-cloud-password type="password" placeholder="mot de passe">
      <div class="cloud-account-row"><button data-cloud-signin>Connexion</button><button data-cloud-signup>Creer</button></div>
      <div class="cloud-account-row"><button data-cloud-save>Sync cloud</button><button data-cloud-load>Charger</button></div>
      <button data-cloud-logout>${connected ? 'Deconnexion' : 'Rester local'}</button>
      <div class="cloud-account-status" data-cloud-status></div>
    </div>
  `;
  root.querySelector('.cloud-account-toggle')?.addEventListener('click', () => { isOpen = !isOpen; renderCloudAccount(); });
  root.querySelector('[data-cloud-signin]')?.addEventListener('click', () => runCloudAction(() => signIn((root.querySelector('[data-cloud-email]') as HTMLInputElement).value, (root.querySelector('[data-cloud-password]') as HTMLInputElement).value)));
  root.querySelector('[data-cloud-signup]')?.addEventListener('click', () => runCloudAction(() => signUp((root.querySelector('[data-cloud-email]') as HTMLInputElement).value, (root.querySelector('[data-cloud-password]') as HTMLInputElement).value)));
  root.querySelector('[data-cloud-save]')?.addEventListener('click', () => runCloudAction(saveCloud));
  root.querySelector('[data-cloud-load]')?.addEventListener('click', () => runCloudAction(loadCloud));
  root.querySelector('[data-cloud-logout]')?.addEventListener('click', () => writeSession(null));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCloudAccount);
else renderCloudAccount();
