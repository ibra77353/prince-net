/**
 * ثوابت مشتركة بين Frontend و Backend.
 *
 * قيود:
 *  - Browser-safe فقط.
 *  - لا fs، لا path، لا process.
 *  - لا تعتمد على Node APIs.
 */

export const API_PREFIX = "api/v1";

export const DEFAULT_PAGE_LIMIT = 25;
export const MAX_PAGE_LIMIT = 100;

export const COOKIE_NAMES = {
  AUTH: "prince_net_token",
  CSRF: "prince_net_csrf",
} as const;

export const HEADERS = {
  CSRF: "x-csrf-token",
} as const;

export const AUDIT_ACTIONS = [
  "LOGIN",
  "LOGIN_FAILED",
  "PACKAGE_CREATED",
  "PACKAGE_UPDATED",
  "INVENTORY_ADDED",
  "INVENTORY_ADJUSTED",
  "INVENTORY_RETURNED",
  "DISTRIBUTOR_CREATED",
  "DISTRIBUTOR_UPDATED",
  "SALE_CREATED",
  "SALE_CANCELLED",
  "PAYMENT_CREATED",
  "PAYMENT_REVERSED",
  "LINE_CREATED",
  "LINE_UPDATED",
  "LINE_PAYMENT_CREATED",
  "LINE_PAYMENT_REVERSED",
  "EXPENSE_CREATED",
  "EXPENSE_UPDATED",
  "EXPENSE_REVERSED",
  "OWNER_WITHDRAWAL_CREATED",
  "OWNER_WITHDRAWAL_REVERSED",
  "CASH_MANUAL_IN",
  "CASH_MANUAL_OUT",
  "BACKUP_CREATED",
  "BACKUP_RESTORED",
  "SETTINGS_UPDATED",
  "PASSWORD_CHANGED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
