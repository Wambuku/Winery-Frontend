"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  deriveUserFromToken,
  getTokenExpiryIso,
  isTokenExpired,
} from "../lib/auth/jwt";

type AuthStatus = "initializing" | "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  claims?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO timestamp
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "staff" | "admin";
}

export interface RegisterResult {
  autoSignedIn: boolean;
  message?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  status: AuthStatus;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

interface RawTokenResponse {
  access?: string;
  refresh?: string;
  [key: string]: unknown;
}

interface InitialSessionState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  status: AuthStatus;
  hadStoredSession: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "auth.user";
const TOKEN_STORAGE_KEY = "auth.tokens";
const REFRESH_OFFSET_MS = 60_000; // attempt refresh 1 minute before expiry
const ACCESS_COOKIE_KEY = "auth.access";
const ROLES_COOKIE_KEY = "auth.roles";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://winery-backend.onrender.com").replace(/\/$/, "");
const TOKEN_ENDPOINT = "/api/token/";
const TOKEN_REFRESH_ENDPOINT = "/api/token/refresh/";
const REGISTER_ENDPOINT = "/api/register/";

function parseStored<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse stored auth value", error);
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  if (typeof document === "undefined") return;
  const base = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  const maxAge = typeof maxAgeSeconds === "number" ? `; Max-Age=${Math.max(0, maxAgeSeconds)}` : "";
  document.cookie = `${base}${maxAge}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax`;
}

function normalizePath(path: string): string {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function normalizeStoredTokens(storedTokens: AuthTokens | null): AuthTokens | null {
  if (!storedTokens?.accessToken || !storedTokens.refreshToken) {
    return null;
  }

  const expiresAt = storedTokens.expiresAt && !Number.isNaN(Date.parse(storedTokens.expiresAt))
    ? storedTokens.expiresAt
    : getTokenExpiryIso(storedTokens.accessToken);

  return {
    accessToken: storedTokens.accessToken,
    refreshToken: storedTokens.refreshToken,
    expiresAt,
  };
}

function isTokenValid(tokens: AuthTokens | null): tokens is AuthTokens {
  if (!tokens?.accessToken) return false;
  return !isTokenExpired(tokens.accessToken);
}

function buildTokensFromResponse(
  data: RawTokenResponse,
  fallbackRefresh?: string
): AuthTokens {
  const accessToken = typeof data.access === "string" ? data.access : "";
  const refreshTokenCandidate = typeof data.refresh === "string" ? data.refresh : fallbackRefresh;

  if (!accessToken) {
    throw new Error("Token response did not include an access token");
  }

  if (!refreshTokenCandidate) {
    throw new Error("Token response did not include a refresh token");
  }

  return {
    accessToken,
    refreshToken: refreshTokenCandidate,
    expiresAt: getTokenExpiryIso(accessToken),
  };
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const candidates = [record.detail, record.message, record.error];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
}

async function postJson<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.warn("Failed to parse JSON response", error);
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(parsed) ?? response.statusText ?? "Request failed";
    throw new Error(String(message));
  }

  if (parsed == null) {
    return {} as T;
  }

  return parsed as T;
}

async function requestTokens(credentials: LoginCredentials): Promise<AuthTokens> {
  const identifier = credentials.username ?? credentials.email ?? "";
  const payload = {
    // Some backends expect "username" while others accept "email"; send both to be compatible.
    email: credentials.email ?? identifier,
    username: identifier,
    password: credentials.password,
  };

  const data = await postJson<RawTokenResponse>(TOKEN_ENDPOINT, payload);
  return buildTokensFromResponse(data);
}

async function requestTokenRefresh(
  refreshToken: string,
  previousTokens: AuthTokens
): Promise<AuthTokens> {
  const data = await postJson<RawTokenResponse>(TOKEN_REFRESH_ENDPOINT, {
    refresh: refreshToken,
  });

  return buildTokensFromResponse(data, previousTokens.refreshToken);
}

type RegistrationResponse = RawTokenResponse & { message?: string };

async function requestRegistration(payload: RegisterPayload): Promise<RegistrationResponse> {
  return postJson<RegistrationResponse>(REGISTER_ENDPOINT, {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role ?? "customer",
  });
}

