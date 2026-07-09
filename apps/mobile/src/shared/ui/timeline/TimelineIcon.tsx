import { Circle } from 'tamagui';

export interface TimelineIconProps {
  icon: React.ReactNode;
  backgroundColor?: any;
}

export function TimelineIcon({ icon, backgroundColor = '$color5' }: TimelineIconProps) {
  return (
    <Circle size="$3" backgroundColor={backgroundColor} zIndex={1}>
      {icon}
    </Circle>
  );
}
