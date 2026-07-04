import { ValueObject } from '../value-object.js';

export class Money extends ValueObject<{ amount: number; currency: string }> {
  constructor(amount: number, currency = 'USD') {
    super({ amount, currency });
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get currency(): string {
    return this.props.currency;
  }
}
