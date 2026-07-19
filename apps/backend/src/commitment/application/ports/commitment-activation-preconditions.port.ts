import type { CommitmentId } from '@commitment/domain';

/**
 * Command Preconditions (ADR-022 §3) — resolves the one cross-aggregate
 * fact Commitment.activate() needs but cannot know on its own: whether an
 * execution plan (a linked Task) exists. This interface lives here
 * (framework-agnostic, in Commitment's own application layer) so
 * ActivateCommitmentCommandHandlerCore stays decoupled from where the
 * concrete implementation is wired — same Port/Adapter shape already used
 * for DomainEventDispatcher. The concrete implementation lives in
 * task/application/preconditions/ (it needs TaskRepository, which
 * CommitmentModule cannot import without a circular dependency — see
 * ADR-022 §3.2 for why the NestJS wiring is registered in TaskModule
 * instead).
 */
export interface CommitmentActivationPreconditions {
  hasExecutionPlan(commitmentId: CommitmentId): Promise<boolean>;
}
