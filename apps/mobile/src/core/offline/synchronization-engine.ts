import type { OfflineStorage } from './storage';
import type { OperationQueue } from './operation-queue';

/**
 * AR-048/D-048.1: the only component allowed to depend on both Storage and
 * OperationQueue. Real reconciliation is deferred until canonical backend
 * persistence exists — this interface freezes where that logic will live,
 * not what it does.
 */
export interface SynchronizationEngine {
  synchronize(): Promise<void>;
}

export class NoOpSynchronizationEngine implements SynchronizationEngine {
  constructor(
    private readonly storage: OfflineStorage,
    private readonly queue: OperationQueue,
  ) {}

  async synchronize(): Promise<void> {
    // Deliberately empty: real reconciliation against a canonical backend
    // is out of AR-048's scope (see D-048.1, Fase 4A). This method exists
    // so consumers can depend on the SynchronizationEngine contract now,
    // without any implementation decision being frozen prematurely.
  }
}
