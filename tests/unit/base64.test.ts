import { describe, it, expect } from 'vitest';
import { base64EncodeUtf8 } from '../../src/utils/base64.js';

describe('base64EncodeUtf8', () => {
  it('should encode simple ASCII string', () => {
    expect(base64EncodeUtf8('hello')).toBe('aGVsbG8=');
  });

  it('should encode empty string', () => {
    expect(base64EncodeUtf8('')).toBe('');
  });

  it('should encode string with special characters', () => {
    expect(base64EncodeUtf8('user:password')).toBe('dXNlcjpwYXNzd29yZA==');
  });

  it('should encode UTF-8 characters', () => {
    // "Hello" in Japanese
    expect(base64EncodeUtf8('こんにちは')).toBe('44GT44KT44Gr44Gh44Gv');
  });

  it('should encode mixed ASCII and UTF-8', () => {
    expect(base64EncodeUtf8('Hello, 世界!')).toBe('SGVsbG8sIOS4lueVjCE=');
  });
});
