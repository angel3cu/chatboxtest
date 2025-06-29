import OpenAIChatbot from './openai';
import { ChatbotResponse } from './types';

export abstract class Chatbot {
  abstract prompt(message: string, instructions?: string, previousResponseId?: string): Promise<ChatbotResponse>;
}

export default function getChatbot(): Chatbot {
  switch (process.env.CHATBOT) {
    case 'openai':
      return new OpenAIChatbot();

    default:
      throw new Error(`Unsupported chatbot: ${process.env.CHATBOT}`);
  }
}
