import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, Target, TrendingUp, User, Compass } from '@tamagui/lucide-icons';
import { useUiStore } from '@/core/store/use-ui-store';
import { QuickCaptureDialog } from '@/features/dashboard/ui/components/QuickCaptureDialog';
import { QuickActionMenu } from '@/core/components/QuickActionMenu';
import { FloatingTabBar } from '@/shared/ui/FloatingTabBar';

// Five primary tabs, no center FAB — VS-031 Product Experience Completion
// (Revision 2). Quick Capture is triggered from a button inside each screen
// (Today, Goals, Tasks, Coach; Calendar once it exists), never from the tab
// bar itself, so it never needs a tab bar slot of its own.
//
// tabBarIcon here just renders the plain icon at whatever color it's given —
// FloatingTabBar (a fully custom tab bar) decides focused/unfocused color and
// the selected-tab pill treatment itself, so these callbacks stay dumb.
export default function TabLayout() {
  const { t } = useTranslation('common');
  const { isQuickCaptureOpen, setQuickCaptureOpen } = useUiStore();

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.today'),
            tabBarIcon: ({ color, size }) => <Home color={color as any} size={size ?? 20} />,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: t('tabs.goals'),
            tabBarIcon: ({ color, size }) => <Target color={color as any} size={size ?? 20} />,
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            title: t('tabs.coach'),
            tabBarIcon: ({ color, size }) => <Compass color={color as any} size={size ?? 20} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: t('tabs.progress'),
            tabBarIcon: ({ color, size }) => <TrendingUp color={color as any} size={size ?? 20} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => <User color={color as any} size={size ?? 20} />,
          }}
        />
      </Tabs>

      <QuickActionMenu />
      <QuickCaptureDialog
        open={isQuickCaptureOpen}
        onOpenChange={setQuickCaptureOpen}
      />
    </>
  );
}
