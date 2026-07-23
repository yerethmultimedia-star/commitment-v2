import { Session } from '../aggregate/session.js';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(sessionId: string): Promise<Session | null>;
}
