import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenServicePort,
  VerifiedToken,
} from '../application/ports/token-service.port';

/**
 * AR-043 Paso 6A/6C, H-043.9 — JWT chosen for implementation convenience (`@nestjs/jwt`, Guards
 * already available since AR-001's finding), NOT for any architectural benefit: the design
 * already requires a live `SessionRepository` check on every `Validate Session` call (H-043.6),
 * so JWT's usual "verify without a store lookup" advantage does not apply here. Claims are
 * deliberately minimal (Paso 6A) — only `sessionId`/`identityId`, nothing else (no roles/profile
 * data). This is the ONLY file in the codebase allowed to import `@nestjs/jwt`'s `JwtService`.
 */
@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  public async issue(
    sessionId: string,
    identityId: string,
    expiresAt: Date,
  ): Promise<string> {
    const expiresInSeconds = Math.max(
      1,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );
    return this.jwtService.signAsync(
      { sessionId, identityId },
      { expiresIn: expiresInSeconds },
    );
  }

  public async verify(token: string): Promise<VerifiedToken | null> {
    try {
      const decoded = await this.jwtService.verifyAsync<{
        sessionId?: unknown;
        identityId?: unknown;
      }>(token);
      if (
        typeof decoded.sessionId !== 'string' ||
        typeof decoded.identityId !== 'string'
      ) {
        return null;
      }
      return { sessionId: decoded.sessionId, identityId: decoded.identityId };
    } catch {
      // Expired/malformed/invalid-signature tokens all resolve to "not verified" — Validate
      // Session (Paso 5) treats this identically to "no session," never a distinct error path.
      return null;
    }
  }
}
