import type { BlockedType } from '@commitment/domain';

export class BlockTaskCommand {
  constructor(
    public readonly id: string,
    public readonly blockedType: BlockedType,
    public readonly blockedReason?: string,
  ) {}
}
