import WebSocket from 'ws';

import { normalizeBearerToken } from '../auth/headers.js';
import type { AudioInputSpecifications, Guid } from '../protocol/shared.js';

export type AudioInputContentType = 'audio/wav' | 'audio/x-wav' | 'audio/pcm';

export type AudioInputAccessToken = string | (() => Promise<string> | string);

export interface VoxtaAudioInputWebSocketOptions {
  baseUrl: string;
  sessionId: Guid;
  specifications?: AudioInputSpecifications;
  headers?: Record<string, string>;
  accessToken?: AudioInputAccessToken;
}

export function defaultAudioInputSpecifications(): AudioInputSpecifications {
  return {
    contentType: 'audio/wav',
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    bufferMilliseconds: 30,
  };
}

export class VoxtaAudioInputWebSocket {
  private readonly options: VoxtaAudioInputWebSocketOptions;
  private socket: WebSocket | null = null;

  constructor(options: VoxtaAudioInputWebSocketOptions) {
    this.options = options;
  }

  get readyState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  async connect(): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const specs = this.options.specifications ?? defaultAudioInputSpecifications();

    const url = new URL('/ws/audio/input/stream', this.options.baseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.searchParams.set('sessionId', this.options.sessionId);

    const headers: Record<string, string> = { ...(this.options.headers ?? {}) };

    const tokenOrFactory = this.options.accessToken;
    if (tokenOrFactory) {
      const token = typeof tokenOrFactory === 'string' ? tokenOrFactory : await tokenOrFactory();
      headers.Authorization = normalizeBearerToken(token);
    }

    const ws = new WebSocket(url, { headers });
    this.socket = ws;

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => cleanupAndResolve();
      const onError = (err: Error) => cleanupAndReject(err);

      const cleanupAndResolve = () => {
        cleanup();
        resolve();
      };

      const cleanupAndReject = (err: Error) => {
        cleanup();
        reject(err);
      };

      const cleanup = () => {
        ws.off('open', onOpen);
        ws.off('error', onError);
      };

      ws.on('open', onOpen);
      ws.on('error', onError);
    });

    ws.send(JSON.stringify(specs), { binary: false });
  }

  sendAudio(data: Uint8Array | ArrayBuffer): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Audio input WebSocket is not connected');
    }
    this.socket.send(data);
  }

  async close(): Promise<void> {
    if (!this.socket) return;
    const ws = this.socket;
    this.socket = null;

    if (ws.readyState === WebSocket.CLOSED) return;

    await new Promise<void>((resolve) => {
      ws.once('close', () => resolve());
      ws.close();
    });
  }
}
