import { AggregateRoot } from '../../core/aggregate-root.base.js';
import { DomainEvent } from '../../core/domain-event.interface.js';
import { AppearanceSettings, AppearanceSettingsProps } from './appearance-settings.model.js';

export interface AppearanceProps {
  userId: string;
  settings: AppearanceSettings;
  updatedAt: Date;
}

export class Appearance extends AggregateRoot {
  protected readonly aggregateType = 'Appearance';
  
  private _userId!: string;
  private _settings!: AppearanceSettings;
  private _updatedAt!: Date;

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
    const instance = new Appearance();
    instance.id = props.userId; // use userId as aggregate id
    instance._userId = props.userId;
    instance._settings = props.settings ?? AppearanceSettings.create({});
    instance._updatedAt = props.updatedAt ?? new Date();
    return instance;
  }
}
