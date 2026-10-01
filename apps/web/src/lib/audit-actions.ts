import type { AuditAction } from '@prince-net/types';

export interface AuditActionOption {
  value: AuditAction;
  label: string;
}

export const AUDIT_ACTIONS: AuditActionOption[] = [
  { value: 'LOGIN', label: 'تسجيل دخول' },
  { value: 'LOGIN_FAILED', label: 'فشل تسجيل دخول' },
  { value: 'PACKAGE_CREATED', label: 'إنشاء باقة' },
  { value: 'PACKAGE_UPDATED', label: 'تعديل باقة' },
  { value: 'INVENTORY_ADDED', label: 'إضافة مخزون' },
  { value: 'INVENTORY_ADJUSTED', label: 'تعديل مخزون' },
  { value: 'INVENTORY_RETURNED', label: 'إعادة مخزون' },
  { value: 'DISTRIBUTOR_CREATED', label: 'إضافة موزع' },
  { value: 'DISTRIBUTOR_UPDATED', label: 'تعديل موزع' },
  { value: 'SALE_CREATED', label: 'إنشاء بيع' },
  { value: 'SALE_CANCELLED', label: 'إلغاء بيع' },
  { value: 'PAYMENT_CREATED', label: 'إنشاء دفعة' },
  { value: 'PAYMENT_REVERSED', label: 'عكس دفعة' },
  { value: 'LINE_CREATED', label: 'إضافة خط' },
  { value: 'LINE_UPDATED', label: 'تعديل خط' },
  { value: 'LINE_PAYMENT_CREATED', label: 'إنشاء دفعة خط' },
  { value: 'LINE_PAYMENT_REVERSED', label: 'عكس دفعة خط' },
  { value: 'EXPENSE_CREATED', label: 'إنشاء مصروف' },
  { value: 'EXPENSE_UPDATED', label: 'تعديل مصروف' },
  { value: 'EXPENSE_REVERSED', label: 'عكس مصروف' },
  { value: 'OWNER_WITHDRAWAL_CREATED', label: 'سحب المالك' },
  { value: 'OWNER_WITHDRAWAL_REVERSED', label: 'عكس سحب المالك' },
  { value: 'CASH_MANUAL_IN', label: 'إيداع يدوي' },
  { value: 'CASH_MANUAL_OUT', label: 'سحب يدوي' },
  { value: 'BACKUP_CREATED', label: 'إنشاء نسخة احتياطية' },
  { value: 'BACKUP_RESTORED', label: 'استعادة نسخة' },
  { value: 'SETTINGS_UPDATED', label: 'تعديل الإعدادات' },
  { value: 'PASSWORD_CHANGED', label: 'تغيير كلمة المرور' },
];

export function getAuditActionLabel(action: AuditAction): string {
  return (
    AUDIT_ACTIONS.find((a) => a.value === action)?.label ?? action
  );
}