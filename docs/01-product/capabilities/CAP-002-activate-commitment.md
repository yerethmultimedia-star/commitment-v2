# Capability

Activate Commitment

## Problem

The user has created a Commitment but has not yet started living according to it.

## User Value

The Commitment officially becomes active and can now participate in daily execution, progress tracking, and future coaching.

## Business Outcome

Increase the percentage of created Commitments that become active.

## Success Metrics

- Activation Rate
- Time from Registration to Activation
- Activation Failure Rate

## Acceptance Criteria

- ✓ Commitment can be activated once
- ✓ Generates CommitmentActivated
- ✓ Aggregate state becomes Active
- ✓ Version increments
- ✓ Idempotent behavior
- ✓ Tests passing

## Non Goals

- Notifications
- Scheduling
- Microactions
- AI
- Offline Synchronization

## Future Evolution

Activation will later trigger:

- Scheduling
- Daily execution
- Notifications
- AI Coach
- Analytics
