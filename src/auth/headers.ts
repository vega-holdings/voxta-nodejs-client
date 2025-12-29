import { base64EncodeUtf8 } from '../utils/base64.js';

function stripOuterQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function normalizeBearerToken(token: string): string {
  const cleaned = stripOuterQuotes(token);
  if (/^Bearer\\s+/i.test(cleaned)) return cleaned;
  return `Bearer ${cleaned}`;
}

export function createBearerHeaders(token: string): Record<string, string> {
  return { Authorization: normalizeBearerToken(token) };
}

export function createBasicHeaders(username: string, password: string): Record<string, string> {
  const basicAuth = base64EncodeUtf8(`${username}:${password}`);
  return { Authorization: `Basic ${basicAuth}` };
}
