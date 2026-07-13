import { ExportImport, INVENTORY_MAX } from './lib/export-import';
import type { StorageLike } from './lib/export-import';

const SUPABASE_URL = 'https://hykklcvvwjwhcvukbzts.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hAcM5bQMkl9a0wn7tgzupg_DeSgYQZC';
const TABLE = 'app_cloud_saves';
const CLOUD_STORAGE_KEYS = new Set([
  'hellbound_hotel_db_state',
  'h_inv_bar',
  'h_inv_clean',
  'h_inv_food'
]);
const CLOUD_PAYLOAD_VERSION = 2;

function deriveAppKey(): string {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const source = hostname && hostname !== 'localhost'
    ? hostname
    : (typeof document !== 'undefined' ? document.title : 'hellbound_hotel_manager');
  return source.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'hellbound_hotel_manager';
}

const appKey = deriveAppKey();
const sessionKey = `${appKey}_supabase_session_v1`;

type CloudUser = { id?: string; email?: string };

type CloudSession = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user?: CloudUser;
} | null;

export type CloudPayload = {
  version?: number;
  appKey: string;
  capturedAt: string;
  entries: Record<string, string>;
};

type StatusTone = '' | 'ok' | 'bad';

let session: CloudSession = readSession();
let isOpen = false;
let isBusy = false;
let statusMessage = '';
let statusTone: StatusTone = '';
let sessionPersistenceWarning = false;

class SupabaseRequestError extends Error {
  public constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'SupabaseRequestError';
  }
}

function getBrowserStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function resolveStorage(storage?: StorageLike): StorageLike {
  if (storage) return storage;
  const browserStorage = getBrowserStorage();
  if (!browserStorage) throw new Error('Stockage local indisponible.');
  return browserStorage;
}

function readSession(): CloudSession {
  const storage = getBrowserStorage();
  if (!storage) return null;
  try {
    const parsed = JSON.parse(storage.getItem(sessionKey) || 'null') as CloudSession;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    try { storage.removeItem(sessionKey); } catch { /* Storage remains unavailable. */ }
    return null;
  }
}

function writeSession(next: CloudSession): boolean {
  session = next;
  const storage = getBrowserStorage();
  if (!storage) {
    sessionPersistenceWarning = Boolean(next);
    setStatus('Session active uniquement dans cet onglet : stockage local indisponible.', 'bad');
    renderCloudAccount();
    return false;
  }
  try {
    if (next) storage.setItem(sessionKey, JSON.stringify(next));
    else storage.removeItem(sessionKey);
  } catch {
    // A rotated refresh token must never leave a known-stale token on disk.
    try { storage.removeItem(sessionKey); } catch { /* Best effort only. */ }
    sessionPersistenceWarning = Boolean(next);
    setStatus('Session active uniquement dans cet onglet : impossible de la persister.', 'bad');
    renderCloudAccount();
    return false;
  }
  sessionPersistenceWarning = false;
  renderCloudAccount();
  return true;
}

export function buildSupabaseHeaders(headers: HeadersInit = {}, token: string | null = null): Headers {
  const next = new Headers(headers);
  next.set('apikey', SUPABASE_KEY);
  if (token) next.set('Authorization', `Bearer ${token}`);
  else next.delete('Authorization');
  return next;
}

async function supabaseFetch(path: string, options: RequestInit = {}, token: string | null = null) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: buildSupabaseHeaders(options.headers, token)
  });
  const responseText = response.status === 204 ? '' : await response.text();
  if (!response.ok) {
    let message = `Supabase ${response.status}`;
    try {
      const data = JSON.parse(responseText);
      message = data.error_description || data.msg || data.message || message;
    } catch {
      if (responseText) message = responseText;
    }
    throw new SupabaseRequestError(response.status, message);
  }
  return responseText ? JSON.parse(responseText) : null;
}

function normalizeSession(data: any, previous: CloudSession = session): CloudSession {
  const source = data?.session || data || {};
  const expiresAt = source.expires_at
    ?? (typeof source.expires_in === 'number' ? Math.floor(Date.now() / 1000) + source.expires_in : previous?.expires_at);
  return {
    access_token: source.access_token || previous?.access_token,
    refresh_token: source.refresh_token || previous?.refresh_token,
    expires_at: expiresAt,
    expires_in: source.expires_in,
    user: data?.user || source.user || previous?.user
  };
}

