export class CommitmentAlreadyActiveError extends Error {
  public readonly code = 'COMMITMENT_ALREADY_ACTIVE';
  constructor() {
    super('Commitment is already in Active state.');
    this.name = 'CommitmentAlreadyActiveError';
    Object.freeze(this);
  }
}

export class InvalidCommitmentTitleError extends Error {
  public readonly code = 'INVALID_COMMITMENT_TITLE';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCommitmentTitleError';
    Object.freeze(this);
  }
}

export class InvalidCommitmentDescriptionError extends Error {
  public readonly code = 'INVALID_COMMITMENT_DESCRIPTION';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCommitmentDescriptionError';
    Object.freeze(this);
  }
}

export class CommitmentRequiresIdentityError extends Error {
  public readonly code = 'COMMITMENT_REQUIRES_IDENTITY';
  constructor() {
    super('Commitment registration requires a valid IdentityId.');
    this.name = 'CommitmentRequiresIdentityError';
    Object.freeze(this);
  }
}

export class InvalidCommitmentStateTransitionError extends Error {
  public readonly code = 'INVALID_COMMITMENT_STATE_TRANSITION';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCommitmentStateTransitionError';
    Object.freeze(this);
  }
}

export class CommitmentAlreadyCompletedError extends Error {
  public readonly code = 'COMMITMENT_ALREADY_COMPLETED';
  constructor() {
    super('Commitment is already completed.');
    this.name = 'CommitmentAlreadyCompletedError';
    Object.freeze(this);
  }
}

export class CommitmentAlreadyCancelledError extends Error {
  public readonly code = 'COMMITMENT_ALREADY_CANCELLED';
  constructor() {
    super('Commitment is already cancelled.');
    this.name = 'CommitmentAlreadyCancelledError';
    Object.freeze(this);
  }
}

export class CommitmentCannotBePausedError extends Error {
  public readonly code = 'COMMITMENT_CANNOT_BE_PAUSED';
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentCannotBePausedError';
    Object.freeze(this);
  }
}

export class CommitmentCannotBeResumedError extends Error {
  public readonly code = 'COMMITMENT_CANNOT_BE_RESUMED';
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentCannotBeResumedError';
    Object.freeze(this);
  }
}

export class CommitmentCannotBeCompletedError extends Error {
  public readonly code = 'COMMITMENT_CANNOT_BE_COMPLETED';
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentCannotBeCompletedError';
    Object.freeze(this);
  }
}

export class CommitmentCannotBeRenamedError extends Error {
  public readonly code = 'COMMITMENT_CANNOT_BE_RENAMED';
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentCannotBeRenamedError';
    Object.freeze(this);
  }
}

export class CommitmentCannotBeDescriptionUpdatedError extends Error {
  public readonly code = 'COMMITMENT_CANNOT_BE_DESCRIPTION_UPDATED';
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentCannotBeDescriptionUpdatedError';
    Object.freeze(this);
  }
}

export class CommitmentActivationRequirementsNotMetError extends Error {
  public readonly code = 'COMMITMENT_ACTIVATION_REQUIREMENTS_NOT_MET';
  constructor(message: string) {
    super(message);
    this.name = 'CommitmentActivationRequirementsNotMetError';
    Object.freeze(this);
  }
}

export class InvalidCommitmentPriorityError extends Error {
  public readonly code = 'INVALID_COMMITMENT_PRIORITY';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCommitmentPriorityError';
    Object.freeze(this);
  }
}
