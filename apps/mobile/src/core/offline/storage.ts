/**
 * AR-048/D-048.1: responsible exclusively for local state. Must not know
 * about the operation queue, synchronization, or the backend.
 */
export interface OfflineStorage<TRecord = unknown> {
  get(key: string): Promise<TRecord | null>;
  set(key: string, value: TRecord): Promise<void>;
  remove(key: string): Promise<void>;
}

export class InMemoryOfflineStorage<TRecord = unknown> implements OfflineStorage<TRecord> {
  private readonly records = new Map<string, TRecord>();

  async get(key: string): Promise<TRecord | null> {
    return this.records.get(key) ?? null;
  }

  async set(key: string, value: TRecord): Promise<void> {
    this.records.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.records.delete(key);
  }
}
