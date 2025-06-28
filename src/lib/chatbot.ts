import OpenAIChatbot from './openai';

export abstract class Chatbot {
  abstract prompt(message: string): Promise<ReadableStream<string>>;
}

export default function getChatbot(): Chatbot {
  switch (process.env.CHATBOT) {
    case 'openai':
      return new OpenAIChatbot();

    default:
      throw new Error(`Unsupported chatbot: ${process.env.CHATBOT}`);
  }
}
