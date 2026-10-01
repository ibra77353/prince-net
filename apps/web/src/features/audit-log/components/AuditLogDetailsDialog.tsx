import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { useAuditLog } from '../hooks/useAuditLog';
import { getAuditActionLabel } from '../../../lib/audit-actions';
import { formatDateTime } from '../../../lib/format';

interface AuditLogDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditLogId: string | null;
}

export function AuditLogDetailsDialog({
  open,
  onOpenChange,
  auditLogId,
}: AuditLogDetailsDialogProps) {
  const { data, isLoading, isError, error, refetch } =
    useAuditLog(auditLogId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل العملية</DialogTitle>
          <DialogDescription>
            معلومات كاملة عن السجل
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingState />
        ) : isError || !data ? (
          <ErrorState
            title="تعذّر تحميل التفاصيل"
            message={error instanceof Error ? error.message : 'حدث خطأ'}
            onRetry={() => refetch()}
          />
        ) : (
          <div className="space-y-4">
            {/* Action */}
            <div className="flex items-center gap-2">
              <Badge variant="default">{getAuditActionLabel(data.action)}</Badge>
            </div>

            {/* Metadata */}
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">التاريخ</dt>
                <dd className="mt-1">{formatDateTime(data.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">IP</dt>
                <dd className="mt-1 num">{data.ipAddress ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">نوع الكيان</dt>
                <dd className="mt-1">{data.entityType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">معرّف الكيان</dt>
                <dd className="mt-1 num text-xs">
                  {data.entityId ?? '—'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">User ID</dt>
                <dd className="mt-1 num text-xs">{data.userId}</dd>
              </div>
              {data.userAgent && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    User Agent
                  </dt>
                  <dd className="mt-1 text-xs break-all">
                    {data.userAgent}
                  </dd>
                </div>
              )}
            </dl>

            {/* Old Values */}
            {data.oldValues && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  القيم السابقة
                </h4>
                <pre
                  dir="ltr"
                  className="text-xs bg-muted p-3 rounded-md overflow-x-auto"
                >
                  {JSON.stringify(data.oldValues, null, 2)}
                </pre>
              </div>
            )}

            {/* New Values */}
            {data.newValues && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  القيم الجديدة
                </h4>
                <pre
                  dir="ltr"
                  className="text-xs bg-muted p-3 rounded-md overflow-x-auto"
                >
                  {JSON.stringify(data.newValues, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
