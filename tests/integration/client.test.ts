import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { VoxtaClient } from '../../src/client/VoxtaClient.js';

const VOXTA_URL = process.env.VOXTA_URL || 'https://voxta.local.vega.nyc/';

describe('VoxtaClient Integration', () => {
  let client: VoxtaClient;

  beforeAll(() => {
    client = new VoxtaClient({
      baseUrl: VOXTA_URL,
      authenticate: {
        client: 'voxta-nodejs-client-test',
        clientVersion: '0.1.0',
      },
    });
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it('should connect and authenticate', async () => {
    const welcome = await client.connectAndAuthenticate();

    expect(welcome.$type).toBe('welcome');
    expect(welcome.user).toBeDefined();
  });

  it('should load characters list', async () => {
    const characters = await client.loadCharactersListAndWait({
      timeoutMs: 10000,
    });

    expect(characters.$type).toBe('charactersListLoaded');
    expect(Array.isArray(characters.characters)).toBe(true);
  });

  it('should load scenarios list', async () => {
    const scenarios = await client.loadScenariosListAndWait({
      timeoutMs: 10000,
    });

    expect(scenarios.$type).toBe('scenariosListLoaded');
    expect(Array.isArray(scenarios.scenarios)).toBe(true);
  });
});
