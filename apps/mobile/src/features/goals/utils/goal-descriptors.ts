import { Heart, Briefcase, DollarSign, BookOpen, Users } from '@tamagui/lucide-icons';

export type GoalCategory = 'health' | 'career' | 'finance' | 'learning' | 'personal';
export type GoalPriority = 'high' | 'medium' | 'low';

export const CATEGORY_ICON: Record<GoalCategory, React.ComponentType<any>> = {
  health: Heart,
  career: Briefcase,
  finance: DollarSign,
  learning: BookOpen,
  personal: Users,
};

export const PRIORITY_COLOR: Record<GoalPriority, string> = {
  high: '$danger',
  medium: '$warning',
  low: '$success',
};
