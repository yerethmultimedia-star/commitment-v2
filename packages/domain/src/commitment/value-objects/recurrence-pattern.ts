import { ValueObject } from '../../shared/value-object.js';

export enum RecurrenceType {
  None = 'None',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
}

interface RecurrencePatternProps {
  type: RecurrenceType;
}

export class RecurrencePattern extends ValueObject<RecurrencePatternProps> {
  private constructor(props: RecurrencePatternProps) {
    super(props);
  }

  public static create(type: RecurrenceType = RecurrenceType.None): RecurrencePattern {
    return new RecurrencePattern({ type });
  }

  get type(): RecurrenceType {
    return this.props.type;
  }

  public isRecurring(): boolean {
    return this.props.type !== RecurrenceType.None;
  }
}
