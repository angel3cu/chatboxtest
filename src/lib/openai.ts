import OpenAI from 'openai';
import { Chatbot } from './chatbot';

export default class OpenAIChatbot implements Chatbot {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  }

  async prompt(message: string): Promise<ReadableStream<string>> {
    const stream = await this.client.responses.create({
      model: 'gpt-4.1',
      input: message,
      stream: true,
    });

    return new ReadableStream<string>({
      async start(controller) {
        for await (const event of stream) {
          switch (event.type) {
            case 'response.output_text.delta':
              controller.enqueue(event.delta);
              break;

            default:
              // TODO: I had a quick look at one of the responses and it seems that OpenAI responds with a stream of
              // content part that can be text, images, link or MCP for code completion. We ignore everything by text data
              // here but a more sophisticated parser could be written to handle everything correctly
              break;
          }
        }

        controller.close();
      },
    });
  }
}
