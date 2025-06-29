import OpenAI from 'openai';
import { Chatbot } from './index';
import { ChatbotReponseChunk, ChatbotResponse, ResponseType } from './types';

export default class OpenAIChatbot implements Chatbot {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      project: process.env.OPENAI_PROJECT_ID,
    });
  }

  async prompt(message: string, instructions?: string, previousResponseId?: string): Promise<ChatbotResponse> {
    const stream = await this.client.responses.create({
      model: 'gpt-4.1',
      input: message,
      instructions: instructions,
      previous_response_id: previousResponseId,
      stream: true,
    });

    return new ReadableStream<ChatbotReponseChunk>({
      async start(controller) {
        try {
          for await (const event of stream) {
            switch (event.type) {
              case 'response.created':
                controller.enqueue({
                  type: ResponseType.METADATA,
                  id: event.response.id,
                });
                break;

              case 'response.output_text.delta':
                controller.enqueue({
                  type: ResponseType.TEXT,
                  text: event.delta,
                });
                break;

              default:
                // TODO: I had a quick look at one of the responses and it seems that OpenAI responds with a stream of
                // content part that can be text, images, link or MCP for more complex interactions. We ignore everything
                // by text data here but a more sophisticated parser could be written to handle everything correctly.
                break;
            }
          }

          controller.close();
        } catch (error) {
          console.error(error);
        }
      },
    });
  }
}
