export interface ProfileModel {
  identityId: string;
  /** null when no real Identity/Profile backend exists yet — see profile.api.ts. */
  name: string | null;
  email: string | null;
  avatarInitials: string;
  plan: string | null;
  memberSince: string | null;
  planRenewalDate: string | null;
  /** True only when this data came from the demo dataset — gates the UI from presenting it as real. */
  isDemoProfile: boolean;
}
