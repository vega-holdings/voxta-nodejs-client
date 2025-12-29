export type Guid = string;

export type AudioInputClientCapabilities = 'None' | 'WebSocketStream' | 'Disabled';
export type AudioOutputClientCapabilities = 'None' | 'Url' | 'LocalFile' | 'Disabled';
export type VisionCaptureClientCapabilities = 'None' | 'PostImage' | 'Disabled';

export type ComputerVisionSource = 'Undefined' | 'Attachment' | 'Eyes' | 'Screen' | 'Generated';

export type ChatMessageRole =
  | 'Undefined'
  | 'System'
  | 'Assistant'
  | 'User'
  | 'Summary'
  | 'Event'
  | 'Instructions'
  | 'Note'
  | 'Secret';

export type ChatStyles = 'Companion' | 'Roleplay' | 'Storytelling' | 'Assistant' | 'Undefined';

export type ChatFlowModes = 'Chat' | 'Story';

export type FunctionTiming =
  | 'AfterUserMessage'
  | 'BeforeAssistantMessage'
  | 'AfterAssistantMessage'
  | 'Manual'
  | 'Button'
  | 'AfterAnyMessage';

export type FunctionArgumentType =
  | 'Undefined'
  | 'String'
  | 'Integer'
  | 'Double'
  | 'Boolean'
  | 'Array';

export type ChatResourceKind =
  | 'Unknown'
  | 'Character'
  | 'Stages'
  | 'Scenario'
  | 'MemoryBook'
  | 'Package'
  | 'Chat'
  | 'Collection';

export type ServiceTypes =
  | 'TextGen'
  | 'ActionInference'
  | 'Summarization'
  | 'TextToSpeech'
  | 'SpeechToText'
  | 'AudioInput'
  | 'AudioOutput'
  | 'AudioPipeline'
  | 'WakeWord'
  | 'VisionCapture'
  | 'ComputerVision'
  | 'ChatAugmentations'
  | 'Memory'
  | 'ImageGen'
  | 'None'
  | 'ActionInferenceResolution';

export type ServiceErrorCodes = string;

export type PromptCategories = number;

export interface ClientCapabilities {
  audioInput: AudioInputClientCapabilities;
  audioOutput?: AudioOutputClientCapabilities;
  audioFolder?: string;
  acceptedAudioContentTypes?: string[];
  visionCapture?: VisionCaptureClientCapabilities;
  visionSources?: ComputerVisionSource[] | null;
}

export interface ChatParticipantInfo {
  id: Guid;
  name: string;
  thumbnailUrl?: string | null;
  scenarioRole?: string | null;
  appConfiguration?: Record<string, string>;
}

export interface ChatSessionInfo {
  sessionId: Guid;
  chatId: Guid;
  user: ChatParticipantInfo;
  characters: ChatParticipantInfo[];
}

export interface ChatMessageAttachment {
  id?: Guid;
  contentType?: string | null;
  url?: string | null;
  source?: ComputerVisionSource;
  description?: string | null;
  fileName?: string | null;
  label?: string | null;
  width?: number | null;
  height?: number | null;
  prompt?: string | null;
}

export interface ChatMessage {
  messageId: Guid;
  role: ChatMessageRole;
  senderId: Guid;
  name?: string | null;
  text: string;
  timestamp: string;
  summarizedBy?: Guid | null;
  tokens?: number | null;
  index?: number;
  conversationIndex?: number;
  chatTime?: number;
  attachments?: ChatMessageAttachment[] | null;
}

export interface CharactersListItem {
  id: Guid;
  name: string;
  version?: string | null;
  appControlled: boolean;
  dateCreated?: string | null;
  dateCreatedAgo?: string | null;
  dateModified?: string | null;
  dateModifiedAgo?: string | null;
  thumbnailUrl?: string | null;
  creator?: string | null;
  creatorNotes?: string | null;
  culture: string;
  explicitContent: boolean;
  importedFrom?: string | null;
  favorite: boolean;
  hidden: boolean;
  scenarioOnly: boolean;
  tags?: string[] | null;
  packageId?: Guid | null;
  packageName?: string | null;
  packageVersion?: string | null;
}

