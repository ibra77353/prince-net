import { Eye, History } from 'lucide-react';
import type { AuditAction, AuditLog } from '@prince-net/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { Pagination } from '../../../components/ui/pagination';
import { formatDateTime } from '../../../lib/format';

interface AuditLogsTableProps {
  data: AuditLog[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (log: AuditLog) => void;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN: 'تسجيل دخول',
  LOGIN_FAILED: 'فشل تسجيل دخول',
  PACKAGE_CREATED: 'إنشاء باقة',
  PACKAGE_UPDATED: 'تعديل باقة',
  INVENTORY_ADDED: 'إضافة مخزون',
  INVENTORY_ADJUSTED: 'تعديل مخزون',
  INVENTORY_RETURNED: 'إعادة مخزون',
  DISTRIBUTOR_CREATED: 'إضافة موزع',
  DISTRIBUTOR_UPDATED: 'تعديل موزع',
  SALE_CREATED: 'إنشاء بيع',
  SALE_CANCELLED: 'إلغاء بيع',
  PAYMENT_CREATED: 'إنشاء دفعة',
  PAYMENT_REVERSED: 'عكس دفعة',
  LINE_CREATED: 'إضافة خط',
  LINE_UPDATED: 'تعديل خط',
  LINE_PAYMENT_CREATED: 'إنشاء دفعة خط',
  LINE_PAYMENT_REVERSED: 'عكس دفعة خط',
  EXPENSE_CREATED: 'إنشاء مصروف',
  EXPENSE_UPDATED: 'تعديل مصروف',
  EXPENSE_REVERSED: 'عكس مصروف',
  OWNER_WITHDRAWAL_CREATED: 'سحب المالك',
  OWNER_WITHDRAWAL_REVERSED: 'عكس سحب المالك',
  CASH_MANUAL_IN: 'إيداع يدوي',
  CASH_MANUAL_OUT: 'سحب يدوي',
  BACKUP_CREATED: 'إنشاء نسخة احتياطية',
  BACKUP_RESTORED: 'استعادة نسخة',
  SETTINGS_UPDATED: 'تعديل الإعدادات',
  PASSWORD_CHANGED: 'تغيير كلمة المرور',
};

type BadgeVariant = 'success' | 'default' | 'destructive' | 'warning' | 'secondary';

function actionVariant(action: AuditAction): BadgeVariant {
  if (
    action.endsWith('_CREATED') ||
    action.endsWith('_ADDED') ||
    action.endsWith('_RETURNED')
  ) {
    return 'success';
  }
  if (action.endsWith('_UPDATED')) return 'default';
  if (
    action.endsWith('_CANCELLED') ||
    action.endsWith('_REVERSED') ||
    action === 'LOGIN_FAILED'
  ) {
    return 'destructive';
  }
  if (
    action.endsWith('_ADJUSTED') ||
    action === 'CASH_MANUAL_IN' ||
    action === 'CASH_MANUAL_OUT'
  ) {
    return 'warning';
  }
  return 'secondary';
}

function shortId(id: string | null): string {
  if (!id) return '—';
  return id.slice(0, 8);
}

export function AuditLogsTable({
  data,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
}: AuditLogsTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="لا توجد سجلات"
        description="لم تُسجَّل أي عمليات بعد"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>العملية</TableHead>
              <TableHead>الكيان</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={actionVariant(log.action)}>
                    {ACTION_LABELS[log.action]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="font-medium">{log.entityType}</span>
                  {log.entityId && (
                    <span className="num text-muted-foreground ms-2 text-xs">
                      {shortId(log.entityId)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="num text-xs text-muted-foreground">
                  {log.ipAddress ?? '—'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(log)}
                  >
                    <Eye className="me-1 h-3.5 w-3.5" />
                    عرض
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export { ACTION_LABELS };
