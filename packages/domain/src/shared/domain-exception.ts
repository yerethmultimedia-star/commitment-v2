import { BusinessRule } from './business-rule.js';

export class BusinessRuleViolationException extends Error {
  public readonly rule: BusinessRule;

  constructor(rule: BusinessRule) {
    super(rule.message);
    this.name = 'BusinessRuleViolationException';
    this.rule = rule;
    
    const errorConstructor = Error as unknown as { captureStackTrace?: (target: Error, constructor: (...args: never[]) => unknown) => void };
    if (typeof errorConstructor.captureStackTrace === 'function') {
      errorConstructor.captureStackTrace(this, this.constructor as unknown as (...args: never[]) => unknown);
    }
  }
}
