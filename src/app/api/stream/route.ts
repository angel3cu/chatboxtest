import getChatbot from '@lib/chatbot';
import Datastore from '@lib/datastore';

export const runtime = 'edge';

const datastore = new Datastore();
const chatbot = getChatbot();

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

    const stream = previousResponseId
      ? await chatbot.prompt(message, undefined, previousResponseId)
      : await chatbot.prompt(message);

    return new Response(
      stream.pipeThrough(
        new TransformStream(
          {
            transform(chunk, controller) {
              try {
                switch (chunk.type) {
                  case 'metadata':
                    datastore.write(userId, 'previousResponseId', chunk.id);
                    break;

                  case 'text':
                    controller.enqueue(chunk.text);
                    break;

                  default:
                    console.warn('Unknown chunk type:', chunk.type);
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
