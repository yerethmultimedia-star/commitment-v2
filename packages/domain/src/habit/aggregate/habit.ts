import { AggregateRoot } from '../../shared/aggregate-root.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { IdentityId } from '../../identity/value-objects/identity-id.js';
import { HabitId } from '../value-objects/habit-id.js';
import { HabitTitle } from '../value-objects/habit-title.js';
import { HabitRecurrence, HabitRecurrenceType } from '../value-objects/habit-recurrence.js';
import { HabitReminderTime } from '../value-objects/habit-reminder-time.js';
import { computeHabitStreak } from '../engine/compute-habit-streak.js';
import { toDateOnlyString } from '../engine/date-utils.internal.js';

import { HabitRegisteredEvent } from '../events/habit-registered.event.js';
import { HabitEditedEvent } from '../events/habit-edited.event.js';
import { HabitCompletedEvent } from '../events/habit-completed.event.js';
import { HabitUncompletedEvent } from '../events/habit-uncompleted.event.js';
import { HabitPostponedEvent } from '../events/habit-postponed.event.js';
import { HabitOccurrenceMissedEvent } from '../events/habit-occurrence-missed.event.js';
import { HabitEnabledEvent } from '../events/habit-enabled.event.js';
import { HabitDisabledEvent } from '../events/habit-disabled.event.js';
import { HabitArchivedEvent } from '../events/habit-archived.event.js';

import { HabitAlreadyArchivedError, HabitCannotBeEditedError, InvalidPostponeDurationError } from '../errors/habit-errors.js';

export enum HabitState {
  Active = 'Active',
  Disabled = 'Disabled',
  Archived = 'Archived',
}

