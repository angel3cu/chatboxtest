import getChatbot from '@lib/chatbot';

export const runtime = 'edge';

const chatbot = getChatbot();

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (typeof message !== 'string') {
      return new Response('The server accepts text message from the user.', { status: 400 });
    }

    const stream = await chatbot.prompt(message);

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error(error);
    return new Response('An error occurred while processing your request.', { status: 500 });
  }
}
