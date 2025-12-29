import type {
  ActionInvocationArgument,
  ChatMessage,
  ChatMessageRole,
  ChatParticipantInfo,
  ChatResourceInformation,
  ChatResourceStatusInformation,
  ChatSessionInfo,
  ChatStyles,
  ChatVersionedResourceReference,
  ChatsListItem,
  ClientCapabilities,
  ComputerVisionSource,
  ContextDefinition,
  CharactersListItem,
  DependencyInfo,
  EnabledServiceAugmentation,
  FlagInfo,
  FunctionTiming,
  GenerateConstraintRequest,
  Guid,
  ScenarioActionDefinition,
  ScenarioInfo,
  ScenarioEventDefinition,
} from './shared.js';

export interface VoxtaMessageBase {
  $type: string;
}

export interface ClientMessageBase extends VoxtaMessageBase {}
export interface ServerMessageBase extends VoxtaMessageBase {}

export interface ClientAuthenticateMessage extends ClientMessageBase {
  $type: 'authenticate';
  client: string;
  clientVersion?: string | null;
  scope: string[];
  capabilities: ClientCapabilities;
}

export interface ClientRegisterAppMessage extends ClientMessageBase {
  $type: 'registerApp';
  clientVersion?: string | null;
  iconBase64Url?: string | null;
  label?: string | null;
  configurationForm?: unknown;
  characterForm?: unknown;
  scenarioForm?: unknown;
  scriptSnippets?: unknown[] | null;
}

export interface ClientLoadCharactersListMessage extends ClientMessageBase {
  $type: 'loadCharactersList';
}

export interface ClientLoadScenariosListMessage extends ClientMessageBase {
  $type: 'loadScenariosList';
}

export interface ClientLoadChatsListMessage extends ClientMessageBase {
  $type: 'loadChatsList';
  characterId: Guid;
  scenarioId?: Guid;
}

export interface UpdateContextPayload {
  contextKey?: string | null;
  contexts?: ContextDefinition[] | null;
  actions?: ScenarioActionDefinition[] | null;
  events?: ScenarioEventDefinition[] | null;
  setFlags?: string[] | null;
  enableRoles?: Record<string, boolean> | null;
}

export interface ClientStartChatMessage extends ClientMessageBase, UpdateContextPayload {
  $type: 'startChat';
  chatId?: Guid | null;
  characterId?: Guid | null;
  characterIds?: Guid[] | null;
  scenarioId?: Guid | null;
  roles?: Record<string, Guid> | null;
  dependencies?: DependencyInfo[] | null;
  ephemeral?: boolean;
  useChatMemory?: boolean;
}

export interface ClientResumeChatMessage extends ClientMessageBase, UpdateContextPayload {
  $type: 'resumeChat';
  chatId: Guid;
}

export interface ClientPauseChatMessage extends ClientMessageBase {
  $type: 'pauseChat';
  sessionId: Guid;
  pause: boolean;
}

export interface ClientStopChatMessage extends ClientMessageBase {
  $type: 'stopChat';
  sessionId?: Guid | null;
}

export interface ClientDeleteChatMessage extends ClientMessageBase {
  $type: 'deleteChat';
  chatId: Guid;
}

export interface ClientSubscribeToChatMessage extends ClientMessageBase {
  $type: 'subscribeToChat';
  sessionId: Guid;
}

export interface ClientUnsubscribeFromChatMessage extends ClientMessageBase {
  $type: 'unsubscribeFromChat';
  sessionId: Guid;
}

export interface ClientUpdateContextMessage extends ClientMessageBase, UpdateContextPayload {
  $type: 'updateContext';
  sessionId: Guid;
}

export type ClientSendMessageAttachment =
  | {
      $type: 'base64Url';
      source?: ComputerVisionSource;
      fileName?: string | null;
      label?: string | null;
      base64Url: string;
    }
  | {
      source?: ComputerVisionSource;
      fileName?: string | null;
      label?: string | null;
    };

