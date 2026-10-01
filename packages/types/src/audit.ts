import type { ISODateString, UUID } from "./common";
export type AuditAction =
  | "LOGIN" | "LOGIN_FAILED" | "PACKAGE_CREATED" | "PACKAGE_UPDATED"
  | "INVENTORY_ADDED" | "INVENTORY_ADJUSTED" | "INVENTORY_RETURNED"
  | "DISTRIBUTOR_CREATED" | "DISTRIBUTOR_UPDATED" | "SALE_CREATED" | "SALE_CANCELLED"
  | "PAYMENT_CREATED" | "PAYMENT_REVERSED" | "LINE_CREATED" | "LINE_UPDATED"
  | "LINE_PAYMENT_CREATED" | "LINE_PAYMENT_REVERSED" | "EXPENSE_CREATED" | "EXPENSE_UPDATED"
  | "EXPENSE_REVERSED" | "OWNER_WITHDRAWAL_CREATED" | "OWNER_WITHDRAWAL_REVERSED"
  | "CASH_MANUAL_IN" | "CASH_MANUAL_OUT" | "BACKUP_CREATED" | "BACKUP_RESTORED"
  | "SETTINGS_UPDATED" | "PASSWORD_CHANGED";
export interface AuditLog { id:UUID; userId:UUID; action:AuditAction; entityType:string; entityId:UUID|null; oldValues:Record<string,unknown>|null; newValues:Record<string,unknown>|null; ipAddress:string|null; userAgent:string|null; createdAt:ISODateString; }
