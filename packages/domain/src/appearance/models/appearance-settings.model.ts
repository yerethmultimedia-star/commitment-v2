export interface AppearanceSettingsProps {
  themeId: string;
  locale: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

export class AppearanceSettings {
  constructor(private readonly props: AppearanceSettingsProps) {}

  get themeId(): string {
    return this.props.themeId;
  }

  get locale(): string {
    return this.props.locale;
  }

  get reducedMotion(): boolean {
    return this.props.reducedMotion;
  }

  get highContrast(): boolean {
    return this.props.highContrast;
  }

  public update(props: Partial<AppearanceSettingsProps>): AppearanceSettings {
    return new AppearanceSettings({
      ...this.props,
      ...props,
    });
  }

  public toJSON(): AppearanceSettingsProps {
    return { ...this.props };
  }

  public static create(props: Partial<AppearanceSettingsProps>): AppearanceSettings {
    return new AppearanceSettings({
      themeId: props.themeId ?? 'Sunrise',
      locale: props.locale ?? 'es',
      reducedMotion: props.reducedMotion ?? false,
      highContrast: props.highContrast ?? false,
    });
  }
}
