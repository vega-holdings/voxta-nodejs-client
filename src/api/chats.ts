import type { ChatMessage, ChatParticipantInfo, DependencyInfo, Guid } from '../protocol/shared.js';

async function fetchJson<T>(url: URL, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `Voxta API request failed (${response.status}): ${text || response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export interface ChatItemResponse {
  id: Guid;
  createdTimestamp: string;
  favorite: boolean;
  title?: string | null;
  created: string;
  lastSessionTimestamp?: string | null;
  lastSession?: string | null;
  characters: ChatParticipantInfo[];
  scenarioId?: Guid | null;
}

export interface ChatSummaryResponse {
  chatId: Guid;
  lastUpdated: string;
  lastMessages: ChatMessage[];
  lastSummary?: ChatMessage | null;
  scenario?: string | null;
}

export interface NewChatRequest {
  characters: Guid[];
  scenario?: Guid;
  roles?: Record<string, Guid>;
  client: string;
  ephemeral?: boolean;
  useChatMemory?: boolean;
  dependencies?: DependencyInfo[];
}

export interface VoxtaApiRequestOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface GetChatsOptions extends VoxtaApiRequestOptions {
  characterId?: Guid;
}

export async function getChats(options: GetChatsOptions): Promise<ChatItemResponse[]> {
  const { baseUrl, characterId, headers, signal } = options;

  const url = new URL('/api/chats', baseUrl);
  if (characterId) url.searchParams.set('characterId', characterId);

  const data = await fetchJson<{ chats?: ChatItemResponse[] | null }>(url, {
    method: 'GET',
    headers,
    signal,
  });

  return data.chats ?? [];
}

export interface GetChatSummaryOptions extends VoxtaApiRequestOptions {
  chatId: Guid;
}

export async function getChatSummary(options: GetChatSummaryOptions): Promise<ChatSummaryResponse> {
  const { baseUrl, chatId, headers, signal } = options;
  const url = new URL(`/api/chats/${chatId}/summary`, baseUrl);
  return await fetchJson<ChatSummaryResponse>(url, { method: 'GET', headers, signal });
}

export interface CreateChatOptions extends VoxtaApiRequestOptions {
  request: NewChatRequest;
}

export async function createChat(options: CreateChatOptions): Promise<ChatItemResponse> {
  const { baseUrl, request, headers, signal } = options;
  const url = new URL('/api/chats', baseUrl);

  return await fetchJson<ChatItemResponse>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: JSON.stringify(request),
    signal,
  });
}
