import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { OwnerWithdrawal } from '@prince-net/types';
import type { CreateOwnerWithdrawalInput } from '@prince-net/validation';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/button';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { Pagination } from '../../../components/ui/pagination';
import { useToast } from '../../../components/ui/use-toast';
import { useOwnerWithdrawals } from '../hooks/useOwnerWithdrawals';
import { useCreateOwnerWithdrawal } from '../hooks/useCreateOwnerWithdrawal';
import { OwnerWithdrawalsFilters } from '../components/OwnerWithdrawalsFilters';
import { OwnerWithdrawalsTable } from '../components/OwnerWithdrawalsTable';
import { OwnerWithdrawalFormDialog } from '../components/OwnerWithdrawalFormDialog';
import { ReverseOwnerWithdrawalDialog } from '../components/ReverseOwnerWithdrawalDialog';
import { ApiClientError } from '../../../lib/api-client';

const PAGE_LIMIT = 25;
type StatusFilter = 'ALL' | 'ACTIVE' | 'REVERSED';

export function OwnerWithdrawalsPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [reverseTarget, setReverseTarget] =
    useState<OwnerWithdrawal | null>(null);

  const { data, isLoading, isError, error, refetch } = useOwnerWithdrawals({
    page,
    limit: PAGE_LIMIT,
    status: status === 'ALL' ? undefined : status,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const createMutation = useCreateOwnerWithdrawal();

  const handleFormSubmit = async (input: CreateOwnerWithdrawalInput) => {
    try {
      await createMutation.mutateAsync(input);
      toast({ title: 'تم تسجيل السحب' });
      setFormOpen(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'فشل الحفظ',
        description: err instanceof ApiClientError ? err.message : 'حدث خطأ',
      });
    }
  };

  const totalPages = data?.meta.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="سحوبات المالك"
        description="سجل سحوبات المالك من الصندوق"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="me-2 h-4 w-4" />
            سحب جديد
          </Button>
        }
      />

      <OwnerWithdrawalsFilters
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
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
          title="تعذّر تحميل السحوبات"
          message={error instanceof Error ? error.message : 'حدث خطأ'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <OwnerWithdrawalsTable
            data={data.data}
            onReverse={setReverseTarget}
          />
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <OwnerWithdrawalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending}
      />

      <ReverseOwnerWithdrawalDialog
        open={!!reverseTarget}
        onOpenChange={(open) => !open && setReverseTarget(null)}
        withdrawal={reverseTarget}
      />
    </div>
  );
}
