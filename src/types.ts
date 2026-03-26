export interface Agent {
  id: string;
  number: string;
  title: string;
  originalName: string;
  category: string;
  priority: 'HIGH' | 'MED' | 'LOW';
  useCase: string;
  systemPrompt: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: AgentFile[];
}

export interface AgentFile {
  id: string;
  name: string;
  type: string;
  content: string; // Extracted text content
  size: string;
}

export interface AgentSession {
  agentId: string;
  messages: ChatMessage[];
  files: AgentFile[];
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    tenantId: string;
    providerInfo: {
      providerId: string;
      displayName: string;
      email: string;
      photoUrl: string;
    }[];
  }
}
