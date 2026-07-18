export class InvalidGoalTitleError extends Error {
  public readonly code = 'INVALID_GOAL_TITLE';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGoalTitleError';
    Object.freeze(this);
  }
}

export class InvalidGoalDescriptionError extends Error {
  public readonly code = 'INVALID_GOAL_DESCRIPTION';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGoalDescriptionError';
    Object.freeze(this);
  }
}

export class GoalRequiresIdentityError extends Error {
  public readonly code = 'GOAL_REQUIRES_IDENTITY';
  constructor() {
    super('Goal registration requires a valid IdentityId.');
    this.name = 'GoalRequiresIdentityError';
    Object.freeze(this);
  }
}

export class InvalidGoalStateTransitionError extends Error {
  public readonly code = 'INVALID_GOAL_STATE_TRANSITION';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGoalStateTransitionError';
    Object.freeze(this);
  }
}

export class GoalAlreadyCompletedError extends Error {
  public readonly code = 'GOAL_ALREADY_COMPLETED';
  constructor() {
    super('Goal is already completed.');
    this.name = 'GoalAlreadyCompletedError';
    Object.freeze(this);
  }
}

export class GoalAlreadyArchivedError extends Error {
  public readonly code = 'GOAL_ALREADY_ARCHIVED';
  constructor() {
    super('Goal is already archived.');
    this.name = 'GoalAlreadyArchivedError';
    Object.freeze(this);
  }
}

export class GoalActivationRequirementsNotMetError extends Error {
  public readonly code = 'GOAL_ACTIVATION_REQUIREMENTS_NOT_MET';
  constructor(message: string) {
    super(message);
    this.name = 'GoalActivationRequirementsNotMetError';
    Object.freeze(this);
  }
}
