/**
 * Generic type representing a value that can be null.
 */
export type Nullable<T> = T | null;

/**
 * Generic type representing a value that can be undefined.
 */
export type Optional<T> = T | undefined;

/**
 * DeepReadonly type to enforce complete immutability.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
