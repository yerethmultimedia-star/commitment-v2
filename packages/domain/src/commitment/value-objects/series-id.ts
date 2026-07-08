import { ValueObject } from '../../shared/value-object.js';

interface SeriesIdProps {
  value: string;
}

export class SeriesId extends ValueObject<SeriesIdProps> {
  private constructor(props: SeriesIdProps) {
    super(props);
  }

  public static create(value: string): SeriesId {
    if (!value || value.trim().length === 0) {
      throw new Error('SeriesId cannot be empty');
    }
    return new SeriesId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