export interface ClientSendMessage extends ClientMessageBase {
  $type: 'send';
  sessionId: Guid;
  text?: string | null;
  attachments?: ClientSendMessageAttachment[] | null;
  characterResponsePrefix?: string | null;
  doContinue?: boolean;
  doUserActionInference?: boolean;
  doReply?: boolean;
  doCharacterActionInference?: boolean;
  role?: ChatMessageRole;
  characterId?: Guid | null;
  triggerEvent?: string | null;
  useStoryWriter?: boolean;
  generateConstraintRequest?: GenerateConstraintRequest | null;
}

export interface ClientUpdateMessage extends ClientMessageBase {
  $type: 'update';
  sessionId: Guid;
  messageId: Guid;
  text?: string | null;
}

export interface ClientDeleteMessageMessage extends ClientMessageBase {
  $type: 'deleteMessage';
  sessionId: Guid;
  messageId: Guid;
}

export interface ClientRevertMessage extends ClientMessageBase {
  $type: 'revert';
  sessionId: Guid;
  messageId?: Guid | null;
}

export interface ClientRetryMessage extends ClientMessageBase {
  $type: 'retry';
  sessionId: Guid;
}

export interface ClientInterruptMessage extends ClientMessageBase {
  $type: 'interrupt';
  sessionId: Guid;
}

export interface ClientSpeakMessage extends ClientMessageBase {
  $type: 'speak';
  sessionId: Guid;
  messageId?: Guid | null;
}

export interface ClientTriggerActionMessage extends ClientMessageBase {
  $type: 'triggerAction';
  sessionId: Guid;
  messageId: Guid;
  value: string;
  arguments?: ActionInvocationArgument[] | null;
}

export interface ClientRunScriptMessage extends ClientMessageBase {
  $type: 'runScript';
  sessionId: Guid;
  script: string;
}

export interface ClientCharacterSpeechRequestMessage extends ClientMessageBase {
  $type: 'characterSpeechRequest';
  sessionId: Guid;
  characterId?: Guid | null;
  text: string;
}

export interface ClientSpeechPlaybackStartMessage extends ClientMessageBase {
  $type: 'speechPlaybackStart';
  sessionId: Guid;
  messageId: Guid;
  startIndex: number;
  endIndex: number;
  duration?: number;
  isNarration?: boolean;
}

export interface ClientSpeechPlaybackCompleteMessage extends ClientMessageBase {
  $type: 'speechPlaybackComplete';
  sessionId: Guid;
  messageId: Guid;
}

export interface ClientInspectAudioInputMessage extends ClientMessageBase {
  $type: 'inspectAudioInput';
  audioFrames?: boolean;
  culture?: string | null;
  speechToText?: boolean;
}

export interface ClientAddChatParticipantMessage extends ClientMessageBase {
  $type: 'addChatParticipant';
  sessionId: Guid;
  characterId: Guid;
  role?: string | null;
}

export interface ClientRemoveChatParticipantMessage extends ClientMessageBase {
  $type: 'removeChatParticipant';
  sessionId: Guid;
  characterId: Guid;
}

export interface ClientListResourcesMessage extends ClientMessageBase {
  $type: 'listResources';
  resources: ChatVersionedResourceReference[];
}

export type ClientDeployResourceFile =
  | {
      $type: 'base64';
      name: string;
      base64Data: string;
    }
  | {
      name: string;
    };

export interface ClientDeployResourceMessage extends ClientMessageBase {
  $type: 'deployResource';
  id: Guid;
  data: ClientDeployResourceFile;
  thumbnail?: ClientDeployResourceFile | null;
}

export interface ClientTypingStartMessage extends ClientMessageBase {
  $type: 'typingStart';
  sessionId: Guid;
}

export interface ClientTypingEndMessage extends ClientMessageBase {
  $type: 'typingEnd';
  sessionId: Guid;
  sent: boolean;
}

export interface ClientTriggerScriptEventMessage extends ClientMessageBase {
  $type: 'triggerScriptEvent';
  sessionId: Guid;
  name: string;
  arguments?: ActionInvocationArgument[] | null;
}