async function refreshSessionIfNeeded(force = false): Promise<CloudSession> {
  if (!session) return null;
  const now = Math.floor(Date.now() / 1000);
  const stillValid = Boolean(session.access_token)
    && typeof session.expires_at === 'number'
    && session.expires_at > now + 60;
  if (!force && stillValid) return session;
  if (!session.refresh_token) {
    writeSession(null);
    throw new Error('Session expiree. Reconnecte le compte cloud.');
  }

  let data: any;
  try {
    data = await supabaseFetch('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
  } catch (error) {
    if (error instanceof SupabaseRequestError && (error.status === 400 || error.status === 401)) writeSession(null);
    throw error;
  }
  const refreshed = normalizeSession(data, session);
  if (!refreshed?.access_token || !refreshed.user?.id) {
    writeSession(null);
    throw new Error('Impossible de renouveler la session cloud.');
  }
  writeSession(refreshed);
  return refreshed;
}

async function requireAuthenticatedSession() {
  const active = await refreshSessionIfNeeded();
  if (!active?.user?.id || !active.access_token) throw new Error('Compte non connecte.');
  return active;
}

async function authenticatedSupabaseFetch(path: string, options: RequestInit, active: NonNullable<CloudSession>) {
  try {
    return await supabaseFetch(path, options, active.access_token!);
  } catch (error) {
    if (!(error instanceof SupabaseRequestError) || error.status !== 401) throw error;
    const refreshed = await refreshSessionIfNeeded(true);
    if (!refreshed?.access_token) {
      throw new Error('Session expiree. Reconnecte le compte cloud.', { cause: error });
    }
    return supabaseFetch(path, options, refreshed.access_token);
  }
}

export function shouldCaptureKey(key: string, currentSessionKey = sessionKey) {
  return key !== currentSessionKey && CLOUD_STORAGE_KEYS.has(key);
}

export function captureSnapshot(storage?: StorageLike, currentAppKey = appKey): CloudPayload {
  const target = resolveStorage(storage);
  const entries: Record<string, string> = {};
  for (let index = 0; index < target.length; index += 1) {
    const key = target.key(index);
    if (!key || !shouldCaptureKey(key)) continue;
    const value = target.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return {
    version: CLOUD_PAYLOAD_VERSION,
    appKey: currentAppKey,
    capturedAt: new Date().toISOString(),
    entries
  };
}

function validateSnapshot(payload: CloudPayload, expectedAppKey: string) {
  if (!payload || typeof payload !== 'object' || !payload.entries || typeof payload.entries !== 'object' || Array.isArray(payload.entries)) {
    throw new Error('Sauvegarde cloud invalide.');
  }
  if (payload.appKey && payload.appKey !== expectedAppKey) {
    throw new Error('Cette sauvegarde appartient a une autre application.');
  }
  if (payload.version && payload.version > CLOUD_PAYLOAD_VERSION) {
    throw new Error('Cette sauvegarde cloud utilise une version plus recente.');
  }

  const databaseJson = payload.entries.hellbound_hotel_db_state;
  if (typeof databaseJson !== 'string') throw new Error('La sauvegarde cloud ne contient pas la base de donnees de l hotel.');
  const validation = ExportImport.validateBackup(databaseJson);
  if (!validation.isValid) throw new Error(`Base cloud invalide: ${validation.error}`);

  for (const [key, value] of Object.entries(payload.entries)) {
    if (!shouldCaptureKey(key)) throw new Error(`Cle cloud hors perimetre: '${key}'.`);
    if (typeof value !== 'string') throw new Error(`Valeur cloud invalide pour '${key}'.`);
    if (key.startsWith('h_inv_') && (!/^\d+$/.test(value) || Number(value) > INVENTORY_MAX)) {
      throw new Error(`Inventaire cloud invalide pour '${key}'.`);
    }
  }
}

/** Restores an exact application snapshot and rolls back every touched key on failure. */
export function restoreSnapshot(payload: CloudPayload, storage?: StorageLike, expectedAppKey = appKey) {
  const target = resolveStorage(storage);
  validateSnapshot(payload, expectedAppKey);

  const existingKeys: string[] = [];
  for (let index = 0; index < target.length; index += 1) {
    const key = target.key(index);
    if (key && shouldCaptureKey(key)) existingKeys.push(key);
  }
  const incomingEntries = Object.entries(payload.entries)
    .filter(([key, value]) => shouldCaptureKey(key) && typeof value === 'string') as Array<[string, string]>;
  const touchedKeys = new Set([...existingKeys, ...incomingEntries.map(([key]) => key)]);
  const previous = new Map(Array.from(touchedKeys).map(key => [key, target.getItem(key)]));

  try {
    existingKeys.forEach(key => target.removeItem(key));
    incomingEntries.forEach(([key, value]) => target.setItem(key, value));
  } catch (error) {
    try {
      previous.forEach((value, key) => {
        if (value === null) target.removeItem(key);
        else target.setItem(key, value);
      });
    } catch (rollbackError) {
      const initialMessage = error instanceof Error ? error.message : String(error);
      const rollbackMessage = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
      throw new Error(`Restauration cloud interrompue (${initialMessage}) et rollback incomplet: ${rollbackMessage}`, { cause: rollbackError });
    }
    throw error;
  }
}

async function signUp(email: string, password: string) {
  const normalizedEmail = email.trim();
  if (!normalizedEmail || password.length < 6) throw new Error('Saisis un e-mail valide et un mot de passe de 6 caracteres minimum.');
  const data = await supabaseFetch('/auth/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password })
  });
  const next = normalizeSession(data, null);
  writeSession(next?.access_token && next.user?.id ? next : null);
}

async function signIn(email: string, password: string) {
  const normalizedEmail = email.trim();
  if (!normalizedEmail || !password) throw new Error('Saisis ton e-mail et ton mot de passe.');
  const data = await supabaseFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password })
  });
  const next = normalizeSession(data, null);
  if (!next?.access_token || !next.user?.id) throw new Error('Connexion cloud incomplete.');
  writeSession(next);
}

