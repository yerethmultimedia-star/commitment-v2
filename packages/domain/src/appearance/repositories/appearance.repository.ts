import { Appearance } from '../models/appearance.model.js';

export interface AppearanceRepository {
  /**
   * Loads the appearance settings for a specific user (or device if no user is provided).
   */
  get(userId: string): Promise<Appearance>;

  /**
   * Saves the appearance settings.
   */
  save(appearance: Appearance): Promise<void>;
}
