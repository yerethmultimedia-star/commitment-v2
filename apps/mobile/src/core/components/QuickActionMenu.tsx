import React from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { Target, Handshake, ListChecks, Repeat, StickyNote, Sparkles, ChevronRight } from '@tamagui/lucide-icons';
import { BottomSheet, Title, Body, toPlatformAccessibilityProps } from '@commitment/design-system';
import { useTranslation } from 'react-i18next';
import { useUiStore, type QuickCapturePrefill } from '@/core/store/use-ui-store';

type CaptureType = QuickCapturePrefill['type'];

interface MenuAction {
  id: CaptureType | 'coach';
  icon: React.ReactNode;
  titleI18nKey: string;
  descriptionI18nKey: string;
}

// ADR-020 (Quick Capture Philosophy): still ONE capture mechanism
// (Universal Capture, minimal title-only) underneath — this menu only
// replaces how the *type* gets chosen (a proper action list instead of a
// button row inside the dialog). Picking a capture type here hands off to
// the existing openQuickCaptureWithPrefill(source, { type, text: '' })
// path, the same one Coach's "accept suggestion" flow already uses — no
// new capture flow, no per-type screen (that's "Layered Capture", ADR-020
// §Decisión explicitly keeps that out of scope). "Ask Coach" is the one
// non-capture action — a plain navigation shortcut, not a Quick Capture type.
//
// Descriptions teach the domain (Goal -> Commitment -> Task, Habit as its
// own recurring track) instead of just naming it — each uses a distinct verb
// (Define/Create/Add/Build/Capture/Plan — 'Build' rather than 'Create' for
// Habit specifically, so it doesn't collide with Commitment's) and answers
// "what is this FOR", not "what is this" (e.g. "Build a routine you'll
// repeat over time", not "A recurring activity").
const CAPTURE_ACTIONS: MenuAction[] = [
  { id: 'goal', icon: <Target size={20} color="$accent" />, titleI18nKey: 'quickCapture.types.goal', descriptionI18nKey: 'quickCapture.descriptions.goal' },
  { id: 'commitment', icon: <Handshake size={20} color="$accent" />, titleI18nKey: 'quickCapture.types.commitment', descriptionI18nKey: 'quickCapture.descriptions.commitment' },
  { id: 'task', icon: <ListChecks size={20} color="$accent" />, titleI18nKey: 'quickCapture.types.task', descriptionI18nKey: 'quickCapture.descriptions.task' },
  { id: 'habit', icon: <Repeat size={20} color="$accent" />, titleI18nKey: 'quickCapture.types.habit', descriptionI18nKey: 'quickCapture.descriptions.habit' },
  { id: 'note', icon: <StickyNote size={20} color="$accent" />, titleI18nKey: 'quickCapture.types.note', descriptionI18nKey: 'quickCapture.descriptions.note' },
];

const ASK_COACH_ACTION: MenuAction = {
  id: 'coach',
  icon: <Sparkles size={20} color="$accent" />,
  titleI18nKey: 'quickCapture.askCoach',
  descriptionI18nKey: 'quickCapture.askCoachDescription',
};

export function QuickActionMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const isOpen = useUiStore((s) => s.isQuickActionMenuOpen);
  const source = useUiStore((s) => s.quickCaptureSource);
  const setOpen = useUiStore((s) => s.setQuickActionMenuOpen);
  const openQuickCaptureWithPrefill = useUiStore((s) => s.openQuickCaptureWithPrefill);

  const handleSelect = (id: MenuAction['id']) => {
    setOpen(false);
    if (id === 'coach') {
      router.push('/(tabs)/coach' as any);
      return;
    }
    openQuickCaptureWithPrefill(source ?? 'quick-action-menu', { type: id, text: '' });
  };

  return (
    <BottomSheet open={isOpen} onOpenChange={setOpen}>
      <YStack gap="$1" paddingVertical="$2">
        {CAPTURE_ACTIONS.map((action) => (
          <MenuRow
            key={action.id}
            action={action}
            title={t(action.titleI18nKey)}
            description={t(action.descriptionI18nKey)}
            onPress={() => handleSelect(action.id)}
          />
        ))}
        {/* Deliberate extra gap (not just the divider) — Ask Coach isn't a
            creation action, it navigates away, so it reads as visually
            separate, not a 6th equal option in the list. */}
        <YStack height={1} backgroundColor="$divider" marginTop="$3" marginBottom="$2" />
        <MenuRow
          action={ASK_COACH_ACTION}
          title={t(ASK_COACH_ACTION.titleI18nKey)}
          description={t(ASK_COACH_ACTION.descriptionI18nKey)}
          onPress={() => handleSelect('coach')}
        />
      </YStack>
    </BottomSheet>
  );
}

function MenuRow({ action, title, description, onPress }: { action: MenuAction; title: string; description: string; onPress: () => void }) {
  return (
    <XStack
      gap="$3"
      alignItems="center"
      paddingHorizontal="$4"
      paddingVertical="$3"
      minHeight={44}
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      cursor="pointer"
      {...toPlatformAccessibilityProps({
        accessibilityRole: 'button',
        accessibilityLabel: title,
        accessibilityHint: description,
      })}
    >
      {action.icon}
      <YStack flex={1} gap="$1">
        <Title fontSize="$4" fontWeight="600">{title}</Title>
        <Body fontSize="$2" tone="secondary" numberOfLines={1}>{description}</Body>
      </YStack>
      <ChevronRight size={16} color="$contentTertiary" />
    </XStack>
  );
}
