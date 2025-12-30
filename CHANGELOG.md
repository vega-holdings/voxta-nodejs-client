# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-12-30

### Added
- **Typing indicators**: `typingStart()` and `typingEnd()` methods for signaling user typing state.
- **Message management**: `updateMessage()` and `deleteMessage()` methods for editing/removing messages.
- **Action triggering**: `triggerAction()` method to explicitly trigger AI actions.
- **Participant management**: `addChatParticipant()`, `addChatParticipantAndWait()`, `removeChatParticipant()`, `removeChatParticipantAndWait()` methods.
- **Suggestions**: `requestSuggestions()` and `requestSuggestionsAndWait()` methods.
- **Debugging**: `inspect()` and `inspectAudioInput()` methods for debugging.
- **Speech/TTS**: `characterSpeechRequest()`, `speak()`, `speechPlaybackStart()`, `speechPlaybackComplete()` methods.
- **App registration**: `registerApp()` method.
- ESLint + Prettier configuration for code quality.
- Vitest test framework with unit and integration tests.
- Comprehensive integration tests covering chat flow, typing, suggestions, and speech playback.

### Changed
- Feature parity with Python voxta-client v0.2.0.

## [0.1.0] - 2025-12-30

### Added
- Initial release with full SignalR protocol support.
- Core `VoxtaClient` class with connection management and typed events.
- Support for all 78+ server message types.
- Chat lifecycle methods: `startChat`, `resumeChat`, `stopChat`, `pauseChat`.
- Message sending: `sendChatMessage`, `sendText`.
- Context management: `updateContext`.
- Reply handling: `interrupt`, `retry`, `revert`.
- List loading: `loadCharactersList`, `loadScenariosList`, `loadChatsList`.
- Subscription management: `subscribeToChat`, `unsubscribeFromChat`.
- `VoxtaAudioInputWebSocket` for audio streaming.
- Device authorization flow support.
- Utility functions for URL parsing, headers, and base64 encoding.
- Full TypeScript type definitions for all protocol messages.
