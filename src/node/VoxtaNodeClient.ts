import type { VoxtaClientOptions } from '../client/VoxtaClient.js';
import { VoxtaClient } from '../client/VoxtaClient.js';
import type { Guid } from '../protocol/shared.js';

import type { VoxtaAudioInputWebSocketOptions } from './audioInput.js';
import { VoxtaAudioInputWebSocket } from './audioInput.js';

export class VoxtaNodeClient extends VoxtaClient {
  constructor(options: VoxtaClientOptions) {
    super(options);
  }

  createAudioInputWebSocket(
    sessionId: Guid,
    options: Omit<VoxtaAudioInputWebSocketOptions, 'baseUrl' | 'sessionId'> = {},
  ): VoxtaAudioInputWebSocket {
    const { specifications, headers, accessToken } = options;
    return new VoxtaAudioInputWebSocket({
      baseUrl: this.options.baseUrl,
      sessionId,
      specifications,
      headers: { ...(this.options.headers ?? {}), ...(headers ?? {}) },
      accessToken: accessToken ?? this.options.accessTokenFactory,
    });
  }
}
