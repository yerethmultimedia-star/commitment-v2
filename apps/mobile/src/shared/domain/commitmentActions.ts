import type { CommitmentStatus } from '@/features/commitments/models/commitment.model';

export type CommitmentAction =
  | 'activate'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'cancel';

export interface ActionConfig {
  id: CommitmentAction;
  /** i18n key inside the 'commitments' namespace */
  labelKey: string;
  /** Tamagui theme/variant */
  variant: 'primary' | 'secondary' | 'destructive';
  /** Whether to prompt a confirmation dialog before executing */
  requiresConfirmation: boolean;
  /** Whether the action is potentially irreversible */
  destructive: boolean;
}

const ACTION_CONFIG: Record<CommitmentAction, ActionConfig> = {
  activate: {
    id: 'activate',
    labelKey: 'actions.activate',
    variant: 'primary',
    requiresConfirmation: false,
    destructive: false,
  },
  pause: {
    id: 'pause',
    labelKey: 'actions.pause',
    variant: 'secondary',
    requiresConfirmation: false,
    destructive: false,
  },
  resume: {
    id: 'resume',
    labelKey: 'actions.resume',
    variant: 'primary',
    requiresConfirmation: false,
    destructive: false,
  },
  complete: {
    id: 'complete',
    labelKey: 'actions.complete',
    variant: 'primary',
    requiresConfirmation: true,
    destructive: false,
  },
  cancel: {
    id: 'cancel',
    labelKey: 'actions.cancel',
    variant: 'destructive',
    requiresConfirmation: true,
    destructive: true,
  },
};

/**
 * Returns the allowed transitions from a given commitment status.
 * The UI must NEVER contain status conditionals; always call this function.
 */
const ALLOWED_TRANSITIONS: Record<CommitmentStatus, CommitmentAction[]> = {
  draft: ['activate', 'cancel'],
  active: ['pause', 'complete', 'cancel'],
  paused: ['resume', 'cancel'],
  completed: [],
  cancelled: [],
};

export function getAllowedActions(status: CommitmentStatus): ActionConfig[] {
  return ALLOWED_TRANSITIONS[status].map((id) => ACTION_CONFIG[id]);
}

// ─── Editable Fields ─────────────────────────────────────────────────────────

export type EditableField = 'title' | 'description' | 'targetDate' | 'recurrence';

/**
 * Returns which form fields may be edited for a given status.
 * The UI must NEVER contain status conditionals; always call this function.
 */
const EDITABLE_FIELDS: Record<CommitmentStatus, EditableField[]> = {
  draft:     ['title', 'description', 'targetDate', 'recurrence'],
  active:    ['description', 'targetDate'],
  paused:    ['description', 'targetDate'],
  completed: [],
  cancelled: [],
};

export function getEditableFields(status: CommitmentStatus): EditableField[] {
  return EDITABLE_FIELDS[status];
}

/** Returns true if at least one field is editable for the given status. */
export function isEditable(status: CommitmentStatus): boolean {
  return EDITABLE_FIELDS[status].length > 0;
}
