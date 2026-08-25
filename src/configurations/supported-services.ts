export const SUPPORTED_SERVICES = [
  'login',
  'dashboard',
  'top-nav',
  'left-nav',
  'device-delivery-status',
  'device-mapping',
] as const;
export type SupportedService = (typeof SUPPORTED_SERVICES)[number];
export const isSupportedService = (value: string): value is SupportedService =>
  SUPPORTED_SERVICES.includes(value as SupportedService);