function getInitialSessionState(): InitialSessionState {
  if (typeof window === "undefined") {
    return {
      user: null,
      tokens: null,
      status: "initializing",
      hadStoredSession: false,
    };
  }

  const storedUser = parseStored<AuthUser>(localStorage.getItem(USER_STORAGE_KEY));
  const storedTokensRaw = parseStored<AuthTokens>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const normalizedTokens = normalizeStoredTokens(storedTokensRaw);
  const hasValidTokens = isTokenValid(normalizedTokens);
  const user = hasValidTokens
    ? storedUser ?? (normalizedTokens ? deriveUserFromToken(normalizedTokens.accessToken) : null)
    : null;

  return {
    user,
    tokens: hasValidTokens ? normalizedTokens : null,
    status: hasValidTokens ? "authenticated" : "unauthenticated",
    hadStoredSession: Boolean(storedUser || storedTokensRaw),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialState = useMemo(() => getInitialSessionState(), []);
  const [user, setUser] = useState<AuthUser | null>(initialState.user);
  const [tokens, setTokens] = useState<AuthTokens | null>(initialState.tokens);
  const [status, setStatus] = useState<AuthStatus>(initialState.status);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const persistSession = useCallback((nextUser: AuthUser, nextTokens: AuthTokens) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(nextTokens));
    const expiresAtMs = Date.parse(nextTokens.expiresAt);
    const maxAgeSeconds = Number.isNaN(expiresAtMs)
      ? undefined
      : Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
    setCookie(ACCESS_COOKIE_KEY, nextTokens.accessToken, maxAgeSeconds);
    setCookie(ROLES_COOKIE_KEY, nextUser.roles.join(","), maxAgeSeconds);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    deleteCookie(ACCESS_COOKIE_KEY);
    deleteCookie(ROLES_COOKIE_KEY);
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !initialState.hadStoredSession ||
      initialState.status === "authenticated"
    ) {
      return;
    }
    clearSession();
  }, [clearSession, initialState]);

  const applySession = useCallback(
    (nextTokens: AuthTokens) => {
      const nextUser = deriveUserFromToken(nextTokens.accessToken);
      setUser(nextUser);
      setTokens(nextTokens);
      setStatus("authenticated");
      setError(null);
      persistSession(nextUser, nextTokens);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearRefreshTimer();
    setUser(null);
    setTokens(null);
    setStatus("unauthenticated");
    setError(null);
    clearSession();
  }, [clearRefreshTimer, clearSession]);

  const refresh = useCallback(async () => {
    if (!tokens?.refreshToken) return;
    try {
      const refreshedTokens = await requestTokenRefresh(tokens.refreshToken, tokens);
      applySession(refreshedTokens);
    } catch (refreshError) {
      console.error("Failed to refresh token", refreshError);
      logout();
    }
  }, [applySession, logout, tokens]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setStatus("loading");
      setError(null);
      try {
        const nextTokens = await requestTokens(credentials);
        applySession(nextTokens);
      } catch (loginError) {
        const message =
          loginError instanceof Error ? loginError.message : "Unable to login";
        setError(message);
        setStatus("unauthenticated");
        clearRefreshTimer();
        throw loginError;
      }
    },
    [applySession, clearRefreshTimer]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResult> => {
      setStatus("loading");
      setError(null);
      try {
        const response = await requestRegistration(payload);
        const message =
          typeof response.message === "string" && response.message.trim().length > 0
            ? response.message
            : undefined;

        if (response.access || response.refresh) {
          const nextTokens = buildTokensFromResponse(response, response.refresh);
          applySession(nextTokens);
          return { autoSignedIn: true, message };
        }

        setStatus("unauthenticated");
        return { autoSignedIn: false, message };
      } catch (registerError) {
        const message =
          registerError instanceof Error ? registerError.message : "Unable to register";
        setError(message);
        setStatus("unauthenticated");
        clearRefreshTimer();
        throw registerError;
      }
    },
    [applySession, clearRefreshTimer]
  );

  useEffect(() => {
    if (!tokens) {
      clearRefreshTimer();
      return;
    }

    const expiresAt = Date.parse(tokens.expiresAt);
    if (Number.isNaN(expiresAt)) {
      clearRefreshTimer();
      return;
    }

    const now = Date.now();
    const delay = Math.max(expiresAt - now - REFRESH_OFFSET_MS, 5_000);
    clearRefreshTimer();
    refreshTimeoutRef.current = setTimeout(() => {
      void refresh();
    }, delay);

    return () => {
      clearRefreshTimer();
    };
  }, [tokens, refresh, clearRefreshTimer]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === USER_STORAGE_KEY || event.key === TOKEN_STORAGE_KEY) {
        const syncedTokensRaw = parseStored<AuthTokens>(localStorage.getItem(TOKEN_STORAGE_KEY));
        const normalizedTokens = normalizeStoredTokens(syncedTokensRaw);
        if (normalizedTokens && isTokenValid(normalizedTokens)) {
          applySession(normalizedTokens);
        } else {
          logout();
        }
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearRefreshTimer();
    };
  }, [applySession, clearRefreshTimer, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      status,
      error,
      isAuthenticated: status === "authenticated" && !!user && !!tokens,
      login,
      register,
      logout,
      refresh,
      setUser,
    }),
    [error, login, logout, refresh, register, status, tokens, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