export interface ClientInspectMessage extends ClientMessageBase {
  $type: 'inspect';
  sessionId: Guid;
  enabled: boolean;
}

export interface ClientRequestSuggestionsMessage extends ClientMessageBase {
  $type: 'requestSuggestions';
  sessionId: Guid;
  prefix?: string | null;
  count?: number;
}

export interface ClientUpdateChatMessage extends ClientMessageBase {
  $type: 'updateChat';
  sessionId: Guid;
  title?: string | null;
}

export interface ClientUpdateDocumentMessage extends ClientMessageBase {
  $type: 'updateDocument';
  sessionId: Guid;
  documentId?: Guid | null;
  title?: string | null;
  content?: string | null;
}

export interface ClientFulfillUserInteractionRequestMessage extends ClientMessageBase {
  $type: 'fulfillUserInteractionRequest';
  requestId: Guid;
}

export interface ClientAppTriggerCompleteMessage extends ClientMessageBase {
  $type: 'appTriggerComplete';
  sessionId: Guid;
  triggerId: Guid;
}

export type ClientMessage =
  | ClientAuthenticateMessage
  | ClientRegisterAppMessage
  | ClientLoadCharactersListMessage
  | ClientLoadScenariosListMessage
  | ClientLoadChatsListMessage
  | ClientStartChatMessage
  | ClientResumeChatMessage
  | ClientPauseChatMessage
  | ClientStopChatMessage
  | ClientDeleteChatMessage
  | ClientSubscribeToChatMessage
  | ClientUnsubscribeFromChatMessage
  | ClientUpdateContextMessage
  | ClientSendMessage
  | ClientUpdateMessage
  | ClientDeleteMessageMessage
  | ClientRevertMessage
  | ClientRetryMessage
  | ClientInterruptMessage
  | ClientSpeakMessage
  | ClientTriggerActionMessage
  | ClientRunScriptMessage
  | ClientCharacterSpeechRequestMessage
  | ClientSpeechPlaybackStartMessage
  | ClientSpeechPlaybackCompleteMessage
  | ClientInspectAudioInputMessage
  | ClientAddChatParticipantMessage
  | ClientRemoveChatParticipantMessage
  | ClientListResourcesMessage
  | ClientDeployResourceMessage
  | ClientTypingStartMessage
  | ClientTypingEndMessage
  | ClientTriggerScriptEventMessage
  | ClientInspectMessage
  | ClientRequestSuggestionsMessage
  | ClientUpdateChatMessage
  | ClientUpdateDocumentMessage
  | ClientFulfillUserInteractionRequestMessage
  | ClientAppTriggerCompleteMessage;

export type ClientMessageType = ClientMessage['$type'];
export type ClientMessageOf<TType extends ClientMessageType> = Extract<
  ClientMessage,
  { $type: TType }
>;

export interface ServerWelcomeMessage extends ServerMessageBase {
  $type: 'welcome';
  voxtaServerVersion?: string | null;
  apiVersion?: string | null;
  registeredClientVersion?: string | null;
  user: ChatParticipantInfo;
  favorite?: ChatParticipantInfo | null;
  assistant?: ChatParticipantInfo | null;
}

export interface ServerAuthenticationRequiredMessage extends ServerMessageBase {
  $type: 'authenticationRequired';
}

export interface ServerErrorMessage extends ServerMessageBase {
  $type: 'error';
  message: string;
  code?: string | null;
  serviceName?: string | null;
  details?: string | null;
}

export interface ServerChatSessionErrorMessage extends Omit<ServerErrorMessage, '$type'> {
  $type: 'chatSessionError';
  sessionId: Guid;
  retry?: boolean;
}

export interface ServerModuleRuntimeInstancesMessage extends ServerMessageBase {
  $type: 'moduleRuntimeInstances';
  instances: Array<{
    id: Guid;
    name: string;
    label: string;
    status: string;
    createdAt: string;
  }>;
}

