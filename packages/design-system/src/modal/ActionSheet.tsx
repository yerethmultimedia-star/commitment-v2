import React from 'react';
import { Stack } from '../layout/Stack.js';
import { Button } from '../components/Button.js';
import { BottomSheet } from './BottomSheet.js';

export interface ActionSheetAction {
  labelI18nKey: string;
  onPress: () => void;
  destructive?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: ActionSheetAction[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  open,
  onOpenChange,
  actions,
}) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <Stack gap="$sm" padding="$md">
        {actions.map((action, index) => {
          const handlePress = () => {
            action.onPress();
            onOpenChange(false);
          };

          return (
            <Button
              key={index}
              i18nKey={action.labelI18nKey}
              variant={action.variant || 'secondary'}
              tone={action.destructive ? 'error' : 'normal'}
              onPress={handlePress}
              fullWidth
            />
          );
        })}
        <Button
          // Top-level 'cancel' — the same key ConfirmationDialog's own
          // cancelI18nKey default already resolves successfully elsewhere
          // in the app. 'action.cancel' has no matching resource in any
          // locale (this component had no real consumer yet to catch it).
          i18nKey="cancel"
          variant="outline"
          onPress={() => onOpenChange(false)}
          fullWidth
        />
      </Stack>
    </BottomSheet>
  );
};

ActionSheet.displayName = 'ActionSheet';
