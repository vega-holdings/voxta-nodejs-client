import { base64EncodeUtf8 } from './base64.js';

export interface ParsedVoxtaUrl {
  baseUrl: string;
  headers: Record<string, string>;
}

export function parseVoxtaUrl(url: string): ParsedVoxtaUrl {
  const parsed = new URL(url);

  const baseUrl = `${parsed.protocol}//${parsed.host}`;
  const headers: Record<string, string> = {};

  if (parsed.username || parsed.password) {
    const username = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);
    const basicAuth = base64EncodeUtf8(`${username}:${password}`);
    headers.Authorization = `Basic ${basicAuth}`;
  }

  return { baseUrl, headers };
}
