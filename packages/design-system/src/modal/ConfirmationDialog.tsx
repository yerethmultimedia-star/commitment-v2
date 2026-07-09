import React from 'react';
import { Stack } from '../layout/Stack.js';
import { Inline } from '../layout/Inline.js';
import { Title, Body } from '../components/typography/index.js';
import { Button } from '../components/Button.js';
import { Dialog } from './Dialog.js';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleI18nKey: string;
  titleI18nParams?: Record<string, any>;
  descriptionI18nKey: string;
  descriptionI18nParams?: Record<string, any>;
  confirmI18nKey: string;
  cancelI18nKey: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  titleI18nKey,
  titleI18nParams,
  descriptionI18nKey,
  descriptionI18nParams,
  confirmI18nKey,
  cancelI18nKey,
  onConfirm,
  destructive = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Stack gap="$md" padding="$sm">
        <Title i18nKey={titleI18nKey} i18nParams={titleI18nParams} style={{ textAlign: 'center' }} />
        <Body i18nKey={descriptionI18nKey} i18nParams={descriptionI18nParams} tone="secondary" style={{ textAlign: 'center' }} />
        
        <Inline gap="$sm" marginTop="$md">
          <Button
            i18nKey={cancelI18nKey}
            variant="outline"
            onPress={handleCancel}
            fullWidth
          />
          <Button
            i18nKey={confirmI18nKey}
            variant="primary"
            tone={destructive ? 'error' : 'normal'}
            onPress={handleConfirm}
            fullWidth
          />
        </Inline>
      </Stack>
    </Dialog>
  );
};

ConfirmationDialog.displayName = 'ConfirmationDialog';
