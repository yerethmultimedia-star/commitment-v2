/**
 * Re-exported so consumers depend on the localization SDK's own surface
 * rather than importing react-i18next directly — keeps the engine
 * decoupling the adapter.ts comment describes, but for the hook form of
 * translation instead of the imperative t().
 */
export { useTranslation } from 'react-i18next';
