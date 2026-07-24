/**
 * AR-048/D-048.1: responsible exclusively for pending operations. Must not
 * access storage directly, and must not know about the backend.
 */
export interface PendingOperation<TPayload = unknown> {
  readonly id: string;
  readonly payload: TPayload;
}

export interface OperationQueue<TPayload = unknown> {
  enqueue(operation: PendingOperation<TPayload>): Promise<void>;
  listPending(): Promise<readonly PendingOperation<TPayload>[]>;
  dequeue(id: string): Promise<void>;
}

export class InMemoryOperationQueue<TPayload = unknown> implements OperationQueue<TPayload> {
  private readonly pending: PendingOperation<TPayload>[] = [];

  async enqueue(operation: PendingOperation<TPayload>): Promise<void> {
    this.pending.push(operation);
  }

  async listPending(): Promise<readonly PendingOperation<TPayload>[]> {
    return [...this.pending];
  }

  async dequeue(id: string): Promise<void> {
    const index = this.pending.findIndex((operation) => operation.id === id);
    if (index !== -1) {
      this.pending.splice(index, 1);
    }
  }
}
