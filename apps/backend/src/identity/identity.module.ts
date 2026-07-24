import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterIdentityHandler } from './application/commands/register-identity.handler';
import { InMemoryIdentityRepository } from './infrastructure/in-memory-identity.repository';

/**
 * AR-030 D-030.1 — `Identity`'s backend enforcement boundary. Deliberately no controller: no
 * documented requirement calls for a public API yet (Fase 4A scope), and Authentication does not
 * depend on this module — the reverse dependency (Authentication -> Identity) stays unused until
 * a real consumer needs it, preserving D-043.1's bounded-context independence.
 */
@Module({
  imports: [CqrsModule],
  providers: [
    RegisterIdentityHandler,
    {
      provide: 'IdentityRepository',
      useClass: InMemoryIdentityRepository,
    },
  ],
  exports: ['IdentityRepository'],
})
export class IdentityModule {}
