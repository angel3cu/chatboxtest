// NOTE: This is a fake in-memory data store to save information for different users.

export class Datastore {
  private data = new Map<string, Map<string, string>>();

  read(userId: string, key: string): string | undefined {
    return this.data.get(userId)?.get(key);
  }

  write(userId: string, key: string, value: string | undefined): void {
    const userData: Map<string, string> = this.data.get(userId) ?? new Map();

    if (value === undefined) {
      userData.delete(key);
    } else {
      userData.set(key, value);
    }

    this.data.set(userId, userData);
  }
}

let datastore: Datastore | null = null;

export default function getDatastore(): Datastore {
  if (!datastore) {
    datastore = new Datastore();
  }

  return datastore;
}
