import getChatbot from '@lib/chatbot';
import { ResponseType } from '@lib/chatbot/types';
import Datastore from '@lib/datastore';

export const runtime = 'edge';

const instructions =
  'You are helping the user with questions about geography. Before starting, ask the user for their favourite country, continent and destination. Do not talk to the user without this information.';

const chatbot = getChatbot();
const datastore = new Datastore();

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

    const stream = await chatbot.prompt(message, {
      instructions,
      previousResponseId,
    });

    return new Response(
      stream.pipeThrough(
        new TransformStream(
          {
            transform(chunk, controller) {
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

                  default:
                    console.warn('Unknown chunk type!');
                    break;
                }
              } catch (error) {
                console.error('Error processing chunk:', error);
                controller.error(error);
              }
            },
          },
          {
            highWaterMark: 1,
          }
        )
      ),
      {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response('An error occurred while processing your request.', { status: 500 });
  }
}
