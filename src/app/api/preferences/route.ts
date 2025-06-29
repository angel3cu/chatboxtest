import getDatastore from '@lib/datastore';

// Using Node.js so that the Datastore is shared across the app. When a normal external database is used, we can switch
// this to 'edge', as requested.
export const runtime = 'nodejs';

const datastore = getDatastore();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
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
