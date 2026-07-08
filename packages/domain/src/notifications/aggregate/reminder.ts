export enum ReminderStatus {
  Scheduled = 'Scheduled',
  Suspended = 'Suspended',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export class Reminder {
  private _id: string;
  private _commitmentId: string;
  private _identityId: string;
  private _scheduledFor: Date;
  private _status: ReminderStatus;
  private _attempts: number;
  private _provider: string | null;
  private _lastAttemptAt: Date | null;
  private _nextAttemptAt: Date | null;
  private _errorMessage: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: string,
    commitmentId: string,
    identityId: string,
    scheduledFor: Date,
    status: ReminderStatus,
    attempts: number,
    provider: string | null,
    lastAttemptAt: Date | null,
    nextAttemptAt: Date | null,
    errorMessage: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this._id = id;
    this._commitmentId = commitmentId;
    this._identityId = identityId;
    this._scheduledFor = scheduledFor;
    this._status = status;
    this._attempts = attempts;
    this._provider = provider;
    this._lastAttemptAt = lastAttemptAt;
    this._nextAttemptAt = nextAttemptAt;
    this._errorMessage = errorMessage;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  public get id(): string { return this._id; }
  public get commitmentId(): string { return this._commitmentId; }
  public get identityId(): string { return this._identityId; }
  public get scheduledFor(): Date { return this._scheduledFor; }
  public get status(): ReminderStatus { return this._status; }
  public get attempts(): number { return this._attempts; }
  public get provider(): string | null { return this._provider; }
  public get lastAttemptAt(): Date | null { return this._lastAttemptAt; }
  public get nextAttemptAt(): Date | null { return this._nextAttemptAt; }
  public get errorMessage(): string | null { return this._errorMessage; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }

  // Factory
  public static create(
    id: string,
    commitmentId: string,
    identityId: string,
    scheduledFor: Date,
  ): Reminder {
    const now = new Date();
    return new Reminder(
      id,
      commitmentId,
      identityId,
      scheduledFor,
      ReminderStatus.Scheduled,
      0,
      null,
      null,
      null,
      null,
      now,
      now
    );
  }

  // Lifecycle Methods
  public schedule(targetDate: Date): void {
    if (this._status === ReminderStatus.Completed || this._status === ReminderStatus.Cancelled) {
      return; // Terminal state, ignore
    }
    this._scheduledFor = targetDate;
    this._status = ReminderStatus.Scheduled;
    this._updatedAt = new Date();
  }

  public suspend(): void {
    if (this._status === ReminderStatus.Completed || this._status === ReminderStatus.Cancelled) {
      return;
    }
    this._status = ReminderStatus.Suspended;
    this._updatedAt = new Date();
  }

  public resume(targetDate?: Date): void {
    if (this._status === ReminderStatus.Completed || this._status === ReminderStatus.Cancelled) {
      return;
    }
    if (targetDate) {
      this._scheduledFor = targetDate;
    }
    this._status = ReminderStatus.Scheduled;
    this._updatedAt = new Date();
  }

  public cancel(): void {
    if (this._status === ReminderStatus.Completed) {
      return;
    }
    this._status = ReminderStatus.Cancelled;
    this._updatedAt = new Date();
  }

  public complete(): void {
    if (this._status === ReminderStatus.Cancelled) {
      return;
    }
    this._status = ReminderStatus.Completed;
    this._updatedAt = new Date();
  }

  public recordAttempt(provider: string, errorMessage?: string): void {
    this._attempts += 1;
    this._provider = provider;
    this._lastAttemptAt = new Date();
    this._errorMessage = errorMessage || null;
    this._updatedAt = new Date();
    
    // Simplistic backoff or next attempt logic could go here
    if (errorMessage) {
      // e.g. add 5 minutes
      const next = new Date();
      next.setMinutes(next.getMinutes() + 5);
      this._nextAttemptAt = next;
    } else {
      this._nextAttemptAt = null;
    }
  }

  // Restore for repository
  public static restore(props: {
    id: string;
    commitmentId: string;
    identityId: string;
    scheduledFor: Date;
    status: ReminderStatus;
    attempts: number;
    provider: string | null;
    lastAttemptAt: Date | null;
    nextAttemptAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Reminder {
    return new Reminder(
      props.id,
      props.commitmentId,
      props.identityId,
      props.scheduledFor,
      props.status,
      props.attempts,
      props.provider,
      props.lastAttemptAt,
      props.nextAttemptAt,
      props.errorMessage,
      props.createdAt,
      props.updatedAt
    );
  }
}
