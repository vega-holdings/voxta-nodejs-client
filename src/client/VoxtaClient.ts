import * as signalR from '@microsoft/signalr';

import { TypedEventEmitter } from '../utils/TypedEventEmitter.js';
import type {
  ClientAuthenticateMessage,
  ClientInterruptMessage,
  ClientLoadCharactersListMessage,
  ClientLoadChatsListMessage,
  ClientLoadScenariosListMessage,
  ClientPauseChatMessage,
  ClientRevertMessage,
  ClientResumeChatMessage,
  ClientRetryMessage,
  ClientSendMessage,
  ClientStartChatMessage,
  ClientStopChatMessage,
  ClientSubscribeToChatMessage,
  ClientUnsubscribeFromChatMessage,
  ClientUpdateContextMessage,
  ClientMessage,
  ClientMessageType,
  ServerCharactersListLoadedMessage,
  ServerChatsListLoadedMessage,
  ServerScenariosListLoadedMessage,
  ServerChatStartedMessage,
  ServerAuthenticationRequiredMessage,
  ServerErrorMessage,
  ServerMessage,
  ServerMessageOf,
  ServerMessageType,
  ServerWelcomeMessage,
} from '../protocol/messages.js';
import { isVoxtaServerMessage } from '../protocol/messages.js';
import type { ClientCapabilities, Guid } from '../protocol/shared.js';

export type AccessTokenFactory = () => Promise<string> | string;

export interface VoxtaClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  accessTokenFactory?: AccessTokenFactory;
  logLevel?: signalR.LogLevel;
  reconnect?: boolean;
  authenticate?: {
    client: string;
    clientVersion?: string;
    scope?: string[];
    capabilities?: ClientCapabilities;
  };
}

export interface WaitForMessageOptions<TMessage> {
  predicate?: (message: TMessage) => boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface VoxtaClientEvents {
  connected: () => void;
  disconnected: (error?: unknown) => void;
  reconnecting: (error?: unknown) => void;
  reconnected: (connectionId?: string) => void;
  message: (message: ServerMessage) => void;
}

export class VoxtaClient {
  protected readonly options: VoxtaClientOptions;
  private readonly emitter = new TypedEventEmitter<VoxtaClientEvents>();
  private connection: signalR.HubConnection | null = null;

  constructor(options: VoxtaClientOptions) {
    this.options = options;
  }

  on<TKey extends keyof VoxtaClientEvents>(event: TKey, listener: VoxtaClientEvents[TKey]): this {
    this.emitter.on(event, listener);
    return this;
  }

  once<TKey extends keyof VoxtaClientEvents>(event: TKey, listener: VoxtaClientEvents[TKey]): this {
    this.emitter.once(event, listener);
    return this;
  }

  off<TKey extends keyof VoxtaClientEvents>(event: TKey, listener: VoxtaClientEvents[TKey]): this {
    this.emitter.off(event, listener);
    return this;
  }

  get state(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  async connect(): Promise<void> {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected)
      return;

    const hubUrl = new URL('/hub', this.options.baseUrl).toString();
    const headers = this.options.headers ?? {};
    const accessTokenFactory = this.options.accessTokenFactory;

    const builder = new signalR.HubConnectionBuilder().withUrl(hubUrl, {
      headers,
      accessTokenFactory,
    });

    if (this.options.reconnect !== false) {
      builder.withAutomaticReconnect();
    }

    builder.configureLogging(this.options.logLevel ?? signalR.LogLevel.Information);

    const connection = builder.build();
    connection.on('ReceiveMessage', (message: unknown) => {
      if (!isVoxtaServerMessage(message)) return;
      this.emitter.emit('message', message);
    });

    connection.onclose((error) => this.emitter.emit('disconnected', error));
    connection.onreconnecting((error) => this.emitter.emit('reconnecting', error));
    connection.onreconnected((connectionId) =>
      this.emitter.emit('reconnected', connectionId ?? undefined),
    );

    this.connection = connection;
    await connection.start();
    this.emitter.emit('connected');
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    const connection = this.connection;
    this.connection = null;
    await connection.stop();
  }

