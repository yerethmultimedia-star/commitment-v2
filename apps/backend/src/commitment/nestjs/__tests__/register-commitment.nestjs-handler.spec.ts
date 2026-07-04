import { RegisterCommitmentNestjsHandler } from '../register-commitment.nestjs-handler';
import { RegisterCommitmentCommand } from '../../application/commands/register-commitment.command';
import { RegisterCommitmentResult } from '../../application/commands/register-commitment.result';
import { InMemoryCommitmentRepository } from '../../infrastructure/in-memory-commitment.repository';
import { NoOpDomainEventDispatcher } from '../../infrastructure/noop-event-dispatcher';

describe('RegisterCommitmentNestjsHandler', () => {
  it('should instantiate core handler and execute correctly', async () => {
    const repository = new InMemoryCommitmentRepository();
    const dispatcher = new NoOpDomainEventDispatcher();
    const handler = new RegisterCommitmentNestjsHandler(repository, dispatcher);

    const id = '018f6b5c-42e1-7000-8000-999999999999';
    const identityId = '018f6b5c-42e1-7000-8000-111111111111';
    const command = new RegisterCommitmentCommand(
      id,
      identityId,
      'Title',
      'Desc',
    );

    // Run Dispatcher once to get it covered!
    await dispatcher.dispatch([]);

    const result = (await handler.execute(command)) as RegisterCommitmentResult;
    expect(result.commitmentId).toBe(id);
    expect(result.version).toBe(1);
  });
});
