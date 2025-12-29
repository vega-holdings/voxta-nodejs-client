import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { VoxtaClient } from '../../src/client/VoxtaClient.js';
import type {
  ServerWelcomeMessage,
  ServerChatStartedMessage,
  ServerReplyChunkMessage,
  ServerReplyEndMessage,
  CharactersListItem,
} from '../../src/index.js';

const VOXTA_URL = process.env.VOXTA_URL || 'https://voxta.local.vega.nyc/';
const TEST_TIMEOUT = 30000;

describe('VoxtaClient Integration', () => {
  let client: VoxtaClient;
  let welcome: ServerWelcomeMessage;

  beforeAll(async () => {
    client = new VoxtaClient({
      baseUrl: VOXTA_URL,
      authenticate: {
        client: 'voxta-nodejs-client-test',
        clientVersion: '0.1.0',
        capabilities: {
          audioInput: 'None',
          audioOutput: 'Url',
          acceptedAudioContentTypes: ['audio/x-wav', 'audio/mpeg'],
        },
      },
    });

    welcome = await client.connectAndAuthenticate();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await client.disconnect();
  });

  describe('Connection & Authentication', () => {
    it('should receive welcome message with user info', () => {
      expect(welcome.$type).toBe('welcome');
      expect(welcome.user).toBeDefined();
      expect(welcome.user.id).toBeDefined();
      expect(welcome.user.name).toBeDefined();
    });
  });

  describe('List Loading', () => {
    it('should load characters list', async () => {
      const characters = await client.loadCharactersListAndWait({
        timeoutMs: TEST_TIMEOUT,
      });

      expect(characters.$type).toBe('charactersListLoaded');
      expect(Array.isArray(characters.characters)).toBe(true);
    });

    it('should load scenarios list', async () => {
      const scenarios = await client.loadScenariosListAndWait({
        timeoutMs: TEST_TIMEOUT,
      });

      expect(scenarios.$type).toBe('scenariosListLoaded');
      expect(Array.isArray(scenarios.scenarios)).toBe(true);
    });
  });

  describe('Chat Flow', () => {
    let characters: CharactersListItem[];
    let chatSession: ServerChatStartedMessage;

    beforeEach(async () => {
      // Get available characters
      const charList = await client.loadCharactersListAndWait({
        timeoutMs: TEST_TIMEOUT,
      });
      characters = charList.characters;

      if (characters.length === 0) {
        throw new Error('No characters available for testing');
      }
    }, TEST_TIMEOUT);

    afterEach(async () => {
      // Clean up: stop the chat if it was started
      if (chatSession?.sessionId) {
        try {
          await client.stopChat({ sessionId: chatSession.sessionId });
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('should start a chat with a character', async () => {
      const character = characters[0];

      chatSession = await client.startChatAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      expect(chatSession.$type).toBe('chatStarted');
      expect(chatSession.sessionId).toBeDefined();
      expect(chatSession.chatId).toBeDefined();
      expect(chatSession.characters).toBeDefined();
      expect(chatSession.characters.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    it('should send a message and receive reply chunks', async () => {
      const character = characters[0];

      chatSession = await client.startChatAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      // Collect reply chunks
      const chunks: string[] = [];
      let replyEnded = false;

      const unsubChunk = client.onMessageType('replyChunk', (msg: ServerReplyChunkMessage) => {
        if (msg.sessionId === chatSession.sessionId) {
          chunks.push(msg.text);
        }
      });

      const replyEndPromise = client.waitForMessageType('replyEnd', {
        timeoutMs: TEST_TIMEOUT,
        predicate: (msg: ServerReplyEndMessage) => msg.sessionId === chatSession.sessionId,
      });

      // Send a simple message
      await client.sendText(chatSession.sessionId, 'Hello! How are you?');

      // Wait for reply to complete
      const replyEnd = await replyEndPromise;
      replyEnded = true;
      unsubChunk();

      expect(replyEnd.$type).toBe('replyEnd');
      expect(replyEnd.messageId).toBeDefined();
      // Should have received at least some chunks
      expect(chunks.length).toBeGreaterThan(0);

      // Full text should be non-empty
      const fullText = chunks.join('');
      expect(fullText.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    it('should receive replyEnd after sending message', async () => {
      const character = characters[0];

      chatSession = await client.startChatAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      // Wait for replyEnd which signals the response is complete
      const replyEndPromise = client.waitForMessageType('replyEnd', {
        timeoutMs: TEST_TIMEOUT,
        predicate: (msg) => msg.sessionId === chatSession.sessionId,
      });

      await client.sendText(chatSession.sessionId, 'Say hello in exactly 5 words.');

      const replyEnd = await replyEndPromise;

      expect(replyEnd.$type).toBe('replyEnd');
      expect(replyEnd.messageId).toBeDefined();
    }, TEST_TIMEOUT);

    it('should be able to call interrupt without error', async () => {
      const character = characters[0];

      chatSession = await client.startChatAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      // Send a message
      await client.sendText(chatSession.sessionId, 'Tell me a story.');

      // Small delay to let response start
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Interrupt should not throw
      await expect(client.interrupt({ sessionId: chatSession.sessionId })).resolves.not.toThrow();

      // Wait a bit for things to settle
      await new Promise((resolve) => setTimeout(resolve, 500));
    }, TEST_TIMEOUT);

    it('should update context during chat', async () => {
      const character = characters[0];

      chatSession = await client.startChatAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      // Listen for contextUpdated
      const contextPromise = client.waitForMessageType('contextUpdated', {
        timeoutMs: TEST_TIMEOUT,
        predicate: (msg) => msg.sessionId === chatSession.sessionId,
      });

      // Update context with custom information
      await client.updateContext({
        sessionId: chatSession.sessionId,
        contextKey: 'test-context',
        contexts: [
          {
            text: 'The user is testing the Voxta Node.js client.',
          },
        ],
      });

      const contextUpdated = await contextPromise;

      expect(contextUpdated.$type).toBe('contextUpdated');
      expect(contextUpdated.sessionId).toBe(chatSession.sessionId);
    }, TEST_TIMEOUT);

    it('should pause and resume chat', async () => {
      const character = characters[0];

      chatSession = await client.startChatAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      // Pause the chat
      const pausePromise = client.waitForMessageType('chatPaused', {
        timeoutMs: TEST_TIMEOUT,
        predicate: (msg) => msg.sessionId === chatSession.sessionId,
      });

      await client.pauseChat({ sessionId: chatSession.sessionId, pause: true });

      const paused = await pausePromise;
      expect(paused.$type).toBe('chatPaused');
      expect(paused.paused).toBe(true);

      // Resume the chat
      const resumePromise = client.waitForMessageType('chatPaused', {
        timeoutMs: TEST_TIMEOUT,
        predicate: (msg) => msg.sessionId === chatSession.sessionId,
      });

      await client.pauseChat({ sessionId: chatSession.sessionId, pause: false });

      const resumed = await resumePromise;
      expect(resumed.$type).toBe('chatPaused');
      expect(resumed.paused).toBe(false);
    }, TEST_TIMEOUT);

    it('should stop chat without error', async () => {
      const character = characters[0];

      chatSession = await client.startChatAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      // stopChat should complete without throwing
      await expect(client.stopChat({ sessionId: chatSession.sessionId })).resolves.not.toThrow();

      // Clear chatSession so afterEach doesn't try to stop it again
      chatSession = null as any;
    }, TEST_TIMEOUT);
  });

  describe('Chat with Chats List', () => {
    it('should load chats for a character', async () => {
      const charList = await client.loadCharactersListAndWait({
        timeoutMs: TEST_TIMEOUT,
      });

      if (charList.characters.length === 0) {
        console.log('Skipping: no characters available');
        return;
      }

      const character = charList.characters[0];

      const chatsList = await client.loadChatsListAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      expect(chatsList.$type).toBe('chatsListLoaded');
      expect(Array.isArray(chatsList.chats)).toBe(true);
    }, TEST_TIMEOUT);

    it('should resume an existing chat if available', async () => {
      const charList = await client.loadCharactersListAndWait({
        timeoutMs: TEST_TIMEOUT,
      });

      if (charList.characters.length === 0) {
        console.log('Skipping: no characters available');
        return;
      }

      const character = charList.characters[0];

      const chatsList = await client.loadChatsListAndWait(
        { characterId: character.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      if (chatsList.chats.length === 0) {
        console.log('Skipping: no existing chats to resume');
        return;
      }

      const existingChat = chatsList.chats[0];

      const resumed = await client.resumeChatAndWait(
        { chatId: existingChat.id },
        { timeoutMs: TEST_TIMEOUT },
      );

      expect(resumed.$type).toBe('chatStarted');
      expect(resumed.chatId).toBe(existingChat.id);

      // Clean up
      await client.stopChat({ sessionId: resumed.sessionId });
    }, TEST_TIMEOUT);
  });
});
