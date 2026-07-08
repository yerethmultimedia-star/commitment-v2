import { ValueObject } from '../../shared/value-object.js';

interface TargetDateProps {
  value: Date;
}

export class TargetDate extends ValueObject<TargetDateProps> {
  private constructor(props: TargetDateProps) {
    super(props);
  }

  public static create(dateString: string | Date): TargetDate {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid TargetDate');
    }
    return new TargetDate({ value: date });
  }

  get value(): Date {
    return this.props.value;
  }

  public toISOString(): string {
    return this.props.value.toISOString();
  }
}
