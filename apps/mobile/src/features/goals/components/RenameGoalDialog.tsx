import React, { useEffect, useState } from 'react';
import { Dialog, Button, Title, Input, Stack, Inline } from '@commitment/design-system';

export interface RenameGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onSave: (title: string) => void;
  isSaving?: boolean;
}

export function RenameGoalDialog({ open, onOpenChange, currentTitle, onSave, isSaving }: RenameGoalDialogProps) {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (open) setTitle(currentTitle);
  }, [open, currentTitle]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Stack gap="$md">
        <Title i18nKey="goals.workspace.renameTitle" />
        <Input
          value={title}
          onChangeText={setTitle}
          placeholderI18nKey="goals.workspace.renamePlaceholder"
          accessibilityLabelI18nKey="goals.workspace.renamePlaceholder"
          onFocus={() => {}}
          onBlur={() => {}}
          disabled={isSaving}
        />
        <Inline gap="$md" justifyContent="flex-end">
          <Button
            variant="secondary"
            i18nKey="goals.workspace.renameCancel"
            onPress={() => onOpenChange(false)}
            disabled={isSaving}
          />
          <Button
            variant="primary"
            i18nKey="goals.workspace.renameSave"
            onPress={handleSave}
            disabled={!title.trim() || isSaving}
            loading={isSaving}
          />
        </Inline>
      </Stack>
    </Dialog>
  );
}
