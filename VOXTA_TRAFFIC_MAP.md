# Voxta Traffic Map (local capture)

Built from these artifacts (do not treat this as an exhaustive spec; it’s an observed map from this run):

- `localhost.har` (Chrome HAR export; includes WebSocket frames)
- `server_log.log` (Voxta server log)
- `localhost-1766099534426.log` (Chrome console log)
- `spy.ndjson` (MessageSpy observer connection; limited scope)

Time window (approx):

- HAR + Chrome log: `2025-12-18T22:48Z` → `2025-12-18T23:10Z`
- MessageSpy NDJSON: `2025-12-18T22:48Z` → `2025-12-18T23:09Z`

## Transports & Endpoints

### 1) SignalR hub (chat/control plane)

- WebSocket: `ws://localhost:5384/hub`
- SignalR JSON protocol:
  - Client handshake (first frame): `{"protocol":"json","version":1}` + record separator (`0x1e`)
  - Server handshake ack: `{}` + `0x1e`
  - Ping: `{"type":6}` + `0x1e`
  - Invocation: `{"type":1,"target":"…","arguments":[…]}` + `0x1e`

Hub methods to care about:

- **Client → Server**: hub target `SendMessage` (invocation args contain Voxta payload DTOs with `$type`)
- **Server → Client**: hub target `ReceiveMessage` (invocation args contain Voxta payload DTOs with `$type`)

Observed from `localhost.har`:

- SignalR envelope types: `type=1` (Invocation), `type=6` (Ping)
- Hub targets: `SendMessage`, `ReceiveMessage`

### 2) Audio input stream (voice capture plane)

- WebSocket: `ws://localhost:5384/ws/audio/input/stream?sessionId=<sessionId>`
- First message is JSON (opcode 1) describing stream format:
  - `{"contentType":"audio/wav","sampleRate":16000,"channels":1,"bitsPerSample":16,"bufferMilliseconds":30}`
- Then the browser sends binary frames (opcode 2) roughly every `bufferMilliseconds` (~30ms).
- Chrome HAR does **not** include binary payload bytes (frames show `"data": ""`), but timing/count still maps the stream.

Voice capture is coordinated via hub messages:

- Server emits `recordingRequest { enabled: true/false, sessionId }`
- Server emits `recordingStatus { enabled: true/false, sessionId }`
- When `recordingRequest.enabled=true`, the UI starts the `/ws/audio/input/stream` WebSocket and begins sending audio frames.

### 3) HTTP API (REST + media fetches)

Important chat/voice endpoints observed in `localhost.har`:

- Chats:
  - `GET /api/chats?characterId=...`
  - `POST /api/chats`
  - `GET /api/chats/<chatId>/summary`
- Text-to-speech audio fetch (voice output):
  - `GET /api/tts/gens/<id>` → `audio/mpeg`
- Common boot/config:
  - `GET /api/ui/init?signin=...`
  - `GET /api/profile`
  - `GET /api/configurations`
  - `GET /api/scenarios/...` / `GET /api/characters/...` (UI browsing/loading)

Notable error observed:

- `GET /api/characters/<id>/memory-book` → `404` (also appears in `server_log.log`)

### 4) Server → External services (from `server_log.log`)

The local server calls out to hosted providers during chat/voice:

- Text generation:
  - `POST https://api.voxta.ai/v1/chat/completions`
  - `GET https://api.voxta.ai/models/auto__textgen?...`
- TTS:
  - `POST https://api.voxta.ai/tts/generate`
  - `GET https://api.voxta.ai/tts/voices`
  - `POST https://api.voxta.ai/tts/voice-info`
- (also observed) `POST https://openrouter.ai/api/v1/chat/completions` (YoloLLM module)

## Hub payload `$type` map (observed)

Each of these is carried inside a SignalR Invocation:

- `c2s`: `{"type":1,"target":"SendMessage","arguments":[{...payload...}]}` + `0x1e`
- `s2c`: `{"type":1,"target":"ReceiveMessage","arguments":[{...payload...}]}` + `0x1e`

Fields below are the observed **top-level keys** of the payload object (per `$type`).

### Client → Server (`SendMessage`)

- `authenticate`: `$type`, `client`, `clientVersion`, `scope`, `capabilities`
- `inspectAudioInput`: `$type`, `audioFrames`, `speechToText`
- `resumeChat`: `$type`, `chatId`
- `send`: `$type`, `sessionId`, `text`, `doReply`, `doCharacterActionInference`
- `typingStart`: `$type`, `sessionId`
- `typingEnd`: `$type`, `sessionId`, `sent`
- `updateContext`: `$type`, `sessionId`, `setFlags`
- `speechPlaybackStart`: `$type`, `sessionId`, `messageId`, `startIndex`, `endIndex`, `duration`, `isNarration`
- `speechPlaybackComplete`: `$type`, `sessionId`, `messageId`
- `stopChat`: `$type`

### Server → Client (`ReceiveMessage`)