export interface HabitProps {
  identityId: IdentityId;
  title: HabitTitle;
  recurrence: HabitRecurrence;
  reminderTime: HabitReminderTime;
  state: HabitState;
  goalId: string | null;
  /** Reference point for recurrence math (e.g. Biweekly week-parity). Starts at createdAt, reset to "now" whenever recurrence newly becomes Biweekly. */
  recurrenceAnchorDate: Date;
  lastCompletedDate: string | null;
  currentStreakDays: number;
  missedStreakGrace: 0 | 1;
  postponedUntil: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Habit extends AggregateRoot<HabitId> {
  private _props!: HabitProps;

  private constructor(id: HabitId) {
    super(id);
  }

  // Getters
  public get identityId(): IdentityId { return this._props.identityId; }
  public get title(): HabitTitle { return this._props.title; }
  public get recurrence(): HabitRecurrence { return this._props.recurrence; }
  public get reminderTime(): HabitReminderTime { return this._props.reminderTime; }
  public get state(): HabitState { return this._props.state; }
  public get goalId(): string | null { return this._props.goalId; }
  public get recurrenceAnchorDate(): Date { return this._props.recurrenceAnchorDate; }
  public get lastCompletedDate(): string | null { return this._props.lastCompletedDate; }
  public get currentStreakDays(): number { return this._props.currentStreakDays; }
  public get postponedUntil(): string | null { return this._props.postponedUntil; }
  public get createdAt(): Date { return this._props.createdAt; }
  public get updatedAt(): Date { return this._props.updatedAt; }

  // Behaviors
  public static register(
    id: HabitId,
    identityId: IdentityId,
    title: HabitTitle,
    recurrence: HabitRecurrence,
    reminderTime: HabitReminderTime,
    goalId: string | null,
    now: Date
  ): Habit {
    const habit = new Habit(id);
    const event = new HabitRegisteredEvent(id.value, {
      habitId: id.value,
      identityId: identityId.value,
      title: title.value,
      recurrenceType: recurrence.type,
      daysOfWeek: recurrence.daysOfWeek,
      dayOfMonth: recurrence.dayOfMonth,
      month: recurrence.month,
      reminderHour: reminderTime.hour,
      reminderMinute: reminderTime.minute,
      goalId: goalId ?? undefined,
      createdAt: now.toISOString(),
    });
    habit.recordEvent(event);
    return habit;
  }

  public edit(now: Date, title?: HabitTitle, recurrence?: HabitRecurrence, reminderTime?: HabitReminderTime): void {
    this.ensureNotArchived();

    let hasChanges = false;
    if (title && title.value !== this._props.title.value) hasChanges = true;
    if (recurrence && !recurrence.equals(this._props.recurrence)) hasChanges = true;
    if (reminderTime && !reminderTime.equals(this._props.reminderTime)) hasChanges = true;
    if (!hasChanges) return;

    const becomingBiweekly = !!recurrence
      && recurrence.type === HabitRecurrenceType.Biweekly
      && this._props.recurrence.type !== HabitRecurrenceType.Biweekly;

    const event = new HabitEditedEvent(
      this.id.value,
      {
        habitId: this.id.value,
        title: title ? title.value : undefined,
        recurrenceType: recurrence ? recurrence.type : undefined,
        daysOfWeek: recurrence ? recurrence.daysOfWeek : undefined,
        dayOfMonth: recurrence ? recurrence.dayOfMonth : undefined,
        month: recurrence ? recurrence.month : undefined,
        reminderHour: reminderTime ? reminderTime.hour : undefined,
        reminderMinute: reminderTime ? reminderTime.minute : undefined,
        resetRecurrenceAnchor: becomingBiweekly,
      },
      now.toISOString()
    );
    this.recordEvent(event);
  }

  public complete(onDate: Date, now: Date): void {
    this.ensureNotArchived();
    const onDateStr = toDateOnlyString(onDate);

    const result = computeHabitStreak({
      recurrence: this._props.recurrence,
      anchorDate: this._props.recurrenceAnchorDate,
      previousStreak: this._props.currentStreakDays,
      missedGraceUsed: this._props.missedStreakGrace === 1,
      lastCompletedDate: this._props.lastCompletedDate,
      occurredOn: onDateStr,
      completed: true,
    });

    if (result.lastCompletedDate === this._props.lastCompletedDate && result.streak === this._props.currentStreakDays) {
      return; // already completed today — no-op
    }

    const event = new HabitCompletedEvent(
      this.id.value,
      {
        habitId: this.id.value,
        completedOn: onDateStr,
        streakDays: result.streak,
        graceUsed: result.graceUsed,
      },
      now.toISOString()
    );
    this.recordEvent(event);
  }

  /** Undoes a mis-tap completion. Does not restore an earlier completion date — this aggregate doesn't keep full completion history. */
  public uncomplete(onDate: Date, now: Date): void {
    this.ensureNotArchived();
    const onDateStr = toDateOnlyString(onDate);
    if (this._props.lastCompletedDate !== onDateStr) return; // nothing to undo

    const event = new HabitUncompletedEvent(
      this.id.value,
      { habitId: this.id.value, onDate: onDateStr },
      now.toISOString()
    );
    this.recordEvent(event);
  }

  /**
   * Snoozes the reminder by `minutes`. If the snoozed time would cross into
   * the next calendar day, today's occurrence is marked missed instead of
   * silently rolling into tomorrow (confirmed product behavior — matches
   * an iOS alarm snooze, not a task deadline).
   */
  public postpone(minutes: number, now: Date): void {
    this.ensureNotArchived();
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new InvalidPostponeDurationError('Postpone duration must be a positive whole number of minutes.');
    }

    const candidate = new Date(now.getTime() + minutes * 60000);
    const crossesMidnight = candidate.getFullYear() !== now.getFullYear()
      || candidate.getMonth() !== now.getMonth()
      || candidate.getDate() !== now.getDate();

    if (crossesMidnight) {
      const onDateStr = toDateOnlyString(now);
      const result = computeHabitStreak({
        recurrence: this._props.recurrence,
        anchorDate: this._props.recurrenceAnchorDate,
        previousStreak: this._props.currentStreakDays,
        missedGraceUsed: this._props.missedStreakGrace === 1,
        lastCompletedDate: this._props.lastCompletedDate,
        occurredOn: onDateStr,
        completed: false,
      });

      const event = new HabitOccurrenceMissedEvent(
        this.id.value,
        {
          habitId: this.id.value,
          missedOn: onDateStr,
          streakDays: result.streak,
          graceUsed: result.graceUsed,
        },
        now.toISOString()
      );
      this.recordEvent(event);
      return;
    }

    const event = new HabitPostponedEvent(
      this.id.value,
      { habitId: this.id.value, postponedUntil: candidate.toISOString() },
      now.toISOString()
    );
    this.recordEvent(event);
  }

