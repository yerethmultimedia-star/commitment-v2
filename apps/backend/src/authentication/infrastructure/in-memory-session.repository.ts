import { Injectable } from '@nestjs/common';
import { Session, SessionRepository } from '@commitment/domain';

@Injectable()
export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, Session>();

  public async save(session: Session): Promise<void> {
    await Promise.resolve();
    this.sessions.set(session.id, session);
  }

  public async findById(sessionId: string): Promise<Session | null> {
    await Promise.resolve();
    return this.sessions.get(sessionId) || null;
  }
}
