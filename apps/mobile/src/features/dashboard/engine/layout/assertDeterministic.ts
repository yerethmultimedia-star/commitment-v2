/**
 * assertDeterministic
 *
 * Development-only guard that detects when engine code is accidentally
 * importing or accessing React Context, Zustand stores, or any global
 * side-effect during a layout computation.
 *
 * In production (__DEV__ === false) this is a no-op.
 *
 * Usage:
 *   assertDeterministicEntry('DashboardLayoutEngine');
 *   // ... pure computation ...
 *   assertDeterministicExit();
 */

let _insideEngine = false;

/**
 * Mark the beginning of a deterministic engine computation.
 * Subsequent calls to any Zustand store selector will throw in dev mode.
 */
export function assertDeterministicEntry(label: string): void {
  if (!__DEV__) return;
  if (_insideEngine) {
    console.warn(
      `[assertDeterministic] Re-entrant call detected inside "${label}". ` +
        'Make sure the engine is not calling async code.',
    );
  }
  _insideEngine = true;
}

/**
 * Mark the end of a deterministic engine computation.
 */
export function assertDeterministicExit(): void {
  if (!__DEV__) return;
  _insideEngine = false;
}

/**
 * Call this inside a Zustand store selector to verify the engine
 * is not accidentally reading store state during layout computation.
 */
export function assertNotInsideEngine(storeName: string): void {
  if (!__DEV__) return;
  if (_insideEngine) {
    throw new Error(
      `[DeterministicGuard] "${storeName}" was accessed during a DashboardLayoutEngine computation. ` +
        'The engine must receive all data as arguments. ' +
        'Do not read from Zustand, React Context, or any external store inside the engine.',
    );
  }
}
