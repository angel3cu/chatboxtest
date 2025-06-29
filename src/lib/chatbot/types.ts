export enum ResponseType {
  METADATA = 'metadata',
  TEXT = 'text',
  IMAGE = 'image',
}

interface MetadataResponseChunk {
  type: ResponseType.METADATA;
  id: string;
}

interface TextResponseChunk {
  type: ResponseType.TEXT;
  text: string;
}

interface ImageResponseChunk {
  type: ResponseType.IMAGE;
  url: string;
}

export type ChatbotReponseChunk = MetadataResponseChunk | TextResponseChunk | ImageResponseChunk;

export type ChatbotResponse = ReadableStream<ChatbotReponseChunk>;
