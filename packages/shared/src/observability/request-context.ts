import { AsyncLocalStorage } from 'async_hooks';
import * as crypto from 'crypto';

export interface RequestContextData {
  correlationId: string;
  causationId?: string;
  requestId?: string;
  identityId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  public static current(): RequestContextData | undefined {
    return asyncLocalStorage.getStore();
  }

  public static currentCorrelationId(): string | undefined {
    return this.current()?.correlationId;
  }

  public static currentCausationId(): string | undefined {
    return this.current()?.causationId;
  }

  public static run<R>(data: RequestContextData, callback: () => R): R {
    return asyncLocalStorage.run(data, callback);
  }

  public static runWithNewContext<R>(callback: () => R): R {
    const id = crypto.randomUUID();
    return this.run(
      {
        correlationId: id,
        causationId: id,
        requestId: id,
        timestamp: new Date().toISOString(),
      },
      callback
    );
  }
}
