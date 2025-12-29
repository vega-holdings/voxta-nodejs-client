# voxta-nodejs-client

Node.js/TypeScript client for the Voxta server:
- SignalR hub: `http(s)://{host}:{port}/hub`
- Audio input WebSocket: `ws(s)://{host}:{port}/ws/audio/input/stream?sessionId=...`

This repo is built from the reverse-engineered protocol surface in `Docs/VOXTA_DEVELOPMENT_GUIDE.md` and the decompiled `Voxta.Model` message DTOs under `_temp_decompile/`.

## Install

Requires Node.js 20+.

```bash
cd voxta-nodejs-client
npm install
npm run build
```

## Authentication

Voxta can run without authentication (common for local/dev). If your server requires auth, provide an API key via `Authorization: Bearer ...` (or an authenticated cookie session).

Device flow helper (your user must open the URL + enter code):

```ts
import { pollDeviceToken, requestDeviceCode } from 'voxta-nodejs-client';

const baseUrl = 'http://127.0.0.1:5384';
const code = await requestDeviceCode({ baseUrl, label: 'my-node-app' });
console.log(`Open ${code.verificationUrl} and enter code: ${code.userCode}`);
const apiKey = await pollDeviceToken({ baseUrl, deviceCode: code.deviceCode });
```

## Quickstart (Hub + chat)

```ts
import { VoxtaClient, createBearerHeaders } from 'voxta-nodejs-client';

const baseUrl = 'http://127.0.0.1:5384';
const apiKey = process.env.VOXTA_API_KEY;

const client = new VoxtaClient({
  baseUrl,
  headers: apiKey ? createBearerHeaders(apiKey) : undefined,
  authenticate: { client: 'MyNodeApp', clientVersion: '0.1.0' },
});

client.on('message', (m) => console.log(m.$type, m));

await client.connectAndAuthenticate();

// Resume an existing chat (chatId is a GUID string)
const started = await client.resumeChatAndWait({ chatId: '00000000-0000-0000-0000-000000000000' });
await client.sendText(started.sessionId, 'hello', { doReply: true, doCharacterActionInference: true });
```

## Audio input (WebSocket stream)

```ts
import { VoxtaNodeClient } from 'voxta-nodejs-client/node';

const nodeClient = new VoxtaNodeClient({
  baseUrl,
  headers: apiKey ? createBearerHeaders(apiKey) : undefined,
  authenticate: { client: 'MyNodeApp', clientVersion: '0.1.0' },
});

const audioIn = nodeClient.createAudioInputWebSocket(started.sessionId);
await audioIn.connect();
audioIn.sendAudio(pcm16leChunk);
```

## Status / Roadmap

See `voxta-nodejs-client/FEATURES.md`.

## Examples

After building, you can run:

```bash
VOXTA_URL=http://127.0.0.1:5384 VOXTA_CHAT_ID=... node examples/console-chat.mjs

# If your server requires auth:
VOXTA_URL=http://127.0.0.1:5384 VOXTA_API_KEY=... VOXTA_CHAT_ID=... node examples/console-chat.mjs
```
