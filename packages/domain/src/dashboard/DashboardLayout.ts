import { v4 as uuidv4 } from 'uuid';

export interface WidgetPosition {
  widgetId: string;
  position: number;
  size: 'small' | 'medium' | 'large';
  visibility: 'visible' | 'hidden';
}

export interface DashboardLayoutProps {
  id: string;
  userId: string;
  version: number;
  widgets: WidgetPosition[];
  updatedAt: Date;
}

export class DashboardLayout {
  public readonly id: string;
  public readonly userId: string;
  public version: number;
  public widgets: WidgetPosition[];
  public updatedAt: Date;

  private constructor(props: DashboardLayoutProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.version = props.version;
    this.widgets = [...props.widgets].sort((a, b) => a.position - b.position);
    this.updatedAt = props.updatedAt;
  }

  public static create(props: {
    userId: string;
    widgets?: WidgetPosition[];
    version?: number;
    id?: string;
    updatedAt?: Date;
  }): DashboardLayout {
    return new DashboardLayout({
      id: props.id ?? uuidv4(),
      userId: props.userId,
      version: props.version ?? 1,
      widgets: props.widgets ?? [],
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  public moveWidget(widgetId: string, newPosition: number): void {
    const currentIndex = this.widgets.findIndex(w => w.widgetId === widgetId);
    if (currentIndex === -1) return;

    const widget = this.widgets[currentIndex];
    if (!widget) return;
    
    this.widgets.splice(currentIndex, 1);
    this.widgets.splice(newPosition, 0, widget);

    // Re-assign positions
    this.widgets.forEach((w, index) => {
      w.position = index;
    });

    this.markUpdated();
  }

  public toggleVisibility(widgetId: string, isVisible: boolean): void {
    const widget = this.widgets.find(w => w.widgetId === widgetId);
    if (widget) {
      widget.visibility = isVisible ? 'visible' : 'hidden';
      this.markUpdated();
    }
  }

  public resizeWidget(widgetId: string, size: 'small' | 'medium' | 'large'): void {
    const widget = this.widgets.find(w => w.widgetId === widgetId);
    if (widget) {
      widget.size = size;
      this.markUpdated();
    }
  }

  public addWidget(widgetId: string, size: 'small' | 'medium' | 'large' = 'medium', position?: number): void {
    if (this.widgets.some(w => w.widgetId === widgetId)) {
      return; // Already exists
    }

    const newWidget: WidgetPosition = {
      widgetId,
      position: position ?? this.widgets.length,
      size,
      visibility: 'visible',
    };

    if (position !== undefined && position >= 0 && position < this.widgets.length) {
      this.widgets.splice(position, 0, newWidget);
      this.widgets.forEach((w, index) => { w.position = index; });
    } else {
      this.widgets.push(newWidget);
    }
    
    this.markUpdated();
  }

  public migrate(newVersion: number, migrationFn: (layout: DashboardLayout) => void): void {
    if (newVersion > this.version) {
      migrationFn(this);
      this.version = newVersion;
      this.markUpdated();
    }
  }

  private markUpdated(): void {
    this.updatedAt = new Date();
  }
}
