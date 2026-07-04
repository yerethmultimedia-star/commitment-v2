import { BusinessRuleViolationException } from './domain-exception.js';

export interface BusinessRule {
  readonly message: string;
  readonly code?: string;
  isBroken(): boolean;
}

export class BusinessRuleValidator {
  public static check(rule: BusinessRule): void {
    if (rule.isBroken()) {
      throw new BusinessRuleViolationException(rule);
    }
  }
}
