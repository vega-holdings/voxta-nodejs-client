# Features

This client targets Voxta Server `v1.2.0` / protocol surface as documented in `Docs/VOXTA_DEVELOPMENT_GUIDE.md` (SDK 1.1.4 DTOs).

## Implemented

- Hub connection (`/hub`) via `@microsoft/signalr`
- Authenticate (`authenticate`) + typed server message routing
- Chat lifecycle helpers: `startChat*`, `resumeChat*`, `pauseChat`, `stopChat`, `interrupt`, `sendText`
- List helpers: `loadCharactersList*`, `loadScenariosList*`, `loadChatsList*`
- Chat REST helpers: `GET /api/chats`, `GET /api/chats/{chatId}/summary`, `POST /api/chats`
- Device code flow helpers: `POST /api/device/code` + `POST /api/device/poll`
- Audio input streaming helper (Node only, `import ... from 'voxta-nodejs-client/node'`): `ws(s)://.../ws/audio/input/stream?sessionId=...`
- Header helpers: Bearer + Basic (for reverse proxies)

## Planned / In Progress

- High-level "session" wrapper around `sessionId` (ergonomic chat APIs)
- Audio output helpers (resolve + fetch `audioUrl` chunks)
- Attachments (base64Url images) helpers
- Full coverage for remaining client message types (typed convenience methods)
- Better runtime validation for incoming messages (schema/zod optional)
- Reconnect/auth edge-cases + backoff controls
- Example apps (CLI chat, Discord bot refactor, etc.)
