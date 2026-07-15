import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { GoalWorkspaceScreen } from '@/features/goals/screens/GoalWorkspaceScreen';

export default function GoalWorkspaceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <GoalWorkspaceScreen goalId={id} />;
}
