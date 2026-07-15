import { ValueObject } from '../../shared/value-object.js';
import { InvalidHabitReminderTimeError } from '../errors/habit-errors.js';

interface HabitReminderTimeProps {
  hour: number;
  minute: number;
}

/** Time-of-day a habit's reminder should fire, iOS-alarm-style — no date, no timezone (evaluated in the user's local time at fire time). */
export class HabitReminderTime extends ValueObject<HabitReminderTimeProps> {
  private constructor(props: HabitReminderTimeProps) {
    super(props);
  }

  public get hour(): number {
    return this.props.hour;
  }

  public get minute(): number {
    return this.props.minute;
  }

  public static of(hour: number, minute: number): HabitReminderTime {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      throw new InvalidHabitReminderTimeError('Reminder hour must be an integer between 0 and 23.');
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new InvalidHabitReminderTimeError('Reminder minute must be an integer between 0 and 59.');
    }
    return new HabitReminderTime({ hour, minute });
  }

  public toMinutesSinceMidnight(): number {
    return this.hour * 60 + this.minute;
  }
}
