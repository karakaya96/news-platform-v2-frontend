'use client';

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = decodeJwtPayload(token);
    if (payload.exp && Number(payload.exp) * 1000 < Date.now()) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    removeToken();
    return false;
  }
}

export function getUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) return JSON.parse(cached);
    const token = getToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    const user: AdminUser = {
      id: String(payload.sub || payload.id || ''),
      name: String(payload.name || payload.email || 'Admin'),
      email: String(payload.email || ''),
      role: String(payload.role || 'admin') as 'admin' | 'editor',
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
}
