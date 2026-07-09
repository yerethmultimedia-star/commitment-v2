import { DashboardLayout } from './DashboardLayout.js';

export interface DashboardLayoutRepository {
  get(userId: string): Promise<DashboardLayout | null>;
  save(layout: DashboardLayout): Promise<void>;
}
