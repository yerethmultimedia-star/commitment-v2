import { BusinessRule } from './business-rule.js';

export abstract class DomainError {
  public abstract readonly message: string;
  public abstract readonly code: string;
}

export class BusinessRuleViolation extends DomainError {
  public readonly message: string;
  public readonly code: string;
  public readonly rule: BusinessRule;

  constructor(rule: BusinessRule) {
    super();
    this.message = rule.message;
    this.code = rule.code || 'BUSINESS_RULE_VIOLATION';
    this.rule = rule;
    Object.freeze(this);
  }
}
