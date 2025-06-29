// NOTE: This is a fake in-memory data store to save information for different users.

export default class Datastore {
  private data = new Map<string, Map<string, string>>();

  read(userId: string, key: string): string | undefined {
    return this.data.get(userId)?.get(key);
  }

  write(userId: string, key: string, value: string): void {
    const userData: Map<string, string> = this.data.get(userId) ?? new Map();
    userData.set(key, value);
  }
}
