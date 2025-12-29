import { describe, it, expect } from 'vitest';
import { parseVoxtaUrl } from '../../src/utils/voxtaUrl.js';

describe('parseVoxtaUrl', () => {
  it('should parse simple URL without auth', () => {
    const result = parseVoxtaUrl('http://localhost:5384');
    expect(result).toEqual({
      baseUrl: 'http://localhost:5384',
      headers: {},
    });
  });

  it('should parse HTTPS URL', () => {
    const result = parseVoxtaUrl('https://voxta.example.com');
    expect(result).toEqual({
      baseUrl: 'https://voxta.example.com',
      headers: {},
    });
  });

  it('should parse URL with port', () => {
    const result = parseVoxtaUrl('http://192.168.1.100:5384');
    expect(result).toEqual({
      baseUrl: 'http://192.168.1.100:5384',
      headers: {},
    });
  });

  it('should parse URL with basic auth credentials', () => {
    const result = parseVoxtaUrl('http://user:password@localhost:5384');
    expect(result).toEqual({
      baseUrl: 'http://localhost:5384',
      headers: {
        Authorization: 'Basic dXNlcjpwYXNzd29yZA==',
      },
    });
  });

  it('should parse URL with URL-encoded credentials', () => {
    const result = parseVoxtaUrl('http://user%40domain:p%40ssword@localhost:5384');
    expect(result).toEqual({
      baseUrl: 'http://localhost:5384',
      headers: {
        Authorization: 'Basic dXNlckBkb21haW46cEBzc3dvcmQ=',
      },
    });
  });

  it('should parse URL with only username (no password)', () => {
    const result = parseVoxtaUrl('http://apikey@localhost:5384');
    expect(result).toEqual({
      baseUrl: 'http://localhost:5384',
      headers: {
        Authorization: 'Basic YXBpa2V5Og==',
      },
    });
  });

  it('should strip path from base URL', () => {
    const result = parseVoxtaUrl('http://localhost:5384/hub');
    expect(result).toEqual({
      baseUrl: 'http://localhost:5384',
      headers: {},
    });
  });
});
