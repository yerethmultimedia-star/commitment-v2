import React, { useEffect, useState } from 'react';
import { Dialog, Button, Title, Input, TextArea, Stack, Inline } from '@commitment/design-system';

export interface RenameGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  currentDescription: string;
  onSave: (title: string, description: string) => void;
  isSaving?: boolean;
}

// Goal Draft Editing (follow-up to Decisión B): broadened from title-only to
// title+description — the only way a Goal created via Quick Capture (title
// only) can ever satisfy activate()'s description invariant. No new entry
// point added; reuses the existing pencil-icon edit affordance.
export function RenameGoalDialog({ open, onOpenChange, currentTitle, currentDescription, onSave, isSaving }: RenameGoalDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setDescription(currentDescription);
    }
  }, [open, currentTitle, currentDescription]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed, description.trim());
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
        <TextArea
          value={description}
          onChangeText={setDescription}
          labelI18nKey="goals.workspace.renameDescriptionLabel"
          placeholderI18nKey="goals.workspace.renameDescriptionPlaceholder"
          disabled={isSaving}
          numberOfLines={3}
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
