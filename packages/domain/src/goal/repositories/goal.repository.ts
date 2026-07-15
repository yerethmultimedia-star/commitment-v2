import { Repository } from '../../shared/repository.interface.js';
import { Goal } from '../aggregate/goal.js';
import { GoalId } from '../value-objects/goal-id.js';

/**
 * Interface only — no backend implementation yet. Goal is created and
 * persisted client-side via the mobile app's demo adapter until a real
 * Goal module ships on the backend (tracked as a follow-up sprint).
 */
export interface GoalRepository extends Repository<Goal> {
  save(goal: Goal): Promise<void>;
  findById(id: GoalId): Promise<Goal | null>;
}
