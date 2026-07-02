import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export interface RequestWithIds extends Request {
  requestId?: string;
  correlationId?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithIds, res: Response, next: NextFunction) {
    const correlationIdHeader =
      req.header('x-correlation-id') || req.header('correlation-id');
    const requestIdHeader =
      req.header('x-request-id') || req.header('request-id');

    const correlationId = correlationIdHeader || crypto.randomUUID();
    const requestId = requestIdHeader || crypto.randomUUID();

    req.requestId = requestId;
    req.correlationId = correlationId;

    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