async function signOut() {
  let logoutError: unknown = null;
  try {
    if (session?.refresh_token || session?.access_token) {
      const active = await refreshSessionIfNeeded();
      if (active?.access_token) await supabaseFetch('/auth/v1/logout', { method: 'POST' }, active.access_token);
    }
  } catch (error) {
    logoutError = error;
  } finally {
    writeSession(null);
  }
  if (logoutError) throw logoutError;
}

async function saveCloud() {
  const active = await requireAuthenticatedSession();
  const payload = captureSnapshot();
  validateSnapshot(payload, appKey);
  await authenticatedSupabaseFetch(`/rest/v1/${TABLE}?on_conflict=user_id,app_key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({ user_id: active.user!.id, app_key: appKey, payload })
  }, active);
}

async function loadCloud() {
  const active = await requireAuthenticatedSession();
  const rows = await authenticatedSupabaseFetch(
    `/rest/v1/${TABLE}?select=payload,updated_at&user_id=eq.${encodeURIComponent(active.user!.id!)}&app_key=eq.${encodeURIComponent(appKey)}&order=updated_at.desc&limit=1`,
    {},
    active
  );
  if (!rows?.[0]?.payload) throw new Error('Aucune sauvegarde cloud pour cette appli.');
  restoreSnapshot(rows[0].payload as CloudPayload);
  window.location.reload();
}

function setStatus(message: string, tone: StatusTone = '') {
  statusMessage = message;
  statusTone = tone;
  const status = typeof document !== 'undefined' ? document.querySelector<HTMLElement>('[data-cloud-status]') : null;
  if (status) {
    status.textContent = message;
    status.dataset.tone = tone;
  }
}

async function runCloudAction(action: () => Promise<void>, successMessage = 'Cloud synchronise.') {
  if (isBusy) return;
  isBusy = true;
  setStatus('Operation cloud en cours...');
  renderCloudAccount();
  try {
    await action();
    if (sessionPersistenceWarning && session) {
      setStatus('Operation reussie, mais la session restera limitee a cet onglet.', 'bad');
    } else {
      setStatus(successMessage, 'ok');
    }
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Erreur cloud.', 'bad');
  } finally {
    isBusy = false;
    renderCloudAccount();
  }
}

function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createButton(text: string, dataAttribute: string): HTMLButtonElement {
  const button = createElement('button', '', text);
  button.type = 'button';
  button.dataset[dataAttribute] = '';
  button.disabled = isBusy;
  return button;
}

function createLabeledInput(labelText: string, type: 'email' | 'password', dataAttribute: string, value = '') {
  const label = createElement('label', 'cloud-account-field');
  const text = createElement('span', 'cloud-account-label', labelText);
  const input = createElement('input');
  input.type = type;
  input.dataset[dataAttribute] = '';
  input.value = value;
  input.autocomplete = type === 'email' ? 'email' : 'current-password';
  input.disabled = isBusy;
  input.setAttribute('aria-label', labelText);
  label.append(text, input);
  return { label, input };
}

function renderCloudAccount() {
  if (typeof document === 'undefined') return;
  let root = document.getElementById('cloudAccountWidget');
  if (!root) {
    root = document.createElement('aside');
    root.id = 'cloudAccountWidget';
    root.setAttribute('aria-label', 'Compte et sauvegarde cloud');
    document.body.appendChild(root);
  }
  root.setAttribute('lang', 'fr');

  const connected = Boolean(session?.user?.email && session?.access_token);
  const style = createElement('style');
  style.textContent = `
    #cloudAccountWidget{position:fixed;right:14px;bottom:14px;z-index:99999;max-width:calc(100vw - 28px);font-family:Arial,sans-serif;color:#f8fbff}
    .cloud-account-toggle,.cloud-account-panel button{border:1px solid #6ee7ff;background:#071018;color:#fff;padding:8px 10px;border-radius:6px;font-weight:800;cursor:pointer;box-shadow:0 0 14px rgba(110,231,255,.18)}
    .cloud-account-panel{display:grid;gap:8px;width:280px;margin-top:8px;padding:12px;background:rgba(6,10,16,.96);border:1px solid #6ee7ff;border-radius:8px;box-shadow:0 18px 40px rgba(0,0,0,.5)}
    .cloud-account-panel[hidden]{display:none}.cloud-account-panel h3{margin:0;color:#6ee7ff;font-size:14px}.cloud-account-panel p{margin:0;color:#c9d5df;font-size:12px;line-height:1.35}
    .cloud-account-field{display:grid;gap:3px}.cloud-account-label{font-size:11px;color:#c9d5df}.cloud-account-panel input{width:100%;box-sizing:border-box;border:1px solid #2b4654;background:#020508;color:#fff;border-radius:4px;padding:8px}
    .cloud-account-row{display:grid;grid-template-columns:1fr 1fr;gap:6px}.cloud-account-status{min-height:16px;color:#c9d5df;font-size:11px}.cloud-account-status[data-tone=ok]{color:#77ffbb}.cloud-account-status[data-tone=bad]{color:#ff8c8c}
    .cloud-account-panel button:disabled,.cloud-account-panel input:disabled{opacity:.55;cursor:wait}
  `;

  const toggle = createElement('button', 'cloud-account-toggle', connected ? 'COMPTE: CLOUD' : 'COMPTE: LOCAL');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-controls', 'cloudAccountPanel');
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    renderCloudAccount();
    if (isOpen) document.querySelector<HTMLInputElement>('[data-cloud-email]')?.focus();
  });

  const panel = createElement('section', 'cloud-account-panel');
  panel.id = 'cloudAccountPanel';
  panel.hidden = !isOpen;
  panel.setAttribute('aria-busy', String(isBusy));
  panel.append(
    createElement('h3', '', document.title || appKey),
    createElement('p', '', connected ? session?.user?.email || '' : 'Connecte un compte pour garder ta progression entre tes appareils.')
  );

  const email = createLabeledInput('Adresse e-mail', 'email', 'cloudEmail', session?.user?.email || '');
  const password = createLabeledInput('Mot de passe', 'password', 'cloudPassword');
  panel.append(email.label, password.label);

  const authRow = createElement('div', 'cloud-account-row');
  const signInButton = createButton('Connexion', 'cloudSignin');
  const signUpButton = createButton('Creer', 'cloudSignup');
  authRow.append(signInButton, signUpButton);

  const syncRow = createElement('div', 'cloud-account-row');
  const saveButton = createButton('Sync cloud', 'cloudSave');
  const loadButton = createButton('Charger', 'cloudLoad');
  saveButton.disabled = loadButton.disabled = isBusy || !connected;
  syncRow.append(saveButton, loadButton);

  const logoutButton = createButton(connected ? 'Deconnexion' : 'Rester local', 'cloudLogout');
  const status = createElement('div', 'cloud-account-status', statusMessage);
  status.dataset.cloudStatus = '';
  status.dataset.tone = statusTone;
  status.setAttribute('role', statusTone === 'bad' ? 'alert' : 'status');
  status.setAttribute('aria-live', statusTone === 'bad' ? 'assertive' : 'polite');
  panel.append(authRow, syncRow, logoutButton, status);

  signInButton.addEventListener('click', () => void runCloudAction(() => signIn(email.input.value, password.input.value), 'Compte cloud connecte.'));
  signUpButton.addEventListener('click', () => void runCloudAction(() => signUp(email.input.value, password.input.value), 'Compte cree. Verifie ton e-mail si une confirmation est demandee.'));
  saveButton.addEventListener('click', () => void runCloudAction(saveCloud, 'Sauvegarde cloud mise a jour.'));
  loadButton.addEventListener('click', () => {
    const confirmed = window.confirm('Charger la sauvegarde cloud remplacera la progression locale de cette application. Continuer ?');
    if (!confirmed) {
      setStatus('Chargement cloud annule.');
      return;
    }
    void runCloudAction(loadCloud, 'Sauvegarde cloud chargee.');
  });
  logoutButton.addEventListener('click', () => void runCloudAction(signOut, 'Session cloud fermee.'));

  root.replaceChildren(style, toggle, panel);
}

async function initializeCloudAccount() {
  renderCloudAccount();
  if (session?.access_token || session?.refresh_token) {
    try {
      await refreshSessionIfNeeded();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Session cloud invalide.', 'bad');
    }
    renderCloudAccount();
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void initializeCloudAccount(), { once: true });
  else void initializeCloudAccount();
}