export interface ScenarioInfoRole {
  name: string;
  description?: string | null;
  defaultCharacterId?: Guid | null;
}

export interface ScenarioInfo {
  id: Guid;
  name: string;
  chatFlow: ChatFlowModes;
  chatStyle: ChatStyles;
  roles: ScenarioInfoRole[];
  thumbnailUrl?: string | null;
  packageId?: Guid | null;
  packageName?: string | null;
  packageVersion?: string | null;
  client?: string | null;
  appConfiguration?: Record<string, string>;
}

export interface ChatsListItem {
  id: Guid;
  created: string;
}

export interface FlagInfo {
  name: string;
  messageChatTime?: number | null;
  messageIndex?: number | null;
  expireChatTime?: number | null;
  expireIndex?: number | null;
}

export interface ContextDefinition {
  id?: Guid | null;
  name?: string | null;
  text: string;
  disabled?: boolean;
  flagsFilter?: string | null;
  roleFilter?: string | null;
  applyTo?: PromptCategories;
}

export interface ActionEffect {
  setFlags?: string[] | null;
  script?: string | null;
  effect?: string | null;
  instructions?: string | null;
  note?: string | null;
  secret?: string | null;
  trigger?: string | null;
  contexts?: ContextDefinition[] | null;
  event?: string | null;
  story?: string | null;
  maxSentences?: number;
  maxTokens?: number;
}

export interface FunctionDefinition {
  id?: Guid | null;
  name: string;
  timing?: FunctionTiming | null;
  cancelReply?: boolean | null;
  description?: string;
  disabled?: boolean;
  once?: boolean;
  flagsFilter?: string | null;
  matchFilter?: string[] | null;
  roleFilter?: string | null;
  effect?: ActionEffect;
  clientMetadata?: Record<string, string> | null;
}

export interface FunctionArgumentDefinition {
  name: string;
  type: FunctionArgumentType;
  description?: string | null;
  required?: boolean;
}

export interface ScenarioActionDefinition extends FunctionDefinition {
  shortDescription?: string | null;
  layer?: string | null;
  arguments?: FunctionArgumentDefinition[];
  finalLayer?: boolean;
  activates?: string[] | null;
  flattenCondition?: string | null;
}

export interface ScenarioEventDefinition extends FunctionDefinition {
  evaluateNextEvent?: boolean;
  probability?: number | null;
  minMessagesCount?: number | null;
  maxMessagesCount?: number | null;
  minChatTimeSeconds?: number | null;
  maxChatTimeSeconds?: number | null;
  sinceFlag?: string | null;
}

export interface ActionInvocationArgument {
  name: string;
  value: string;
}

export interface DependencyInfo {
  kind: ChatResourceKind;
  id: Guid;
  version?: string | null;
}

export interface EnabledServiceAugmentation {
  serviceId: Guid;
  augmentationKey: string;
}

export interface ChatResourceReference {
  kind: ChatResourceKind;
  id: Guid;
}

export interface ChatVersionedResourceReference extends ChatResourceReference {
  version?: string;
}

export interface ChatResourceStatusInformation {
  kind: ChatResourceKind;
  id: Guid;
  version?: string | null;
  status?: string;
}

export interface ChatResourceInformation {
  kind: ChatResourceKind;
  id: Guid;
  version?: string;
  name?: string;
  status?: string;
}

export interface GenerateConstraintRequest {
  maxNewTokens?: number;
  maxSentences?: number;
  allowMultipleLines?: boolean | null;
}

export interface AudioInputSpecifications {
  contentType?: string;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  bufferMilliseconds?: number;
}
