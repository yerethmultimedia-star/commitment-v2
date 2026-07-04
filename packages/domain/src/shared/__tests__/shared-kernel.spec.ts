import { UniqueEntityId } from '../unique-entity-id.js';
import { ValueObject } from '../value-object.js';
import { Entity } from '../entity.js';
import { AggregateRoot } from '../aggregate-root.js';
import { BusinessRule, BusinessRuleValidator } from '../business-rule.js';
import { BusinessRuleViolationException } from '../domain-exception.js';
import { DomainError, BusinessRuleViolation } from '../domain-error.js';
import { Result } from '../result.js';
import { Specification } from '../specification.js';
import { DomainEvent } from '../../core/domain-event.interface.js';

// Import Primitives
import { Email } from '../primitives/email.js';
import { Percentage } from '../primitives/percentage.js';
import { PositiveNumber } from '../primitives/positive-number.js';
import { NonEmptyString } from '../primitives/non-empty-string.js';
import { Url } from '../primitives/url.js';
import { Money } from '../primitives/money.js';
import { Locale } from '../primitives/locale.js';
import { TimeZone } from '../primitives/time-zone.js';
import { Language } from '../primitives/language.js';

describe('Shared Kernel Primitives', () => {

  describe('UniqueEntityId', () => {
    it('should accept a valid UUID', () => {
      const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const id = new UniqueEntityId(uuid);
      expect(id.value).toBe(uuid);
    });

    it('should fail on invalid UUID', () => {
      expect(() => new UniqueEntityId('invalid-uuid')).toThrow();
    });

    it('should equate matching IDs', () => {
      const id1 = new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      const id2 = new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      expect(id1.equals(id2)).toBe(true);
    });

    it('should not equate non-matching IDs', () => {
      const id1 = new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      const id2 = new UniqueEntityId('a12bc34d-58cc-4372-a567-0e02b2c3d479');
      expect(id1.equals(id2)).toBe(false);
      expect(id1.equals(undefined)).toBe(false);
    });
  });

  describe('ValueObject', () => {
    class DummyVo extends ValueObject<{ a: number; b: string }> {
      constructor(props: { a: number; b: string }) {
        super(props);
      }
      public get a() { return this.props.a; }
    }

    it('should deep freeze properties', () => {
      const vo = new DummyVo({ a: 1, b: 'test' });
      expect(Object.isFrozen(vo.equals)).toBe(false); // Method not frozen
      expect(() => {
        const mutableVo = vo as unknown as { props: { a: number } };
        mutableVo.props.a = 2;
      }).toThrow();
    });

    it('should equate structurally matching value objects', () => {
      const vo1 = new DummyVo({ a: 1, b: 'test' });
      const vo2 = new DummyVo({ a: 1, b: 'test' });
      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should fail structural equality on differences', () => {
      const vo1 = new DummyVo({ a: 1, b: 'test' });
      const vo2 = new DummyVo({ a: 2, b: 'test' });
      expect(vo1.equals(vo2)).toBe(false);
      expect(vo1.equals(undefined)).toBe(false);
      expect(vo1.equals({} as unknown as DummyVo)).toBe(false);
    });
  });

  describe('Entity', () => {
    class DummyEntity extends Entity<UniqueEntityId> {
      constructor(id: UniqueEntityId) {
        super(id);
      }
    }

    it('should compare equality based on identifier reference', () => {
      const id = new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      const entity1 = new DummyEntity(id);
      const entity2 = new DummyEntity(id);
      expect(entity1.equals(entity2)).toBe(true);
      expect(entity1.equals(entity1)).toBe(true);
    });

    it('should return false for different entities or null', () => {
      const entity1 = new DummyEntity(new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479'));
      const entity2 = new DummyEntity(new UniqueEntityId('a12bc34d-58cc-4372-a567-0e02b2c3d479'));
      expect(entity1.equals(entity2)).toBe(false);
      expect(entity1.equals(undefined)).toBe(false);
      expect(entity1.equals({} as unknown as DummyEntity)).toBe(false);
    });
  });

  describe('AggregateRoot', () => {
    class DummyAggregate extends AggregateRoot<UniqueEntityId> {
      public state = '';
      constructor(id: UniqueEntityId) {
        super(id);
      }
      public executeSomeAction(): void {
        this.recordEvent({
          name: 'action.executed',
          metadata: {
            eventId: 'eventId',
            aggregateId: this.id.value,
            aggregateVersion: 1,
            eventVersion: 1,
            occurredAt: 'time',
            recordedAt: 'time',
            actorType: 'SYSTEM',
            actorId: 'system',
            correlationId: 'corr',
            causationId: 'caus',
            tenantId: null
          },
          payload: { action: 'done' }
        });
      }
      protected applyEvent(event: DomainEvent): void {
        this.state = (event.payload as { action: string }).action;
      }
    }

    it('should record uncommitted events and apply state changes', () => {
      const aggregate = new DummyAggregate(new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479'));
      expect(aggregate.getUncommittedEvents().length).toBe(0);
      aggregate.executeSomeAction();
      expect(aggregate.getUncommittedEvents().length).toBe(1);
      expect(aggregate.state).toBe('done');
    });

    it('should clear uncommitted events', () => {
      const aggregate = new DummyAggregate(new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479'));
      aggregate.executeSomeAction();
      aggregate.clearUncommittedEvents();
      expect(aggregate.getUncommittedEvents().length).toBe(0);
    });

    it('should load aggregates from history streams', () => {
      const aggregate = new DummyAggregate(new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479'));
      const mockEvent: DomainEvent = {
        name: 'action.executed',
        metadata: {
          eventId: 'eventId',
          aggregateId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          aggregateVersion: 10,
          eventVersion: 1,
          occurredAt: 'time',
          recordedAt: 'time',
          actorType: 'SYSTEM',
          actorId: 'system',
          correlationId: 'corr',
          causationId: 'caus',
          tenantId: null
        },
        payload: { action: 'hydrated' }
      };
      aggregate.loadFromHistory([mockEvent]);
      expect(aggregate.state).toBe('hydrated');
      expect(aggregate.getUncommittedEvents().length).toBe(0);
    });
  });

  describe('BusinessRule & BusinessRuleViolationException', () => {
    class DummyRule implements BusinessRule {
      public message = 'Rule was broken';
      public code = 'RULE_01';
      constructor(private readonly fail: boolean) {}
      public isBroken(): boolean {
        return this.fail;
      }
    }

    it('should check rules and pass if unbroken', () => {
      const rule = new DummyRule(false);
      expect(() => BusinessRuleValidator.check(rule)).not.toThrow();
    });

    it('should check rules and throw exception if broken', () => {
      const rule = new DummyRule(true);
      expect(() => BusinessRuleValidator.check(rule)).toThrow(BusinessRuleViolationException);
    });
  });

  describe('DomainError & BusinessRuleViolation', () => {
    class DummyRule implements BusinessRule {
      public message = 'Rule was broken';
      public code = 'RULE_01';
      public isBroken() { return true; }
    }

    class RuleNoCode implements BusinessRule {
      public message = 'Rule with no code';
      public isBroken() { return true; }
    }

    it('should capture rule parameters in BusinessRuleViolation', () => {
      const rule = new DummyRule();
      const err = new BusinessRuleViolation(rule);
      expect(err.message).toBe(rule.message);
      expect(err.code).toBe(rule.code);
      expect(err.rule).toBe(rule);
    });

    it('should fallback to default code in BusinessRuleViolation', () => {
      const rule = new RuleNoCode();
      const err = new BusinessRuleViolation(rule);
      expect(err.message).toBe(rule.message);
      expect(err.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(err.rule).toBe(rule);
    });
  });

  describe('Result Monad', () => {
    it('should handle ok Result outcomes', () => {
      const res = Result.ok<number>(42);
      expect(res.isSuccess).toBe(true);
      expect(res.isFailure).toBe(false);
      expect(res.value).toBe(42);
      expect(() => res.error).toThrow();
    });

    it('should handle void ok Result outcomes', () => {
      const res = Result.ok();
      expect(res.isSuccess).toBe(true);
      expect(res.value).toBeUndefined();
    });

    it('should handle fail Result outcomes', () => {
      class TestError extends DomainError {
        public message = 'fail message';
        public code = 'FAIL_CODE';
      }
      const err = new TestError();
      const res = Result.fail<number>(err);
      expect(res.isSuccess).toBe(false);
      expect(res.isFailure).toBe(true);
      expect(res.error).toBe(err);
      expect(() => res.value).toThrow();
    });
  });

  describe('Specification Pattern', () => {
    class SpecEqual extends Specification<number> {
      constructor(private readonly val: number) { super(); }
      public isSatisfiedBy(candidate: number): boolean {
        return candidate === this.val;
      }
    }

    it('should perform AND composition logic', () => {
      const isFive = new SpecEqual(5);
      const isEven = new class extends Specification<number> {
        public isSatisfiedBy(candidate: number) { return candidate % 2 === 0; }
      }();

      const fiveAndEven = isFive.and(isEven);
      expect(fiveAndEven.isSatisfiedBy(5)).toBe(false);
      expect(fiveAndEven.isSatisfiedBy(6)).toBe(false);
    });

    it('should perform OR composition logic', () => {
      const isFive = new SpecEqual(5);
      const isEven = new class extends Specification<number> {
        public isSatisfiedBy(candidate: number) { return candidate % 2 === 0; }
      }();

      const fiveOrEven = isFive.or(isEven);
      expect(fiveOrEven.isSatisfiedBy(5)).toBe(true);
      expect(fiveOrEven.isSatisfiedBy(6)).toBe(true);
      expect(fiveOrEven.isSatisfiedBy(7)).toBe(false);
    });

    it('should perform NOT composition logic', () => {
      const isFive = new SpecEqual(5);
      const notFive = isFive.not();
      expect(notFive.isSatisfiedBy(5)).toBe(false);
      expect(notFive.isSatisfiedBy(6)).toBe(true);
    });
  });

  describe('Domain Primitives (Stubs)', () => {
    it('should verify email initialization and value', () => {
      const primitive = new Email('test@test.com');
      expect(primitive.value).toBe('test@test.com');
    });

    it('should verify percentage initialization and value', () => {
      const primitive = new Percentage(0.85);
      expect(primitive.value).toBe(0.85);
    });

    it('should verify positive number checks', () => {
      const primitive = new PositiveNumber(10);
      expect(primitive.value).toBe(10);
      expect(() => new PositiveNumber(-1)).toThrow('Value must be a positive number.');
    });

    it('should verify non empty string checks', () => {
      const primitive = new NonEmptyString('valid');
      expect(primitive.value).toBe('valid');
      expect(() => new NonEmptyString('')).toThrow('Value must be a non-empty string.');
      expect(() => new NonEmptyString('   ')).toThrow('Value must be a non-empty string.');
    });

    it('should verify url initialization and value', () => {
      const primitive = new Url('https://test.com');
      expect(primitive.value).toBe('https://test.com');
    });

    it('should verify money initialization and properties', () => {
      const primitive = new Money(100, 'USD');
      expect(primitive.amount).toBe(100);
      expect(primitive.currency).toBe('USD');
    });

    it('should verify money default currency is USD', () => {
      const primitive = new Money(100);
      expect(primitive.currency).toBe('USD');
    });

    it('should verify locale initialization and value', () => {
      const primitive = new Locale('en-US');
      expect(primitive.value).toBe('en-US');
    });

    it('should verify time-zone initialization and value', () => {
      const primitive = new TimeZone('America/New_York');
      expect(primitive.value).toBe('America/New_York');
    });

    it('should verify language initialization and value', () => {
      const primitive = new Language('es');
      expect(primitive.value).toBe('es');
    });
  });

});
