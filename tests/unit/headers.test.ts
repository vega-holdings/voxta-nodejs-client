import { describe, it, expect } from 'vitest';
import {
  normalizeBearerToken,
  createBearerHeaders,
  createBasicHeaders,
} from '../../src/auth/headers.js';

describe('normalizeBearerToken', () => {
  it('should add Bearer prefix if missing', () => {
    expect(normalizeBearerToken('abc123')).toBe('Bearer abc123');
  });

  it('should not duplicate Bearer prefix', () => {
    expect(normalizeBearerToken('Bearer abc123')).toBe('Bearer abc123');
  });

  it('should handle case-insensitive Bearer prefix', () => {
    expect(normalizeBearerToken('bearer abc123')).toBe('bearer abc123');
  });

  it('should strip surrounding double quotes', () => {
    expect(normalizeBearerToken('"abc123"')).toBe('Bearer abc123');
  });

  it('should strip surrounding single quotes', () => {
    expect(normalizeBearerToken("'abc123'")).toBe('Bearer abc123');
  });

  it('should handle quoted Bearer token', () => {
    expect(normalizeBearerToken('"Bearer abc123"')).toBe('Bearer abc123');
  });
});

describe('createBearerHeaders', () => {
  it('should create Authorization header with Bearer token', () => {
    const headers = createBearerHeaders('mytoken');
    expect(headers).toEqual({ Authorization: 'Bearer mytoken' });
  });

  it('should not duplicate Bearer prefix', () => {
    const headers = createBearerHeaders('Bearer mytoken');
    expect(headers).toEqual({ Authorization: 'Bearer mytoken' });
  });
});

describe('createBasicHeaders', () => {
  it('should create Authorization header with Basic auth', () => {
    const headers = createBasicHeaders('user', 'password');
    // base64('user:password') = 'dXNlcjpwYXNzd29yZA=='
    expect(headers).toEqual({ Authorization: 'Basic dXNlcjpwYXNzd29yZA==' });
  });

  it('should handle empty password', () => {
    const headers = createBasicHeaders('user', '');
    // base64('user:') = 'dXNlcjo='
    expect(headers).toEqual({ Authorization: 'Basic dXNlcjo=' });
  });

  it('should handle special characters', () => {
    const headers = createBasicHeaders('admin', 'p@ss:word!');
    // base64('admin:p@ss:word!') = 'YWRtaW46cEBzczp3b3JkIQ=='
    expect(headers).toEqual({ Authorization: 'Basic YWRtaW46cEBzczp3b3JkIQ==' });
  });
});
