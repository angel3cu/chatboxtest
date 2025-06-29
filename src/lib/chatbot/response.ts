export enum ResponseType {
  METADATA = 'metadata',
  TEXT = 'text',
  IMAGE = 'image',
  FUNCTION = 'function',
  END = 'end',
}

export interface MetadataResponseChunk {
  type: ResponseType.METADATA;
  id: string;
}

export interface TextResponseChunk {
  type: ResponseType.TEXT;
  text: string;
}

export interface ImageResponseChunk {
  type: ResponseType.IMAGE;
  url: string;
}

export interface FunctionResponseChunk {
  type: ResponseType.FUNCTION;
  name: string;
  callId: string;
  output: Record<string, unknown>;
}

export interface EndResponseChunk {
  type: ResponseType.END;
}

export type ChatbotResponseChunk =
  | MetadataResponseChunk
  | TextResponseChunk
  | ImageResponseChunk
  | FunctionResponseChunk
  | EndResponseChunk;

export type ChatbotResponse = ReadableStream<ChatbotResponseChunk>;