  public enable(): void {
    this.ensureNotArchived();
    if (this._props.state === HabitState.Active) return;
    this.recordEvent(new HabitEnabledEvent(this.id.value, { habitId: this.id.value }));
  }

  public disable(): void {
    this.ensureNotArchived();
    if (this._props.state === HabitState.Disabled) return;
    this.recordEvent(new HabitDisabledEvent(this.id.value, { habitId: this.id.value }));
  }

  public archive(): void {
    if (this._props.state === HabitState.Archived) {
      throw new HabitAlreadyArchivedError('Habit is already archived');
    }
    this.recordEvent(new HabitArchivedEvent(this.id.value, { habitId: this.id.value }));
  }

  private ensureNotArchived(): void {
    if (this._props.state === HabitState.Archived) {
      throw new HabitCannotBeEditedError('Operation not allowed on an archived habit');
    }
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.name === 'habit.registered') {
      const payload = (event as HabitRegisteredEvent).payload;
      this._props = {
        identityId: new IdentityId(payload.identityId),
        title: new HabitTitle(payload.title),
        recurrence: HabitRecurrence.fromProps({
          type: payload.recurrenceType as HabitRecurrenceType,
          daysOfWeek: payload.daysOfWeek,
          dayOfMonth: payload.dayOfMonth,
          month: payload.month,
        }),
        reminderTime: HabitReminderTime.of(payload.reminderHour, payload.reminderMinute),
        state: HabitState.Active,
        goalId: payload.goalId ?? null,
        recurrenceAnchorDate: new Date(payload.createdAt),
        lastCompletedDate: null,
        currentStreakDays: 0,
        missedStreakGrace: 0,
        postponedUntil: null,
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.createdAt),
      };
    } else if (event.name === 'habit.edited') {
      const payload = (event as HabitEditedEvent).payload;
      if (payload.title !== undefined) this._props.title = new HabitTitle(payload.title);
      if (payload.recurrenceType !== undefined) {
        this._props.recurrence = HabitRecurrence.fromProps({
          type: payload.recurrenceType as HabitRecurrenceType,
          daysOfWeek: payload.daysOfWeek ?? [],
          dayOfMonth: payload.dayOfMonth ?? null,
          month: payload.month ?? null,
        });
      }
      if (payload.reminderHour !== undefined && payload.reminderMinute !== undefined) {
        this._props.reminderTime = HabitReminderTime.of(payload.reminderHour, payload.reminderMinute);
      }
      if (payload.resetRecurrenceAnchor) {
        this._props.recurrenceAnchorDate = new Date(event.metadata.occurredAt);
      }
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'habit.completed') {
      const payload = (event as HabitCompletedEvent).payload;
      this._props.lastCompletedDate = payload.completedOn;
      this._props.currentStreakDays = payload.streakDays;
      this._props.missedStreakGrace = payload.graceUsed ? 1 : 0;
      this._props.postponedUntil = null;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'habit.uncompleted') {
      this._props.lastCompletedDate = null;
      this._props.currentStreakDays = Math.max(0, this._props.currentStreakDays - 1);
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'habit.postponed') {
      const payload = (event as HabitPostponedEvent).payload;
      this._props.postponedUntil = payload.postponedUntil;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'habit.occurrence_missed') {
      const payload = (event as HabitOccurrenceMissedEvent).payload;
      this._props.currentStreakDays = payload.streakDays;
      this._props.missedStreakGrace = payload.graceUsed ? 1 : 0;
      this._props.postponedUntil = null;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'habit.enabled') {
      this._props.state = HabitState.Active;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'habit.disabled') {
      this._props.state = HabitState.Disabled;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    } else if (event.name === 'habit.archived') {
      this._props.state = HabitState.Archived;
      this._props.updatedAt = new Date(event.metadata.occurredAt);
    }
  }
}
