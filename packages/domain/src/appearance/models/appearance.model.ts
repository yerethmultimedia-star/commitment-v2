import { AggregateRoot } from '../../shared/aggregate-root.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { AppearanceSettings, AppearanceSettingsProps } from './appearance-settings.model.js';

export interface AppearanceProps {
  userId: string;
  settings: AppearanceSettings;
  updatedAt: Date;
}

/**
 * Migrated from core/aggregate-root.base.ts to shared/aggregate-root.ts (AR-023, D-023.1):
 * the operative architecture uses shared/AggregateRoot exclusively (ADR-021, matches the
 * versioned-state pattern all 7 real aggregates and AR-028's optimistic concurrency use).
 * Appearance never used core/'s Event-Sourcing-specific capabilities (applyEvent stayed empty;
 * updateSettings() mutates state directly, never calling recordEvent()) — this migration is
 * purely a base-class swap, no behavioral change. See docs/ARCHITECTURE_REMEDIATION/AR-023/ANALISIS.md.
 * `id` is typed as plain `string` (not a dedicated Value Object) — introducing one is out of this
 * AR's approved scope (D-023.1 is about which hierarchy to use, not about redesigning Appearance's
 * domain model conventions).
 */
export class Appearance extends AggregateRoot<string> {
  private _userId!: string;
  private _settings!: AppearanceSettings;
  private _updatedAt!: Date;

  private constructor(userId: string) {
    super(userId);
  }

  public get userId(): string {
    return this._userId;
  }

  public get settings(): AppearanceSettings {
    return this._settings;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateSettings(settingsProps: Partial<AppearanceSettingsProps>): void {
    const newSettings = this._settings.update(settingsProps);
    // Since we don't have defined DomainEvents for this yet, we just update local state directly.
    // In a full event-sourced approach we would record an AppearanceSettingsUpdated event here.
    this._settings = newSettings;
    this._updatedAt = new Date();
  }

  protected applyEvent(_event: DomainEvent): void {
    // Implement event handlers when we introduce specific events like AppearanceSettingsUpdated
  }

  public static create(props: { userId: string; settings?: AppearanceSettings; updatedAt?: Date }): Appearance {
    const instance = new Appearance(props.userId);
    instance._userId = props.userId;
    instance._settings = props.settings ?? AppearanceSettings.create({});
    instance._updatedAt = props.updatedAt ?? new Date();
    return instance;
  }
}
