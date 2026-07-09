export interface InteractionState {
  pressed: boolean;
  hovered: boolean;
  focused: boolean;
  loading: boolean;
  disabled: boolean;
  error: boolean;
  success: boolean;
  selected: boolean;
}

export type InteractionStateHandlers = {
  onPressIn: () => void;
  onPressOut: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
  onFocus: () => void;
  onBlur: () => void;
};
