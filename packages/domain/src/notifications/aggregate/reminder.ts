import { DomainEvent } from '../../core/domain-event.interface.js';
import { ReminderQueuedEvent } from '../events/reminder-queued.event.js';
import { AggregateRoot } from '../../shared/aggregate-root.js';

export enum ReminderStatus {
  Scheduled = 'Scheduled',
  Queued = 'Queued',
  Processing = 'Processing',
  Suspended = 'Suspended',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
  Failed = 'Failed',
}

export class Reminder extends AggregateRoot<string> {
  private _commitmentId!: string;
  private _identityId!: string;
  private _scheduledFor!: Date;
  private _status!: ReminderStatus;
  private _attempts!: number;
  private _provider!: string | null;
  private _lastAttemptAt: Date | null = null;
  private _nextAttemptAt: Date | null = null;
  private _errorMessage: string | null = null;
  private _createdAt!: Date;
  private _updatedAt!: Date;

  private constructor(id: string) {
    super(id);
  }

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
    const reminder = new Reminder(id);
    reminder.recordEvent(
      new ReminderQueuedEvent(id, {
        reminderId: id,
        commitmentId,
        identityId,
        scheduledFor: scheduledFor.toISOString(),
      })
    );
    return reminder;
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'reminder.queued') {
      const payload = (event as ReminderQueuedEvent).payload;
      this._commitmentId = payload.commitmentId;
      this._identityId = payload.identityId;
      this._scheduledFor = new Date(payload.scheduledFor);
      this._status = ReminderStatus.Queued;
      this._attempts = 0;
      this._provider = null;
      this._createdAt = new Date(event.metadata.occurredAt);
      this._updatedAt = new Date(event.metadata.occurredAt);
    }
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

  public markQueued(): void {
    if (this._status !== ReminderStatus.Scheduled) {
      return;
    }
    this._status = ReminderStatus.Queued;
    this._updatedAt = new Date();
    this.recordEvent(
      new ReminderQueuedEvent(this.id, {
        reminderId: this.id,
        commitmentId: this.commitmentId,
        identityId: this.identityId,
        scheduledFor: this.scheduledFor.toISOString(),
      })
    );
  }

  public markProcessing(): void {
    if (this._status !== ReminderStatus.Queued) {
      return;
    }
    this._status = ReminderStatus.Processing;
    this._updatedAt = new Date();
  }

  public fail(errorMessage: string): void {
    this._status = ReminderStatus.Failed;
    this.recordAttempt(this._provider || 'unknown', errorMessage);
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
    const reminder = new Reminder(props.id);
    reminder._commitmentId = props.commitmentId;
    reminder._identityId = props.identityId;
    reminder._scheduledFor = props.scheduledFor;
    reminder._status = props.status;
    reminder._attempts = props.attempts;
    reminder._provider = props.provider;
    reminder._lastAttemptAt = props.lastAttemptAt;
    reminder._nextAttemptAt = props.nextAttemptAt;
    reminder._errorMessage = props.errorMessage;
    reminder._createdAt = props.createdAt;
    reminder._updatedAt = props.updatedAt;
    return reminder;
  }
}