export interface ServerConfigurationMessage extends ServerMessageBase {
  $type: 'configuration';
  configurations: unknown[];
  services: Record<string, unknown>;
  featureFlags: string[];
}

export interface ServerCharactersListLoadedMessage extends ServerMessageBase {
  $type: 'charactersListLoaded';
  characters: CharactersListItem[];
}

export interface ServerScenariosListLoadedMessage extends ServerMessageBase {
  $type: 'scenariosListLoaded';
  scenarios: ScenarioInfo[];
}

export interface ServerChatsListLoadedMessage extends ServerMessageBase {
  $type: 'chatsListLoaded';
  chats: ChatsListItem[];
}

export interface ServerChatSessionsUpdatedMessage extends ServerMessageBase {
  $type: 'chatsSessionsUpdated';
  sessions: ChatSessionInfo[];
}

export interface ServerChatStartingMessage extends ServerMessageBase {
  $type: 'chatStarting';
  sessionId: Guid;
  chatId: Guid;
  title?: string | null;
  chatStyle?: ChatStyles;
  servicesConfigurationsSetId?: Guid;
}

export interface ServerChatLoadingMessage extends ServerMessageBase {
  $type: 'chatLoadingMessage';
  sessionId: Guid;
  text: string;
  progress?: number;
}

export interface ServerChatConfigurationMessage extends ServerMessageBase {
  $type: 'chatConfiguration';
  sessionId: Guid;
  chatId: Guid;
  services: unknown;
  servicesConfigurationsSetId?: Guid;
  user: ChatParticipantInfo;
  characters: ChatParticipantInfo[];
  narrator?: ChatParticipantInfo | null;
  scenario?: ScenarioInfo | null;
  augmentations: EnabledServiceAugmentation[];
}

export interface ServerContextUpdatedMessage extends ServerMessageBase {
  $type: 'contextUpdated';
  sessionId: Guid;
  flags: FlagInfo[];
  contexts?: unknown[] | null;
  actions?: unknown[] | null;
  buttons?: unknown[] | null;
  characters: ChatParticipantInfo[];
  roles: Record<string, unknown>;
}

export interface ServerChatStartedMessage extends ServerMessageBase {
  $type: 'chatStarted';
  sessionId: Guid;
  chatId: Guid;
  services: unknown;
  servicesConfigurationsSetId?: Guid;
  user: ChatParticipantInfo;
  characters: ChatParticipantInfo[];
  narrator?: ChatParticipantInfo | null;
  scenario?: ScenarioInfo | null;
  augmentations: EnabledServiceAugmentation[];
  title?: string | null;
  chatStyle?: ChatStyles;
  messages: ChatMessage[];
  context: ServerContextUpdatedMessage;
}

export interface ServerChatPausedMessage extends ServerMessageBase {
  $type: 'chatPaused';
  sessionId: Guid;
  paused: boolean;
}

export interface ServerChatClosedMessage extends ServerMessageBase {
  $type: 'chatClosed';
  sessionId: Guid;
  chatId: Guid;
}

export interface ServerChatUpdatedMessage extends ServerMessageBase {
  $type: 'chatUpdated';
  sessionId: Guid;
  chatId: Guid;
  title?: string;
}

export interface ServerRecordingStatusMessage extends ServerMessageBase {
  $type: 'recordingStatus';
  sessionId: Guid;
  enabled: boolean;
}

export interface ServerRecordingRequestMessage extends ServerMessageBase {
  $type: 'recordingRequest';
  sessionId: Guid;
  enabled: boolean;
}

export interface ServerUpdatedMessage extends ServerMessageBase {
  $type: 'update';
  sessionId: Guid;
  messageId: Guid;
  senderId: Guid;
  text?: string | null;
  summarizedBy?: Guid | null;
  tokens?: number;
  index: number;
  conversationIndex: number;
  chatTime: number;
  role: ChatMessageRole;
  timestamp: string;
  attachments?: unknown[] | null;
}

