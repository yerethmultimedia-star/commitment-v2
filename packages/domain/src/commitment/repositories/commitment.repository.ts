import { Repository } from '../../shared/repository.interface.js';
import { Commitment } from '../aggregate/commitment.js';
import { CommitmentId } from '../value-objects/commitment-id.js';

export interface CommitmentRepository extends Repository<Commitment> {
  save(commitment: Commitment): Promise<void>;
  findById(id: CommitmentId): Promise<Commitment | null>;
}
