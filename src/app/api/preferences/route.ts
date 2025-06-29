import getDatastore from '@lib/datastore';

export const runtime = 'edge';

const datastore = getDatastore();

export async function GET(req: Request) {
  const { userId } = await req.json();
  if (!userId) {
    return new Response('User ID is required.', { status: 400 });
  }

  const country = datastore.read(userId, 'country');
  const continent = datastore.read(userId, 'continent');
  const destination = datastore.read(userId, 'destination');

  return new Response(
    JSON.stringify({
      country,
      continent,
      destination,
    })
  );
}