export interface ServerReplyGeneratingMessage extends ServerMessageBase {
  $type: 'replyGenerating';
  sessionId: Guid;
  messageId: Guid;
  senderId: Guid;
  role: ChatMessageRole;
  thinkingSpeechUrl?: string | null;
  isNarration?: boolean;
}

export interface ServerReplyStartMessage extends ServerMessageBase {
  $type: 'replyStart';
  sessionId: Guid;
  messageId: Guid;
  senderId: Guid;
  chatTime?: number;
}

export interface ServerReplyThinkingMessage extends ServerMessageBase {
  $type: 'replyThink';
  sessionId: Guid;
  messageId: Guid;
  senderId: Guid;
  text: string;
}

export interface ServerReplyChunkMessage extends ServerMessageBase {
  $type: 'replyChunk';
  sessionId: Guid;
  messageId: Guid;
  senderId: Guid;
  startIndex?: number;
  endIndex?: number;
  text: string;
  audioUrl?: string;
  isNarration?: boolean;
  audioGapMs?: number | null;
}

export interface ServerReplyEndMessage extends ServerMessageBase {
  $type: 'replyEnd';
  sessionId: Guid;
  messageId: Guid;
  senderId: Guid;
  tokens?: number;
  messageIndex?: number;
  conversationIndex?: number;
}

export interface ServerReplyCancelledMessage extends ServerMessageBase {
  $type: 'replyCancelled';
  sessionId: Guid;
  messageId: Guid;
}

export interface ServerSpeechRecognitionStartMessage extends ServerMessageBase {
  $type: 'speechRecognitionStart';
}

export interface ServerSpeechRecognitionPartialMessage extends ServerMessageBase {
  $type: 'speechRecognitionPartial';
  text: string;
}

export interface ServerSpeechRecognitionEndMessage extends ServerMessageBase {
  $type: 'speechRecognitionEnd';
  text?: string | null;
  reason?: string | null;
}

export interface ServerInterruptSpeechMessage extends ServerMessageBase {
  $type: 'interruptSpeech';
}

export interface ServerSpeechPlaybackStartMessage extends ServerMessageBase {
  $type: 'speechPlaybackStart';
  sessionId: Guid;
  messageId: Guid;
  startIndex?: number;
  duration?: number;
}

export interface ServerSpeechPlaybackCompleteMessage extends ServerMessageBase {
  $type: 'speechPlaybackComplete';
  sessionId: Guid;
  messageId: Guid;
}

export interface ServerActionMessage extends ServerMessageBase {
  $type: 'action';
  sessionId: Guid;
  contextKey?: string | null;
  layer?: string | null;
  value: string;
  role?: ChatMessageRole;
  senderId: Guid;
  scenarioRole?: string | null;
  arguments?: ActionInvocationArgument[] | null;
}

export interface ServerActionAppTriggerMessage extends ServerMessageBase {
  $type: 'appTrigger';
  sessionId: Guid;
  messageId?: Guid | null;
  triggerId?: Guid | null;
  name: string;
  arguments?: unknown[] | null;
  senderId: Guid;
  scenarioRole?: string | null;
}

export interface ServerContextUpdatedMessage extends ServerMessageBase {
  $type: 'contextUpdated';
  sessionId: Guid;
  flags: FlagInfo[];
  contexts?: unknown[] | null;
  actions?: unknown[] | null;
  buttons?: unknown[] | null;
  characters: ChatParticipantInfo[];
  roles: Record<string, unknown>;
}

export interface ServerMemoryUpdatedMessage extends ServerMessageBase {
  $type: 'memoryUpdated';
  sessionId: Guid;
  memories: unknown[];
  characterId: Guid;
}

export interface ServerAudioFrameMessage extends ServerMessageBase {
  $type: 'audioFrame';
  rms?: number;
  voiceActivity?: boolean;
}

export interface ServerChatParticipantsUpdatedMessage extends ServerMessageBase {
  $type: 'chatParticipantsUpdated';
  sessionId: Guid;
  characters: ChatParticipantInfo[];
}

