import OpenAIChatbot from './openai';
import { ChatbotResponse } from './types';

export interface ChatbotOptions {
  instructions?: string;
  previousResponseId?: string;
}

export abstract class Chatbot {
  abstract prompt(message: string, options?: ChatbotOptions): Promise<ChatbotResponse>;
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
