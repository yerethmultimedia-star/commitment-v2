/**
 * @file shared/forms/zodResolver.ts
 *
 * Thin wrapper around @hookform/resolvers/zod that isolates the runtime-compatible
 * type cast required due to a version mismatch between zod@4.4.x and
 * @hookform/resolvers@5.4, which has a TypeScript overload that expects
 * `_zod.version.minor === 0` (Zod 4.0.x).
 *
 * This is the only place in the project that should contain this cast.
 * All forms must import `zodResolver` from this module, never directly
 * from '@hookform/resolvers/zod'.
 */
import { zodResolver as _zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';

export function zodResolver<TFieldValues extends FieldValues>(
  schema: unknown,
): Resolver<TFieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _zodResolver(schema as any) as Resolver<TFieldValues>;
}