export type ChatFlowStates =
  | 'Undefined'
  | 'WaitingForUserInput'
  | 'ProcessingAssistantReply'
  | 'ProcessingUserMessage'
  | 'SelectingSpeaker';

export interface ServerChatFlowMessage extends ServerMessageBase {
  $type: 'chatFlow';
  sessionId: Guid;
  state: ChatFlowStates;
}

export interface ServerListResourcesResultMessage extends ServerMessageBase {
  $type: 'listResourcesResult';
  resources: ChatResourceInformation[];
}

export interface ServerDeployResourceResultMessage extends ServerMessageBase {
  $type: 'deployResourceResult';
  success: boolean;
  error?: string | null;
  id: Guid;
  version?: string | null;
  name?: string | null;
}

export interface ServerMissingResourcesErrorMessage extends ServerMessageBase {
  $type: 'missingResourcesError';
  resources: ChatResourceStatusInformation[];
}

export interface ServerVisionCaptureRequestMessage extends ServerMessageBase {
  $type: 'visionCaptureRequest';
  sessionId: Guid;
  visionCaptureRequestId: Guid;
  source: ComputerVisionSource;
}

export interface ServerWakeWordStatusMessage extends ServerMessageBase {
  $type: 'wakeWordStatus';
  sessionId: Guid;
  enabled: boolean;
  standBy: boolean;
}

export interface ServerInspectorEnabledMessage extends ServerMessageBase {
  $type: 'inspectorEnabled';
  sessionId: Guid;
  timestamp?: string;
  triggeredByMessageId?: Guid | null;
  enabled: boolean;
}

export interface ServerInspectorScriptExecutedMessage extends ServerMessageBase {
  $type: 'inspectorScriptExecuted';
  sessionId: Guid;
  timestamp?: string;
  triggeredByMessageId?: Guid | null;
  name: string;
  logs?: Array<{ level: string; message: string }>;
}

export interface ServerInspectorScenarioEventExecutedMessage extends ServerMessageBase {
  $type: 'inspectorScenarioEventExecuted';
  sessionId: Guid;
  timestamp?: string;
  triggeredByMessageId?: Guid | null;
  name: string;
  timing: FunctionTiming;
}

export interface ServerInspectorActionExecutedMessage extends ServerMessageBase {
  $type: 'inspectorActionExecuted';
  sessionId: Guid;
  timestamp?: string;
  triggeredByMessageId?: Guid | null;
  layer?: string | null;
  name: string;
  timing: FunctionTiming;
}

export interface ServerSuggestionsMessage extends ServerMessageBase {
  $type: 'suggestions';
  sessionId?: Guid;
  suggestions: string[];
}

export interface ServerDownloadProgressMessage extends ServerMessageBase {
  $type: 'downloadProgress';
  id: Guid;
  target: string;
  status: string;
  percent: number;
}

export interface ServerDocumentUpdatedMessage extends ServerMessageBase {
  $type: 'documentUpdated';
  sessionId: Guid;
  documentId: Guid;
  title?: string | null;
  titleTokens?: number;
  content?: string | null;
  contentTokens?: number;
}

export interface ServerUserInteractionRequestMessage extends ServerMessageBase {
  $type: 'userInteractionRequest';
  requestId: Guid;
  moduleId?: Guid | null;
  message: string;
  url?: string | null;
}

export interface ServerCloseUserInteractionRequestMessage extends ServerMessageBase {
  $type: 'closeUserInteractionRequest';
  requestId: Guid;
}

