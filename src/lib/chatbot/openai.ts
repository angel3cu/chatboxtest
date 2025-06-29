import OpenAI from 'openai';
import { Chatbot, ChatbotInput, ChatbotOptions } from './index';
import { ChatbotResponseChunk, ChatbotResponse, ResponseType } from './response';

export default class OpenAIChatbot implements Chatbot {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      project: process.env.OPENAI_PROJECT_ID,
    });
  }

  async prompt(
    input: ChatbotInput,
    { instructions, previousResponseId, functions }: ChatbotOptions = {}
  ): Promise<ChatbotResponse> {
    const stream = await this.client.responses.create({
      model: 'gpt-4.1',
      input:
        typeof input === 'string'
          ? input
          : input.map((value) => ({
              type: 'function_call_output',
              call_id: value.callId,
              output: value.output,
            })),
      instructions,
      previous_response_id: previousResponseId,
      stream: true,
      tools:
        functions &&
        Object.entries(functions).map(([name, definition]) => ({
          type: 'function',
          name: name,
          description: definition.instructions,
          strict: true,
          parameters: {
            type: 'object',
            properties: Object.entries(definition.properties).reduce(
              (obj, [name, definition]) => {
                obj[name] = {
                  type: definition.type,
                  description: definition.description,
                };

                return obj;
              },
              {} as Record<string, unknown>
            ),
            required: Object.keys(definition.properties).filter((key) => definition.properties[key].required),
            additionalProperties: false,
          },
        })),
      parallel_tool_calls: true,
      tool_choice: 'auto',
    });

    return new ReadableStream<ChatbotResponseChunk>({
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

              case 'response.completed':
                event.response.output.forEach((output) => {
                  if (output.type !== 'function_call') {
                    return;
                  }

                  try {
                    controller.enqueue({
                      type: ResponseType.FUNCTION,
                      name: output.name,
                      callId: output.call_id,
                      output: JSON.parse(output.arguments),
                    });
                  } catch (error) {
                    console.error('Error parsing function call output:', error);
                    return;
                  }
                });
                break;

              default:
                // TODO: I had a quick look at one of the responses and it seems that OpenAI responds with a stream of
                // content part that can be text, images, link or MCP for more complex interactions. We ignore everything
                // by text data here but a more sophisticated parser could be written to handle everything correctly.
                break;
            }
          }

          controller.enqueue({
            type: ResponseType.END,
          });

          controller.close();
        } catch (error) {
          console.error(error);
        }
      },
    });
  }
}
