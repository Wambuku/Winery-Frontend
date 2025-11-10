export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);

  if (typeof atob === "function") {
    return atob(padded);
  }

  const nodeBuffer = (globalThis as Record<string, unknown>).Buffer as {
    from: (input: string, encoding: string) => { toString: (encoding: string) => string };
  } | undefined;
  if (typeof nodeBuffer !== "undefined") {
    return nodeBuffer.from(padded, "base64").toString("binary");
  }

  throw new Error("No base64 decoder available in this environment");
}

export function decodeJwt(token: string): DecodedJwt | null {
  if (!token || typeof token !== "string") return null;
  const segments = token.split(".");
  if (segments.length < 2) return null;

  try {
    const headerJson = decodeBase64Url(segments[0]);
    const payloadJson = decodeBase64Url(segments[1]);
    return {
      header: JSON.parse(headerJson) as Record<string, unknown>,
      payload: JSON.parse(payloadJson) as Record<string, unknown>,
    };
  } catch (error) {
    console.warn("Failed to decode JWT", error);
    return null;
  }
}

export function getTokenExpiryIso(token: string): string {
  const decoded = decodeJwt(token);
  const expSeconds = typeof decoded?.payload.exp === "number" ? decoded.payload.exp : null;
  const expiresAt = expSeconds ? new Date(expSeconds * 1000) : new Date(Date.now() + 15 * 60 * 1000);
  return expiresAt.toISOString();
}

export function getTokenRoles(token: string): string[] {
  const decoded = decodeJwt(token);
  const payload = decoded?.payload ?? {};
  const rawRoles = payload.roles ?? payload.role ?? payload.groups;
  if (Array.isArray(rawRoles)) {
    return rawRoles.map((role) => String(role)).filter((role) => role.trim().length > 0);
  }
  if (typeof rawRoles === "string" && rawRoles.trim().length > 0) {
    return [rawRoles.trim()];
  }
  if (rawRoles != null) {
    return [String(rawRoles)];
  }
  return [];
}

export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const expiresAt = getTokenExpiryIso(token);
  return Date.parse(expiresAt) <= Date.now();
}

export function deriveUserFromToken(token: string) {
  const decoded = decodeJwt(token);
  const payload = decoded?.payload ?? {};
  const emailClaim = payload.email ?? payload.username ?? payload.sub ?? "member@winery.app";
  const idCandidate = payload.user_id ?? payload.id ?? payload.sub ?? emailClaim;
  const nameCandidate =
    payload.name ??
    payload.full_name ??
    payload.display_name ??
    (typeof emailClaim === "string" ? emailClaim.split("@")[0] : "Member");

  return {
    id: String(idCandidate ?? "current-user"),
    name: String(nameCandidate ?? "Member"),
    email: String(emailClaim ?? "member@winery.app"),
    roles: (() => {
      const roles = getTokenRoles(token);
      return roles.length > 0 ? roles : ["customer"];
    })(),
    claims: payload,
  };
}
