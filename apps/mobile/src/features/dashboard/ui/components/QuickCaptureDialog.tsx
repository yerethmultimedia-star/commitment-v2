import React, { useState } from 'react';
import { Dialog, Button, Title, Input, Stack, Inline } from '@commitment/design-system';
import { useQuickCaptureFacade } from '@/core/facades/quick-capture.facade';
import { useSession } from '@/core/auth/use-session';

export interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCaptureDialog({ open, onOpenChange }: QuickCaptureDialogProps) {
  const { identityId } = useSession();
  const { capture, isCapturing } = useQuickCaptureFacade();
  const [text, setText] = useState('');

  const handleCapture = async () => {
    if (!text.trim() || !identityId) return;

    try {
      await capture({
        text: text.trim(),
        identityId,
        source: 'mobile_fab',
      });
      setText('');
      onOpenChange(false);
    } catch (err) {
      console.error('Quick capture failed:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Stack gap="$md">
        <Title i18nKey="quickCapture.title" />

        <Input
          value={text}
          onChangeText={setText}
          placeholderI18nKey="quickCapture.placeholder"
          onFocus={() => {}}
          onBlur={() => {}}
          disabled={isCapturing}
        />

        <Inline gap="$md" justifyContent="flex-end">
          <Button 
            variant="secondary" 
            i18nKey="quickCapture.btnCancel"
            onPress={() => onOpenChange(false)}
            disabled={isCapturing}
          />
          <Button 
            variant="primary" 
            i18nKey="quickCapture.btnCapture"
            onPress={handleCapture}
            disabled={!text.trim() || isCapturing}
            loading={isCapturing}
          />
        </Inline>
      </Stack>
    </Dialog>
  );
}
