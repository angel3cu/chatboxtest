import getChatbot, { ChatbotFunctions } from '@lib/chatbot';
import { ChatbotResponseChunk, FunctionResponseChunk, ResponseType } from '@lib/chatbot/response';
import getDatastore from '@lib/datastore';

export const runtime = 'edge';

const instructions =
  'You are helping the user with questions about geography. Before starting, ask the user for their favourite ' +
  'country, continent and destination. Do not talk to the user without this information. Do not answer and query ' +
  'that is not related to geography.';
const functions: ChatbotFunctions = {
  get_favourite_country: {
    instructions: "Get the user's favourite country.",
    properties: {
      country: {
        type: 'string',
        description: "The user's favourite country.",
        required: true,
      },
    },
  },
  get_favourite_continent: {
    instructions: "Get the user's favourite continent.",
    properties: {
      continent: {
        type: 'string',
        description: "The user's favourite continent.",
        required: true,
      },
    },
  },
  get_favourite_destination: {
    instructions: "Get the user's favourite destination.",
    properties: {
      destination: {
        type: 'string',
        description: "The user's favourite destination.",
        required: true,
      },
    },
  },
};

const chatbot = getChatbot();
const datastore = getDatastore();

const updatePreferences = (userId: string, response: FunctionResponseChunk) => {
  const definition = functions[response.name];

  for (const property of Object.keys(definition.properties)) {
    const value = response.output[property];

    if (value === undefined) {
      console.warn(`Property ${property} is missing in the response.`);
      continue;
    }

    datastore.write(userId, property, value?.toString());
  }
};

const generateTransformer = (userId: string) => {
  const functionCallIds: string[] = [];

  return async (chunk: ChatbotResponseChunk, controller: ReadableStreamDefaultController<string>) => {
    try {
      switch (chunk.type) {
        case ResponseType.METADATA:
          datastore.write(userId, 'previousResponseId', chunk.id);
          break;

        case ResponseType.TEXT:
          controller.enqueue(chunk.text);
          break;

        case ResponseType.IMAGE:
          console.warn('Image data not currently handled.');
          break;

        case ResponseType.FUNCTION:
          updatePreferences(userId, chunk);
          functionCallIds.push(chunk.callId);
          break;

        case ResponseType.END:
          {
            if (functionCallIds.length === 0) {
              controller.close();
              return;
            }

            const response = await chatbot.prompt(
              functionCallIds.map((functionCallId) => ({
                callId: functionCallId,
                output: 'success',
              })),
              {
                instructions,
                previousResponseId: datastore.read(userId, 'previousResponseId'),
                functions,
              }
            );
            const reader = response.getReader();
            const transformer = generateTransformer(userId);

            for (let { value, done } = await reader.read(); !done; { value, done } = await reader.read()) {
              if (!value) {
                continue;
              }

              await transformer(value, controller);
            }
          }

          break;

        default:
          console.warn('Unknown chunk type!');
          break;
      }
    } catch (error) {
      console.error('Error processing chunk:', error);
      controller.error(error);
    }
  };
};

export async function POST(req: Request) {
  try {
    const { userId, message } = await req.json();

    if (!userId) {
      return new Response('User ID is required.', { status: 400 });
    }
    if (typeof message !== 'string') {
      return new Response('The server accepts text message from the user.', { status: 400 });
    }

    const previousResponseId = datastore.read(userId, 'previousResponseId');
    console.log(`Previous response ID for user ${userId}:`, previousResponseId);

    const country = datastore.read(userId, 'country');
    const continent = datastore.read(userId, 'continent');
    const destination = datastore.read(userId, 'destination');

    console.log(`User ${userId} preferences:`, { country, continent, destination });

    const stream = await chatbot.prompt(message, {
      instructions,
      previousResponseId,
      functions,
    });
    const reader = stream.getReader();

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          const transformer = generateTransformer(userId);

          for (let { value, done } = await reader.read(); !done; { value, done } = await reader.read()) {
            if (!value) {
              continue;
            }

            await transformer(value, controller);
          }
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error(error);
    return new Response('An error occurred while processing your request.', { status: 500 });
  }
}
