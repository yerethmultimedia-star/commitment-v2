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
