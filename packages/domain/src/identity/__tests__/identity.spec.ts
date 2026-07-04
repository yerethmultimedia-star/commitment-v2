import { Identity } from '../aggregate/identity.js';
import { IdentityId } from '../value-objects/identity-id.js';
import { Email } from '../../shared/primitives/email.js';
import { DisplayName } from '../value-objects/display-name.js';
import { PreferredLanguage } from '../value-objects/preferred-language.js';
import { PreferredTimeZone } from '../value-objects/preferred-time-zone.js';
import { IdentityCreatedEvent } from '../events/identity-created.event.js';
import { IdentityUpdatedEvent } from '../events/identity-updated.event.js';
import { IdentityRepository } from '../repositories/identity.repository.js';

describe('Identity Bounded Context', () => {

  describe('IdentityId', () => {
    it('should initialize successfully with valid UUID', () => {
      const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const id = new IdentityId(uuid);
      expect(id.value).toBe(uuid);
    });
  });

  describe('Email Value Object', () => {
    it('should accept valid email address and normalize casing', () => {
      const email = new Email('Test@Example.Com ');
      expect(email.value).toBe('test@example.com');
    });

    it('should reject invalid email format', () => {
      expect(() => new Email('invalid')).toThrow('Invalid email address format');
      expect(() => new Email('')).toThrow('Invalid email address format');
    });
  });

  describe('DisplayName Value Object', () => {
    it('should accept valid display name and trim whitespace', () => {
      const name = new DisplayName(' Alice Smith ');
      expect(name.value).toBe('Alice Smith');
    });

    it('should reject empty or extremely long display names', () => {
      expect(() => new DisplayName('')).toThrow('Display name must be between 1 and 100 characters');
      expect(() => new DisplayName('a'.repeat(101))).toThrow('Display name must be between 1 and 100 characters');
    });
  });

  describe('PreferredLanguage Value Object', () => {
    it('should accept standard BCP-47 locale tags', () => {
      const languages = ['en', 'es-CR', 'pt-BR', 'fr-CA', 'en-US', 'zh-Hans'];
      for (const lang of languages) {
        const preferred = new PreferredLanguage(lang);
        expect(preferred.code).toBe(lang);
      }
    });

    it('should reject invalid language tags', () => {
      expect(() => new PreferredLanguage('')).toThrow('Invalid language locale BCP-47');
      expect(() => new PreferredLanguage('12')).toThrow('Invalid language locale BCP-47');
      expect(() => new PreferredLanguage('en_US')).toThrow('Invalid language locale BCP-47');
    });
  });

  describe('PreferredTimeZone Value Object', () => {
    it('should accept standard timezone structures', () => {
      const timezones = ['UTC', 'America/New_York', 'Europe/Paris', 'GMT+1'];
      for (const tz of timezones) {
        const zone = new PreferredTimeZone(tz);
        expect(zone.name).toBe(tz);
      }
    });

    it('should reject empty or invalid timezone formatting paths', () => {
      expect(() => new PreferredTimeZone('')).toThrow('Invalid timezone name format');
      expect(() => new PreferredTimeZone('America/')).toThrow('Invalid timezone name format');
      expect(() => new PreferredTimeZone('America//New_York')).toThrow('Invalid timezone name format');
      expect(PreferredTimeZone.isValid(null as unknown as string)).toBe(false);
      expect(PreferredTimeZone.isValid('   ')).toBe(false);
    });
  });

  describe('Identity Aggregate Root', () => {
    const id = new IdentityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    const email = new Email('test@test.com');
    const displayName = new DisplayName('Bob');
    const preferredLanguage = new PreferredLanguage('es');
    const preferredTimeZone = new PreferredTimeZone('UTC');
    const now = new Date();

    it('should register a new identity and emit created event', () => {
      const identity = Identity.register(id, email, displayName, preferredLanguage, preferredTimeZone, now);
      
      expect(identity.id.equals(id)).toBe(true);
      expect(identity.email.equals(email)).toBe(true);
      expect(identity.displayName.equals(displayName)).toBe(true);
      expect(identity.preferredLanguage.equals(preferredLanguage)).toBe(true);
      expect(identity.preferredTimeZone.equals(preferredTimeZone)).toBe(true);
      expect(identity.createdAt.getTime()).toBe(now.getTime());
      expect(identity.updatedAt.getTime()).toBe(now.getTime());

      const events = identity.getUncommittedEvents();
      expect(events.length).toBe(1);
      
      const createdEvent = events[0] as IdentityCreatedEvent;
      expect(createdEvent.name).toBe('identity.created');
      expect(createdEvent.metadata.aggregateId).toBe(id.value);
      expect(createdEvent.metadata.occurredAt).toBe(now.toISOString());
      expect(createdEvent.payload.identityId).toBe(id.value);
      expect(createdEvent.payload.email).toBe(email.value);
      expect(createdEvent.payload.displayName).toBe(displayName.value);
      expect(createdEvent.payload.preferredLanguage).toBe(preferredLanguage.code);
      expect(createdEvent.payload.preferredTimeZone).toBe(preferredTimeZone.name);
      
      // Asserts that timestamps are NOT in the payload
      expect('createdAt' in createdEvent.payload).toBe(false);
      expect('occurredAt' in createdEvent.payload).toBe(false);
    });

    it('should update aggregate profile fields and emit updated event', () => {
      const identity = Identity.register(id, email, displayName, preferredLanguage, preferredTimeZone, now);
      identity.clearUncommittedEvents();

      const newName = new DisplayName('Bobby');
      const newLang = new PreferredLanguage('en-US');
      const newTz = new PreferredTimeZone('America/Costa_Rica');
      const updateTime = new Date(now.getTime() + 1000);

      identity.update(newName, newLang, newTz, updateTime);

      expect(identity.displayName.equals(newName)).toBe(true);
      expect(identity.preferredLanguage.equals(newLang)).toBe(true);
      expect(identity.preferredTimeZone.equals(newTz)).toBe(true);
      expect(identity.updatedAt.getTime()).toBe(updateTime.getTime());

      const events = identity.getUncommittedEvents();
      expect(events.length).toBe(1);

      const updatedEvent = events[0] as IdentityUpdatedEvent;
      expect(updatedEvent.name).toBe('identity.updated');
      expect(updatedEvent.payload.identityId).toBe(id.value);
      expect(updatedEvent.payload.displayName).toBe(newName.value);
      expect(updatedEvent.payload.preferredLanguage).toBe(newLang.code);
      expect(updatedEvent.payload.preferredTimeZone).toBe(newTz.name);

      // Asserts that timestamps are NOT in the payload
      expect('updatedAt' in updatedEvent.payload).toBe(false);
    });

    it('should rehydrate aggregate state from event stream history', () => {
      const identity = Identity.register(id, email, displayName, preferredLanguage, preferredTimeZone, now);
      
      const newName = new DisplayName('Bobby');
      const newLang = new PreferredLanguage('en-US');
      const newTz = new PreferredTimeZone('America/Costa_Rica');
      const updateTime = new Date(now.getTime() + 1000);
      
      identity.update(newName, newLang, newTz, updateTime);

      const history = identity.getUncommittedEvents();
      
      // Build a fresh aggregate shell and apply history
      const freshIdentity = Identity.register(
        id, 
        new Email('dummy@dummy.com'), 
        new DisplayName('Dummy'), 
        new PreferredLanguage('fr'), 
        new PreferredTimeZone('GMT'), 
        new Date()
      );
      freshIdentity.clearUncommittedEvents();

      freshIdentity.loadFromHistory(history);

      expect(freshIdentity.id.equals(id)).toBe(true);
      expect(freshIdentity.email.equals(email)).toBe(true);
      expect(freshIdentity.displayName.equals(newName)).toBe(true);
      expect(freshIdentity.preferredLanguage.equals(newLang)).toBe(true);
      expect(freshIdentity.preferredTimeZone.equals(newTz)).toBe(true);
      expect(freshIdentity.updatedAt.getTime()).toBe(updateTime.getTime());
    });
  });

  describe('IdentityRepository Contract', () => {
    it('should assert repository contract can be satisfied', async () => {
      let saved = false;
      let foundId: IdentityId | null = null;

      const mockRepo: IdentityRepository = {
        save: async (_identity) => {
          saved = !!_identity;
        },
        findById: async (id) => {
          foundId = id;
          return null;
        }
      };
      
      const identityId = new IdentityId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      await mockRepo.save({} as unknown as Identity);
      const res = await mockRepo.findById(identityId);
      
      expect(saved).toBe(true);
      expect(foundId).toBe(identityId);
      expect(res).toBeNull();
    });
  });

});
