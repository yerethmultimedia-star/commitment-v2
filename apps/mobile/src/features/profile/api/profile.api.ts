import { isDemoModeActive } from '@/core/demo/demo-mode.store';
import { demoUser } from '@/core/demo/demo-data';
import { ProfileModel } from '../models/profile.model';

// No real Identity/Profile backend module exists yet — same situation as
// Goal (see TECH_DEBT.md TD-10/A1). Demo Mode is a data-source switch
// checked here, at the API boundary (components/hooks never branch on it
// directly, per demo-mode.store.ts's own contract) — but unlike
// tasks.api.ts/goals.api.ts, the "real" branch here has nothing to call:
// there's no backend to fetch a real name/email/plan from. It returns an
// honest, minimal profile instead of silently reusing the demo identity —
// `isDemoProfile: false` is what lets the UI avoid presenting fabricated
// personal data as real (found live 2026-07-16: the old profile.tsx showed
// "Jordan Rivera" even with Demo Mode off).
export const profileApi = {
  getCurrentUser: async (identityId: string): Promise<ProfileModel> => {
    if (isDemoModeActive()) {
      return {
        identityId,
        name: demoUser.name,
        email: demoUser.email,
        avatarInitials: demoUser.avatarInitials,
        plan: demoUser.plan,
        memberSince: demoUser.memberSince,
        planRenewalDate: demoUser.planRenewalDate,
        isDemoProfile: true,
      };
    }

    return {
      identityId,
      name: null,
      email: null,
      avatarInitials: identityId.slice(0, 2).toUpperCase(),
      plan: null,
      memberSince: null,
      planRenewalDate: null,
      isDemoProfile: false,
    };
  },
};
