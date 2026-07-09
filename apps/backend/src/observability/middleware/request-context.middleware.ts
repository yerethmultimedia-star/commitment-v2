import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@commitment/shared';
import * as crypto from 'crypto';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
    const requestId =
      (req.headers['x-request-id'] as string) || crypto.randomUUID();

    // causationId at the start of an HTTP request is typically the same as correlationId
    // since this request is the root cause of the subsequent operations
    const causationId =
      (req.headers['x-causation-id'] as string) || correlationId;

    // In a real app, identityId would be extracted from the JWT token via an AuthGuard
    // For now, we leave it undefined or try to extract from a dummy header if it existed
    const identityId = req.headers['x-identity-id'] as string | undefined;

    const data = {
      correlationId,
      causationId,
      requestId,
      identityId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
    };

    // Make correlationId available in response headers
    res.setHeader('x-correlation-id', correlationId);

    RequestContext.run(data, () => {
      next();
    });
  }
}
