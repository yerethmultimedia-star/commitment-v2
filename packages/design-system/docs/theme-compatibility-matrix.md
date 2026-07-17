# Theme Compatibility Matrix

Version: 1.0.0
Last Updated: 2026-07-15
Owner: Architecture Review Board

---

## Why this document exists

`ResolvedTheme` (from `@commitment/theme-engine`) defines this app's own
semantic token set — `background`, `contentPrimary`, `accent`, `divider`,
etc. It was never designed to be a 1:1 replacement for Tamagui's own
built-in theme token vocabulary (`@tamagui/config/v3`'s default `light`/
`dark` themes carry ~100 tokens: `color`, `color1-12`, `backgroundHover`,
`borderColorPress`, full palette scales, and more).

`packages/design-system/src/tokens/themes.ts` registers this app's 4 named
themes (`DefaultLight`/`Sunrise`/`Midnight`/`Forest`) by **replacing**
Tamagui's default `light`/`dark` theme objects wholesale, not merging with
them — so none of Tamagui's own baseline tokens survive unless this
Design System explicitly re-provides them.

Most of the time this doesn't matter: every Design System component
(`Card`, `Button`, `Input`, …) is built on our own semantic tokens and
never touches Tamagui's baseline vocabulary. It only matters for **raw
Tamagui primitives used directly**, without a Design System wrapper —
these still carry Tamagui's own internal default styling, which references
Tamagui's baseline token names. When one of those tokens is missing,
Tamagui logs `[tamagui] Warning: missing token X in category Y` once per
page session (see `getTokenForKey.mjs`'s module-level `didLogMissingToken`
flag) and silently omits the style — which can mean an invisible/broken
interactive state, not just a console warning.

This document is the audit that closes that gap **exhaustively**, instead
of patching one token at a time as each raw primitive happens to surface a
warning during the screen-adoption phase. If a _new_ raw Tamagui primitive
is introduced later, re-run the audit method below for that package and
add any new tokens to `theme-adapter.ts`'s `baseTamaguiTokens()` — the
matrix and the adapter should always agree.

## Audit method

1. Enumerate every component imported directly `from 'tamagui'` anywhere
   in `apps/mobile/src` or `packages/design-system/src` (i.e. not going
   through a Design System wrapper):
   ```
   grep -rohE "import \{[^}]+\} from 'tamagui'" apps/mobile/src packages/design-system/src \
     | sed "s/import { //;s/ } from 'tamagui'//" | tr ',' '\n' | sed 's/^ *//;s/ *$//' | sort -u
   ```
   → `Adapt`, `Button`, `Circle`, `Input`, `ScrollView`, `Select`,
   `Separator`, `Sheet`, `Spinner`, `Switch`, `Text`, `TextArea`, `View`,
   `XStack`, `YStack` (plus type-only/infra imports: `TamaguiProvider`,
   `Theme`, `styled`, `useTheme`, `createFont`).
2. For each backing package, grep its **compiled** `dist/esm` output for
   hardcoded `'$token'` / `"$token"` string literals (source only, not
   `.map` files) — this finds every Tamagui base token any of these
   primitives can reference internally, independent of what we happen to
   pass as props:
   ```
   grep -rhoE "['\"]\$[a-zA-Z][a-zA-Z0-9]*['\"]" <package>/dist/esm | sort -u
   ```
3. Cross-reference each token against `ResolvedTheme`'s fields
   (`packages/theme-engine/src/core/ResolvedTheme.ts`) for an existing,
   already-computed equivalent before inventing anything new.

## Results

