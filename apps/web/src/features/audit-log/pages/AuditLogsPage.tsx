import { useState } from 'react';
import type { AuditAction, AuditLog } from '@prince-net/types';
import { PageHeader } from '../../../components/layout/PageHeader';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditLogsFilters } from '../components/AuditLogsFilters';
import { AuditLogsTable } from '../components/AuditLogsTable';
import { AuditLogDetailsDialog } from '../components/AuditLogDetailsDialog';

const PAGE_LIMIT = 25;

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<AuditAction | 'ALL'>('ALL');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useAuditLogs({
    page,
    limit: PAGE_LIMIT,
    action: action === 'ALL' ? undefined : action,
    entityType: entityType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const handleViewDetails = (log: AuditLog) => {
    setDetailsId(log.id);
  };

  const totalPages = data?.meta.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل العمليات"
        description="سجل كامل للعمليات الحساسة في النظام"
      />

      <AuditLogsFilters
        action={action}
        onActionChange={(v) => {
          setAction(v);
          setPage(1);
        }}
        entityType={entityType}
        onEntityTypeChange={(v) => {
          setEntityType(v);
          setPage(1);
        }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => {
          setDateFrom(v);
          setPage(1);
        }}
        dateTo={dateTo}
        onDateToChange={(v) => {
          setDateTo(v);
          setPage(1);
        }}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          title="تعذّر تحميل السجلات"
          message={error instanceof Error ? error.message : 'حدث خطأ'}
          onRetry={() => refetch()}
        />
      ) : (
        <AuditLogsTable
          data={data.data}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewDetails={handleViewDetails}
        />
      )}

      <AuditLogDetailsDialog
        open={!!detailsId}
        onOpenChange={(open) => !open && setDetailsId(null)}
        auditLogId={detailsId}
      />
    </div>
  );
}