export type ServerMessage =
  | ServerWelcomeMessage
  | ServerAuthenticationRequiredMessage
  | ServerErrorMessage
  | ServerChatSessionErrorMessage
  | ServerModuleRuntimeInstancesMessage
  | ServerConfigurationMessage
  | ServerCharactersListLoadedMessage
  | ServerChatsListLoadedMessage
  | ServerScenariosListLoadedMessage
  | ServerChatSessionsUpdatedMessage
  | ServerChatStartingMessage
  | ServerChatLoadingMessage
  | ServerChatConfigurationMessage
  | ServerContextUpdatedMessage
  | ServerChatStartedMessage
  | ServerChatPausedMessage
  | ServerChatClosedMessage
  | ServerChatUpdatedMessage
  | ServerRecordingStatusMessage
  | ServerRecordingRequestMessage
  | ServerUpdatedMessage
  | ServerReplyGeneratingMessage
  | ServerReplyStartMessage
  | ServerReplyThinkingMessage
  | ServerReplyChunkMessage
  | ServerReplyEndMessage
  | ServerReplyCancelledMessage
  | ServerSpeechRecognitionStartMessage
  | ServerSpeechRecognitionPartialMessage
  | ServerSpeechRecognitionEndMessage
  | ServerSpeechPlaybackStartMessage
  | ServerSpeechPlaybackCompleteMessage
  | ServerInterruptSpeechMessage
  | ServerActionMessage
  | ServerActionAppTriggerMessage
  | ServerSuggestionsMessage
  | ServerDownloadProgressMessage
  | ServerDocumentUpdatedMessage
  | ServerUserInteractionRequestMessage
  | ServerMemoryUpdatedMessage
  | ServerAudioFrameMessage
  | ServerChatParticipantsUpdatedMessage
  | ServerChatFlowMessage
  | ServerListResourcesResultMessage
  | ServerDeployResourceResultMessage
  | ServerMissingResourcesErrorMessage
  | ServerVisionCaptureRequestMessage
  | ServerWakeWordStatusMessage
  | ServerInspectorEnabledMessage
  | ServerInspectorScriptExecutedMessage
  | ServerInspectorScenarioEventExecutedMessage
  | ServerInspectorActionExecutedMessage
  | ServerCloseUserInteractionRequestMessage;

export type ServerMessageType = ServerMessage['$type'];
export type ServerMessageOf<TType extends ServerMessageType> = Extract<
  ServerMessage,
  { $type: TType }
>;

const VOXTA_SERVER_MESSAGE_TYPES: ReadonlySet<ServerMessageType> = new Set<ServerMessageType>([
  'welcome',
  'moduleRuntimeInstances',
  'authenticationRequired',
  'configuration',
  'charactersListLoaded',
  'chatsListLoaded',
  'scenariosListLoaded',
  'chatsSessionsUpdated',
  'chatStarting',
  'chatLoadingMessage',
  'chatStarted',
  'chatConfiguration',
  'chatPaused',
  'chatClosed',
  'chatUpdated',
  'recordingStatus',
  'recordingRequest',
  'update',
  'replyGenerating',
  'replyStart',
  'replyThink',
  'replyChunk',
  'replyEnd',
  'replyCancelled',
  'speechRecognitionStart',
  'speechRecognitionPartial',
  'speechRecognitionEnd',
  'speechPlaybackStart',
  'speechPlaybackComplete',
  'interruptSpeech',
  'action',
  'appTrigger',
  'contextUpdated',
  'memoryUpdated',
  'error',
  'chatSessionError',
  'audioFrame',
  'chatParticipantsUpdated',
  'chatFlow',
  'listResourcesResult',
  'deployResourceResult',
  'missingResourcesError',
  'visionCaptureRequest',
  'wakeWordStatus',
  'suggestions',
  'inspectorEnabled',
  'inspectorScriptExecuted',
  'inspectorScenarioEventExecuted',
  'inspectorActionExecuted',
  'downloadProgress',
  'documentUpdated',
  'userInteractionRequest',
  'closeUserInteractionRequest',
]);

export function isVoxtaServerMessage(value: unknown): value is ServerMessage {
  if (value === null || typeof value !== 'object') return false;
  if (!('$type' in value)) return false;
  const type = (value as { $type?: unknown }).$type;
  if (typeof type !== 'string') return false;
  return VOXTA_SERVER_MESSAGE_TYPES.has(type as ServerMessageType);
}
