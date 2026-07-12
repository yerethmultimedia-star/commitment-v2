import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, Target, Plus, TrendingUp, User } from '@tamagui/lucide-icons';
import { TouchableOpacity } from 'react-native';
import { useUiStore } from '@/core/store/use-ui-store';
import { QuickCaptureDialog } from '@/features/dashboard/ui/components/QuickCaptureDialog';

export default function TabLayout() {
  const { t } = useTranslation('common');
  const { isQuickCaptureOpen, setQuickCaptureOpen } = useUiStore();

  return (
    <>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.today'),
            tabBarIcon: ({ color }) => <Home color={color as any} size={22} />,
          }}
        />
        <Tabs.Screen 
          name="goals" 
          options={{ 
            title: t('tabs.goals'),
            tabBarIcon: ({ color }) => <Target color={color as any} size={22} />,
          }} 
        />
        <Tabs.Screen 
          name="quick-capture-placeholder" 
          options={{ 
            title: '',
            tabBarIcon: ({ color }) => <Plus color={color as any} size={26} />,
            tabBarButton: (props) => {
              const { delayLongPress, style, ...restProps } = props as any;
              return (
                <TouchableOpacity
                  {...restProps}
                  style={[
                    style,
                    {
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 50,
                      height: 50,
                      backgroundColor: '#4F46E5', // Premium violet accent color
                      borderRadius: 25,
                      alignSelf: 'center',
                      elevation: 5,
                      shadowColor: '#4F46E5',
                      shadowOpacity: 0.3,
                      shadowRadius: 5,
                      shadowOffset: { width: 0, height: 3 },
                      marginTop: -10, // Elevate FAB
                    }
                  ]}
                  onPress={() => setQuickCaptureOpen(true)}
                />
              );
            },
          }} 
        />
        <Tabs.Screen 
          name="insights" 
          options={{ 
            title: t('tabs.progress'),
            tabBarIcon: ({ color }) => <TrendingUp color={color as any} size={22} />,
          }} 
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color }) => <User color={color as any} size={22} />,
          }}
        />
      </Tabs>

      <QuickCaptureDialog 
        open={isQuickCaptureOpen} 
        onOpenChange={setQuickCaptureOpen} 
      />
    </>
  );
}
