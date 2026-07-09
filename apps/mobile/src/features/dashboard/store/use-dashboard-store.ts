import { create } from 'zustand';
import { DashboardLayout } from '@commitment/domain';
import { DashboardLayoutRepositoryImpl } from '../repository/dashboard.repository.impl.js';
import { appWidgetRegistry, WidgetDefinition } from '../registry/WidgetRegistry.js';

const repository = new DashboardLayoutRepositoryImpl();

interface DashboardState {
  layout: DashboardLayout | null;
  isLoading: boolean;
  
  load: (userId: string) => Promise<void>;
  moveWidget: (widgetId: string, newPosition: number) => Promise<void>;
  toggleWidgetVisibility: (widgetId: string, isVisible: boolean) => Promise<void>;
  addWidget: (widgetId: string, size?: 'small' | 'medium' | 'large') => Promise<void>;
  
  getVisibleWidgets: () => WidgetDefinition[];
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  layout: null,
  isLoading: true,

  load: async (userId: string) => {
    set({ isLoading: true });
    try {
      let layout = await repository.get(userId);
      
      if (!layout) {
        // Initialize default layout
        layout = DashboardLayout.create({ userId });
        
        // Let's add default widgets from registry
        const allWidgets = appWidgetRegistry.getAll().sort((a, b) => a.priority - b.priority);
        allWidgets.forEach(w => {
          layout!.addWidget(w.id, w.defaultSize);
        });
        
        await repository.save(layout);
      }
      
      set({ layout, isLoading: false });
    } catch (error) {
      console.error('Failed to load dashboard layout', error);
      set({ isLoading: false });
    }
  },

  moveWidget: async (widgetId: string, newPosition: number) => {
    const { layout } = get();
    if (!layout) return;

    // Clone to respect immutability
    const newLayout = DashboardLayout.create({
      id: layout.id,
      userId: layout.userId,
      version: layout.version,
      widgets: [...layout.widgets],
      updatedAt: layout.updatedAt,
    });

    newLayout.moveWidget(widgetId, newPosition);
    set({ layout: newLayout });
    
    await repository.save(newLayout);
  },

  toggleWidgetVisibility: async (widgetId: string, isVisible: boolean) => {
    const { layout } = get();
    if (!layout) return;

    const newLayout = DashboardLayout.create({
      ...layout,
      widgets: [...layout.widgets],
    });

    newLayout.toggleVisibility(widgetId, isVisible);
    set({ layout: newLayout });
    
    await repository.save(newLayout);
  },

  addWidget: async (widgetId: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    const { layout } = get();
    if (!layout) return;

    const newLayout = DashboardLayout.create({
      ...layout,
      widgets: [...layout.widgets],
    });

    newLayout.addWidget(widgetId, size);
    set({ layout: newLayout });
    
    await repository.save(newLayout);
  },

  getVisibleWidgets: () => {
    const { layout } = get();
    if (!layout) return [];
    return appWidgetRegistry.getVisible(layout);
  }
}));
