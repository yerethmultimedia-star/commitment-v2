import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { RequestContext } from '@commitment/shared';
import { ValidateSessionQuery } from '../application/queries/validate-session.query';
import type { ValidatedIdentity } from '../application/queries/validate-session.handler';

/**
 * AR-043 Paso 5 (integration #1 — Request Pipeline) / Fase 4B.4. Scope deliberately limited to
 * exactly what Paso 5 approved: (1) extract the token, (2) invoke `ValidateSessionQuery`, (3)
 * populate `RequestContext`, (4) translate to 401. It does not touch `SessionRepository` or
 * `TokenServicePort` directly, does not know JWT — all of that stays behind `ValidateSessionQuery`.
 *
 * Replaces `RequestContextMiddleware`'s unverified `req.headers['x-identity-id']` read (the
 * original AR-043 finding) by overwriting the same `RequestContext` store's `identityId` with the
 * verified one — the middleware's plain object is still the live AsyncLocalStorage store when
 * this Guard runs, so mutating it here is visible to every handler downstream.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly queryBus: QueryBus) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const validated = await this.queryBus.execute<
      ValidateSessionQuery,
      ValidatedIdentity | null
    >(new ValidateSessionQuery(token));
    if (!validated) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const ctx = RequestContext.current();
    if (ctx) {
      ctx.identityId = validated.identityId;
    }
    // Logout needs the sessionId, not just identityId — attaching it here avoids re-verifying the
    // token a second time in the controller for the one endpoint that needs it (Paso 5 scope: the
    // Guard still only calls ValidateSessionQuery once per request).
    (request as Request & { sessionId?: string }).sessionId =
      validated.sessionId;

    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers['authorization'];
    if (!header || Array.isArray(header)) {
      return null;
    }
    const [scheme, value] = header.split(' ');
    if (scheme !== 'Bearer' || !value) {
      return null;
    }
    return value;
  }
}