| Tamagui token                                                                                                                                                                                      | Required by                                                                                                          | ResolvedTheme source                                                              | Status                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`                                                                                                                                                                                            | `@tamagui/text` (default text color, e.g. `@tamagui/select`'s `SelectItemText`), `@tamagui/button`, `@tamagui/input` | `colors.contentPrimary`                                                           | ✅ Resolved                                                                                                                                                                                                                                                                                                                                                                                                    |
| `background`                                                                                                                                                                                       | `@tamagui/button`, `@tamagui/input`, `@tamagui/select`, `@tamagui/sheet`, `@tamagui/dialog`, `@tamagui/switch`       | `colors.background`                                                               | ✅ Resolved (was already passed through by the original `...resolvedTheme.colors` spread)                                                                                                                                                                                                                                                                                                                      |
| `borderColor`                                                                                                                                                                                      | `@tamagui/button`, `@tamagui/input`, `@tamagui/select`, `@tamagui/dialog`, `@tamagui/stacks` (base View)             | `border.color` (verified byte-identical to `colors.divider` in all 4 theme files) | ✅ Resolved                                                                                                                                                                                                                                                                                                                                                                                                    |
| `outlineColor`                                                                                                                                                                                     | `@tamagui/button`, `@tamagui/input`, `@tamagui/select`, `@tamagui/switch`                                            | `colors.focus`                                                                    | ✅ Resolved — matches `FocusRing.tsx`'s own `borderColor="$focus"`, same semantic purpose (focus-visible ring)                                                                                                                                                                                                                                                                                                 |
| `borderColorFocus`                                                                                                                                                                                 | `@tamagui/button`, `@tamagui/input`                                                                                  | `colors.focus`                                                                    | ✅ Resolved (same rationale as `outlineColor`)                                                                                                                                                                                                                                                                                                                                                                 |
| `backgroundActive`                                                                                                                                                                                 | `@tamagui/switch` (applied when `checked` and no explicit override is passed)                                        | `colors.interactive`                                                              | ✅ Resolved — matches `EditHabitScreen.tsx`'s own explicit `checked ? '$interactive' : ...` pattern, the one raw-Switch call site that already overrides this. **Real consequence if left unmapped:** the other 3 raw `<Switch>` call sites (`profile.tsx` Demo Mode, `AppearanceSettingsScreen.tsx` Reduced Motion + High Contrast) pass no override, so their "on" state would have no visible color change. |
| `backgroundHover`                                                                                                                                                                                  | `@tamagui/button`, `@tamagui/select`, `@tamagui/sheet`, `@tamagui/dialog`                                            | `colors.background` (no-op / resting-state passthrough)                           | ✅ Resolved — deliberately inert. This app's interaction language is opacity/scale animation (`interaction/useInteractionAnimation.ts`); no Design System component does a background color swap on hover. Mapping to the resting color keeps raw primitives visually consistent with that language instead of introducing a treatment nothing else in the app uses.                                           |
| `backgroundPress`                                                                                                                                                                                  | `@tamagui/button`, `@tamagui/select`, `@tamagui/dialog`                                                              | `colors.background` (no-op)                                                       | ✅ Resolved (same rationale as `backgroundHover`)                                                                                                                                                                                                                                                                                                                                                              |
| `backgroundFocus`                                                                                                                                                                                  | `@tamagui/select`, `@tamagui/separator`                                                                              | `colors.background` (no-op)                                                       | ✅ Resolved (same rationale — focus is already signaled via `outlineColor`/`borderColorFocus`, not a background swap)                                                                                                                                                                                                                                                                                          |
| `borderColorHover`                                                                                                                                                                                 | `@tamagui/button`, `@tamagui/input`                                                                                  | `border.color` (no-op)                                                            | ✅ Resolved (same rationale as `backgroundHover`)                                                                                                                                                                                                                                                                                                                                                              |
| `borderColorPress`                                                                                                                                                                                 | `@tamagui/button`                                                                                                    | `border.color` (no-op)                                                            | ✅ Resolved (same rationale)                                                                                                                                                                                                                                                                                                                                                                                   |
| `color1`–`color12`, full palette scales (`blue*`/`gray*`/`green*`/etc.), `colorHover`/`colorPress`/`colorFocus`, `placeholderColor`, `backgroundHover`/`Press`/`Focus` _variants beyond the above_ | None of the audited packages (step 2) reference these                                                                | —                                                                                 | ✖ Unnecessary — not provided, and shouldn't be. These are Tamagui's own default-palette tokens; this Design System deliberately never uses Tamagui's default color scale, only its own semantic tokens. Adding them back would reintroduce exactly the "off-token color" pattern this project's Phase 7 migration removed.                                                                                     |

**Net result:** every Tamagui base token any raw primitive actually used in
this repo can reference is now resolved. Nothing is left in a ⚠ pending
state. `packages/design-system/src/adapters/theme-adapter.ts`'s
`baseTamaguiTokens()` implements this table directly — 11 explicit
mappings, each with a one-line rationale in-line, not an open-ended list
expected to keep growing during the adoption phase.

## When to revisit this document

Only when a **new raw Tamagui primitive** (imported directly `from
'tamagui'`, not via `@commitment/design-system`) is introduced. Re-run the
audit method above for that package's compiled `dist/esm` output, add any
newly-discovered token to the table and to `baseTamaguiTokens()`. If a
screen during the adoption phase needs a raw Tamagui primitive not in the
"required by" column above, that's the trigger — not a recurring console
warning.
