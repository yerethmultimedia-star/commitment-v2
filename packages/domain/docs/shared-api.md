# Shared Kernel Public API Specification

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

This document lists the public API signatures and usage patterns for the Shared Kernel primitives exported by `@commitment/domain`.

---

## 🛠️ API Reference

### 1. `UniqueEntityId`

Value Object representing UUID-based identities. Does _not_ generate UUIDs internally.

```typescript
import { UniqueEntityId } from '@commitment/domain';

// Instantiate
const id = new UniqueEntityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');

// Validate string syntax
const isValid = UniqueEntityId.isValid('some-string'); // boolean
```

---

### 2. `Result<T>`

Lightweight Monad capturing success or failure states.

```typescript
import { Result, DomainError } from '@commitment/domain';

// Success Outcome
const success = Result.ok<number>(42);
const value = success.value; // 42

// Failure Outcome
class CustomError extends DomainError {
  public message = 'An error occurred';
  public code = 'ERR_CODE';
}
const failure = Result.fail<number>(new CustomError());
const isFailure = failure.isFailure; // true
const error = failure.error; // DomainError instance
```

---

### 3. `BusinessRule`

Defines an invariant rule.

```typescript
import { BusinessRule, BusinessRuleValidator } from '@commitment/domain';

class MaxLimitRule implements BusinessRule {
  public message = 'Limit exceeded';
  public code = 'ERR_LIMIT';

  constructor(private readonly count: number) {}

  public isBroken(): boolean {
    return this.count > 10;
  }
}

// Enforce rule checking
BusinessRuleValidator.check(new MaxLimitRule(15)); // Throws BusinessRuleViolationException
```

---

### 4. `Specification<T>`

Composes logical validation filters.

```typescript
import { Specification } from '@commitment/domain';

class IsEven extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return candidate % 2 === 0;
  }
}

class IsPositive extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return candidate > 0;
  }
}

const positiveEven = new IsPositive().and(new IsEven());
positiveEven.isSatisfiedBy(4); // true
positiveEven.isSatisfiedBy(-2); // false
```

---

### 5. `Clock`

Date/time interface. Live implementation will reside in infrastructure layer.

```typescript
import { Clock } from '@commitment/domain';

class InjectedService {
  constructor(private readonly clock: Clock) {}

  public process() {
    const timestamp = this.clock.now(); // Date object
  }
}
```

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial Domain Shared Kernel public API documentation.