  async send(message: ClientMessage): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(
        `Not connected (state: ${signalR.HubConnectionState[this.connection.state]})`,
      );
    }
    await this.connection.invoke('SendMessage', message);
  }

  async sendType<TType extends ClientMessageType>(
    type: TType,
    payload: Omit<Extract<ClientMessage, { $type: TType }>, '$type'>,
  ): Promise<void> {
    await this.send({ $type: type, ...(payload as any) } as ClientMessage);
  }

  onMessageType<TType extends ServerMessageType>(
    type: TType,
    handler: (message: ServerMessageOf<TType>) => void,
  ): () => void {
    const wrapper = (message: ServerMessage) => {
      if (message.$type !== type) return;
      handler(message as ServerMessageOf<TType>);
    };

    this.emitter.on('message', wrapper);
    return () => this.emitter.off('message', wrapper);
  }

  waitForMessage<TMessage extends ServerMessage>(
    options: WaitForMessageOptions<TMessage> = {},
  ): Promise<TMessage> {
    const { predicate, timeoutMs = 30_000, signal } = options;

    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason ?? new Error('Aborted'));
        return;
      }

      let timeout: ReturnType<typeof setTimeout> | undefined;
      const onAbort = () => cleanupAndReject(signal?.reason ?? new Error('Aborted'));

      const handler = (message: ServerMessage) => {
        const cast = message as TMessage;
        if (predicate && !predicate(cast)) return;
        cleanupAndResolve(cast);
      };

      const cleanup = () => {
        this.emitter.off('message', handler);
        if (timeout) clearTimeout(timeout);
        signal?.removeEventListener('abort', onAbort);
      };

      const cleanupAndResolve = (message: TMessage) => {
        cleanup();
        resolve(message);
      };

      const cleanupAndReject = (error: unknown) => {
        cleanup();
        reject(error);
      };

      this.emitter.on('message', handler);

      if (timeoutMs > 0) {
        timeout = setTimeout(
          () => cleanupAndReject(new Error('Timeout waiting for message')),
          timeoutMs,
        );
      }

      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  waitForMessageType<TType extends ServerMessageType>(
    type: TType,
    options: WaitForMessageOptions<ServerMessageOf<TType>> = {},
  ): Promise<ServerMessageOf<TType>> {
    return this.waitForMessage<ServerMessageOf<TType>>({
      ...options,
      predicate: (m) => m.$type === type && (options.predicate ? options.predicate(m) : true),
    });
  }

  async authenticate(
    overrides: Partial<Omit<ClientAuthenticateMessage, '$type'>> = {},
  ): Promise<ServerWelcomeMessage> {
    const defaults = this.options.authenticate;
    const client = overrides.client ?? defaults?.client;

    if (!client) {
      throw new Error(
        'No authenticate payload provided. Set `options.authenticate.client` in the constructor or pass `client` to authenticate().',
      );
    }

    const message: ClientAuthenticateMessage = {
      $type: 'authenticate',
      client,
      clientVersion: overrides.clientVersion ?? defaults?.clientVersion ?? null,
      scope: overrides.scope ?? defaults?.scope ?? ['role:app'],
      capabilities: overrides.capabilities ??
        defaults?.capabilities ?? {
          audioInput: 'None',
          audioOutput: 'Url',
          acceptedAudioContentTypes: ['audio/x-wav', 'audio/mpeg'],
          visionCapture: 'None',
        },
    };

    const responsePromise = this.waitForMessage<
      ServerWelcomeMessage | ServerAuthenticationRequiredMessage | ServerErrorMessage
    >({
      timeoutMs: 30_000,
      predicate: (m) =>
        m.$type === 'welcome' || m.$type === 'authenticationRequired' || m.$type === 'error',
    });

    await this.send(message);
    const response = await responsePromise;

    switch (response.$type) {
      case 'welcome':
        return response;
      case 'authenticationRequired':
        throw new Error(
          'Voxta server requires authentication/profile setup (authenticationRequired).',
        );
      case 'error':
        throw new Error(`Voxta server error: ${response.message}`);
      default:
        throw new Error('Unexpected response to authenticate().');
    }
  }

  async connectAndAuthenticate(): Promise<ServerWelcomeMessage> {
    await this.connect();
    return await this.authenticate();
  }

  async startChat(payload: Omit<ClientStartChatMessage, '$type'>): Promise<void> {
    await this.sendType('startChat', payload);
  }

  async startChatAndWait(
    payload: Omit<ClientStartChatMessage, '$type'>,
    options: WaitForMessageOptions<ServerChatStartedMessage> = {},
  ): Promise<ServerChatStartedMessage> {
    const startedPromise = this.waitForMessageType('chatStarted', {
      ...options,
      predicate: (m) => {
        if (payload.chatId && m.chatId !== payload.chatId) return false;
        return options.predicate ? options.predicate(m) : true;
      },
    });
    await this.startChat(payload);
    return await startedPromise;
  }

  async resumeChat(payload: Omit<ClientResumeChatMessage, '$type'>): Promise<void> {
    await this.sendType('resumeChat', payload);
  }

  async resumeChatAndWait(
    payload: Omit<ClientResumeChatMessage, '$type'>,
    options: WaitForMessageOptions<ServerChatStartedMessage> = {},
  ): Promise<ServerChatStartedMessage> {
    const startedPromise = this.waitForMessageType('chatStarted', {
      ...options,
      predicate: (m) => {
        if (m.chatId !== payload.chatId) return false;
        return options.predicate ? options.predicate(m) : true;
      },
    });
    await this.resumeChat(payload);
    return await startedPromise;
  }

  async pauseChat(payload: Omit<ClientPauseChatMessage, '$type'>): Promise<void> {
    await this.sendType('pauseChat', payload);
  }

  async sendChatMessage(payload: Omit<ClientSendMessage, '$type'>): Promise<void> {
    await this.sendType('send', payload);
  }

  async sendText(
    sessionId: Guid,
    text: string,
    options: Omit<
      Partial<Omit<ClientSendMessage, '$type' | 'sessionId' | 'text'>>,
      'sessionId'
    > = {},
  ): Promise<void> {
    await this.sendChatMessage({
      sessionId,
      text,
      ...options,
    });
  }

  async stopChat(payload: Omit<ClientStopChatMessage, '$type'> = {}): Promise<void> {
    await this.sendType('stopChat', payload);
  }

  async interrupt(payload: Omit<ClientInterruptMessage, '$type'>): Promise<void> {
    await this.sendType('interrupt', payload);
  }

  async retry(payload: Omit<ClientRetryMessage, '$type'>): Promise<void> {
    await this.sendType('retry', payload);
  }

  async revert(payload: Omit<ClientRevertMessage, '$type'>): Promise<void> {
    await this.sendType('revert', payload);
  }

  async updateContext(payload: Omit<ClientUpdateContextMessage, '$type'>): Promise<void> {
    await this.sendType('updateContext', payload);
  }

  async subscribeToChat(payload: Omit<ClientSubscribeToChatMessage, '$type'>): Promise<void> {
    await this.sendType('subscribeToChat', payload);
  }

  async unsubscribeFromChat(
    payload: Omit<ClientUnsubscribeFromChatMessage, '$type'>,
  ): Promise<void> {
    await this.sendType('unsubscribeFromChat', payload);
  }

  async loadCharactersList(
    payload: Omit<ClientLoadCharactersListMessage, '$type'> = {},
  ): Promise<void> {
    await this.sendType('loadCharactersList', payload);
  }

  async loadCharactersListAndWait(
    options: WaitForMessageOptions<ServerCharactersListLoadedMessage> = {},
  ): Promise<ServerCharactersListLoadedMessage> {
    const resultPromise = this.waitForMessageType('charactersListLoaded', options);
    await this.loadCharactersList();
    return await resultPromise;
  }

  async loadScenariosList(
    payload: Omit<ClientLoadScenariosListMessage, '$type'> = {},
  ): Promise<void> {
    await this.sendType('loadScenariosList', payload);
  }

  async loadScenariosListAndWait(
    options: WaitForMessageOptions<ServerScenariosListLoadedMessage> = {},
  ): Promise<ServerScenariosListLoadedMessage> {
    const resultPromise = this.waitForMessageType('scenariosListLoaded', options);
    await this.loadScenariosList();
    return await resultPromise;
  }

  async loadChatsList(payload: Omit<ClientLoadChatsListMessage, '$type'>): Promise<void> {
    await this.sendType('loadChatsList', payload);
  }

  async loadChatsListAndWait(
    payload: Omit<ClientLoadChatsListMessage, '$type'>,
    options: WaitForMessageOptions<ServerChatsListLoadedMessage> = {},
  ): Promise<ServerChatsListLoadedMessage> {
    const resultPromise = this.waitForMessageType('chatsListLoaded', options);
    await this.loadChatsList(payload);
    return await resultPromise;
  }
}
