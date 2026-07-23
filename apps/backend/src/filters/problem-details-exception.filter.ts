import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { RequestWithIds } from '../middleware/request-id.middleware';
import { OptimisticConcurrencyError } from '../infrastructure/errors/optimistic-concurrency.error';

@Catch()
export class ProblemDetailsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithIds>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred on the server.';
    let type = 'about:blank';
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse();

      if (typeof resContent === 'string') {
        detail = resContent;
      } else if (typeof resContent === 'object' && resContent !== null) {
        const obj = resContent as Record<string, unknown>;

        if (typeof obj.error === 'string') {
          title = obj.error;
        } else {
          title = exception.name;
        }

        if (Array.isArray(obj.message)) {
          detail = obj.message.map((m) => String(m)).join(', ');
        } else if (typeof obj.message === 'string') {
          detail = obj.message;
        }

        if (obj.errors !== undefined) {
          errors = obj.errors;
        }
      }
      type = `https://httpstatuses.io/${status}`;
    } else if (exception instanceof OptimisticConcurrencyError) {
      // Single, centralized mapping (AR-028) — deliberately not duplicated
      // per-controller like the *StateConflictError classes, since this is
      // one generic infrastructure concern shared identically across all 4
      // aggregates, not aggregate-specific domain state.
      status = HttpStatus.CONFLICT;
      title = exception.name;
      detail = exception.message;
      type = `https://httpstatuses.io/${status}`;
    } else if (exception instanceof Error) {
      detail = exception.message;
      title = exception.name;
    }

    const problemResponse = {
      type,
      title,
      status,
      detail,
      instance: request.url ?? '',
      timestamp: new Date().toISOString(),
      requestId: request.requestId ?? '',
      correlationId: request.correlationId ?? '',
      ...(errors !== undefined ? { errors } : {}),
    };

    response
      .status(status)
      .header('Content-Type', 'application/problem+json')
      .json(problemResponse);
  }
}
