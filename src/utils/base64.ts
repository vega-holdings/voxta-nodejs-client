export function base64EncodeUtf8(input: string): string {
  const maybeBuffer = (globalThis as any).Buffer as
    | { from(input: string, encoding?: string): { toString(encoding: string): string } }
    | undefined;

  if (maybeBuffer?.from) {
    return maybeBuffer.from(input, 'utf8').toString('base64');
  }

  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  if (typeof btoa !== 'function') {
    throw new Error('base64EncodeUtf8 requires Buffer (Node) or btoa (browser)');
  }

  return btoa(binary);
}
