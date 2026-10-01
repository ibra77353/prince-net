import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Line } from '@prince-net/types';
import type { CreateLineInput } from '@prince-net/validation';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/button';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { Pagination } from '../../../components/ui/pagination';
import { useToast } from '../../../components/ui/use-toast';
import { useLines } from '../hooks/useLines';
import { useCreateLine } from '../hooks/useCreateLine';
import { useUpdateLine } from '../hooks/useUpdateLine';
import { LinesFilters } from '../components/LinesFilters';
import { LinesTable } from '../components/LinesTable';
import { LineFormDialog } from '../components/LineFormDialog';
import { ApiClientError } from '../../../lib/api-client';

const PAGE_LIMIT = 25;
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export function LinesPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Line | null>(null);

  const { data, isLoading, isError, error, refetch } = useLines({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
  });

  const createMutation = useCreateLine();
  const updateMutation = useUpdateLine();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (line: Line) => {
    setEditing(line);
    setFormOpen(true);
  };

  const handleFormSubmit = async (input: CreateLineInput) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input });
        toast({ title: 'تم التحديث' });
      } else {
        await createMutation.mutateAsync(input);
        toast({ title: 'تمت الإضافة' });
      }
      setFormOpen(false);
      setEditing(null);
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
        title="الخطوط"
        description="إدارة خطوط الإنترنت"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="me-2 h-4 w-4" />
            خط جديد
          </Button>
        }
      />

      <LinesFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          title="تعذّر تحميل الخطوط"
          message={error instanceof Error ? error.message : 'حدث خطأ'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <LinesTable data={data.data} onEdit={handleEdit} />
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <LineFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editing}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}