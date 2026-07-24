/**
 * AR-050 D-050.1, Incremento 3 — the platform's own concept of "context": a domain concept the
 * platform receives, never one it assembles. Deliberately minimal: this fixes only that context
 * is a structured domain concept (an object), not an infrastructure DTO tied to any specific
 * source — it does not fix what a context contains, how it's obtained, who builds it, its
 * lifetime, or how it's cached. A provider must not be able to tell whether a context came from a
 * database, a cache, in-memory aggregation, or a test mock — it only ever receives a value shaped
 * like `AIContext`. Whichever capability implements `AIPlatform<TContext>` defines its own
 * concrete context type; that type only needs to satisfy this shape, not extend it explicitly.
 */
export type AIContext = object;
