import OpenAIChatbot from './openai';
import { ChatbotResponse } from './response';

// NOTE: Creating a wrapper for the chatbot allows us to support multiple providers.

export interface ChatbotFunctionProperty {
  type: 'string' | 'number';
  description: string;
  required?: boolean;
}

export interface ChatbotFunction {
  instructions: string;
  properties: Record<string, ChatbotFunctionProperty>;
}

export type ChatbotFunctions = Record<string, ChatbotFunction>;

export interface ChatbotOptions {
  instructions?: string;
  previousResponseId?: string;
  functions?: ChatbotFunctions;
}

export interface ChatbotFunctionOutput {
  callId: string;
  output: string;
}

export type ChatbotInput = string | ChatbotFunctionOutput[];

export abstract class Chatbot {
  abstract prompt(input: ChatbotInput, options?: ChatbotOptions): Promise<ChatbotResponse>;
}

let chatbot: Chatbot | null = null;

export default function getChatbot(): Chatbot {
  if (!chatbot) {
    switch (process.env.CHATBOT) {
      case 'openai':
        chatbot = new OpenAIChatbot();
        break;

      default:
        throw new Error(`Unsupported chatbot: ${process.env.CHATBOT}`);
    }
  }

  return chatbot;
}