- `welcome`: `$type`, `voxtaServerVersion`, `apiVersion`, `registeredClientVersion`, `user`, `favorite`, `assistant`
- `configuration`: `$type`, `configurations`, `featureFlags`, `services`
- `moduleRuntimeInstances`: `$type`, `instances`
- `chatsSessionsUpdated`: `$type`, `sessions`
- `chatStarting`: `$type`, `chatId`, `chatStyle`, `servicesConfigurationsSetId`, `sessionId`
- `chatLoadingMessage`: `$type`, `text`, `progress`, `sessionId`
- `chatStarted`: `$type`, `chatId`, `chatStyle`, `messages`, `context`, `scenario`, `services`, `augmentations`, `sessionId`, `user`, `characters`, `narrator`, `servicesConfigurationsSetId`
- `chatFlow`: `$type`, `state`, `sessionId`
- `replyStart`: `$type`, `chatTime`, `messageId`, `senderId`, `sessionId`
- `replyGenerating`: `$type`, `messageId`, `senderId`, `sessionId`, `role`, `isNarration`
- `replyChunk`: `$type`, `messageId`, `senderId`, `startIndex`, `endIndex`, `text`, `audioUrl`, `isNarration`, `sessionId`
- `replyEnd`: `$type`, `messageId`, `senderId`, `sessionId`, `conversationIndex`, `messageIndex`, `tokens`
- `update`: `$type`, `messageId`, `sessionId`, `senderId`, `role`, `text`, `timestamp`, `chatTime`, `conversationIndex`, `index`, `tokens`
- `contextUpdated`: `$type`, `flags`, `contexts?`, `actions?`, `buttons`, `characters`, `roles`, `sessionId`
- `memoryUpdated`: `$type`, `sessionId`, `memories`, `characterId`
- `action`: `$type`, `sessionId`, `senderId`, `role`, `layer`, `contextKey`, `value`
- `appTrigger`: `$type`, `sessionId`, `senderId`, `messageId`, `name`, `arguments`
- `recordingRequest`: `$type`, `enabled`, `sessionId`
- `recordingStatus`: `$type`, `enabled`, `sessionId`
- `wakeWordStatus`: `$type`, `enabled`, `standBy`, `sessionId`
- `speechPlaybackStart`: `$type`, `sessionId`, `messageId`, `startIndex`, `endIndex`, `duration`, `isNarration`
- `speechPlaybackComplete`: `$type`, `sessionId`, `messageId`
- `chatClosed`: `$type`, `chatId`, `sessionId`

## Chat + voice: observed flow sketch

This is the high-level sequence observed in the HAR (UI client `Voxta.Talk`).

1) Connect `ws://localhost:5384/hub` (SignalR handshake + pings).
2) `c2s SendMessage.authenticate` (client name/version, scopes, capabilities).
3) `s2c ReceiveMessage.welcome`, `configuration`, `moduleRuntimeInstances`, `chatsSessionsUpdated`, …
4) `c2s SendMessage.resumeChat { chatId }`.
5) `s2c ReceiveMessage.chatStarting` → `chatLoadingMessage*` → `chatStarted`.
6) When the user sends text:
   - `c2s SendMessage.typingStart`
   - `c2s SendMessage.send { sessionId, text, ... }`
   - `c2s SendMessage.typingEnd`
   - `s2c ReceiveMessage.chatFlow` transitions (`ProcessingUserMessage` → `ProcessingAssistantReply` → `WaitingForUserInput`)
7) Assistant reply streaming:
   - `s2c ReceiveMessage.replyStart`
   - `s2c ReceiveMessage.replyChunk*` (text slices; may include `audioUrl`)
   - `s2c ReceiveMessage.replyEnd`
   - `s2c ReceiveMessage.update` (finalized message record incl. `tokens`, `timestamp`, etc.)
8) Voice output playback loop (when `replyChunk.audioUrl` is present):
   - Browser `GET /api/tts/gens/<id>` (`audio/mpeg`)
   - Browser notifies playback progress:
     - `c2s SendMessage.speechPlaybackStart*` (chunked by text indices)
     - `c2s SendMessage.speechPlaybackComplete`
   - Server also emits `s2c ReceiveMessage.speechPlaybackStart/Complete` (mirrors for UI state sync).
9) Voice input capture (microphone):
   - `s2c ReceiveMessage.recordingRequest enabled=true`
   - Browser opens `ws://localhost:5384/ws/audio/input/stream?sessionId=...`
     - sends stream format JSON once
     - sends binary audio frames ~30ms
   - `s2c ReceiveMessage.recordingRequest enabled=false` (stream stops)

## Notes on the artifacts

- `spy.ndjson` is an **observer** connection and only shows what that client receives/sends (it did not subscribe/resume chat, so it mostly captured global status broadcasts).
- `localhost.har` is the best “single file” for mapping both directions because it includes the hub frames and the separate audio input stream WebSocket.
