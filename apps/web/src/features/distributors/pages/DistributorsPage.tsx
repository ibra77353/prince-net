import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Distributor } from '@prince-net/types';
import type { CreateDistributorInput } from '@prince-net/validation';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { Pagination } from '../../../components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useToast } from '../../../components/ui/use-toast';
import { useDistributors } from '../hooks/useDistributors';
import { useCreateDistributor } from '../hooks/useCreateDistributor';
import { useUpdateDistributor } from '../hooks/useUpdateDistributor';
import { DistributorsTable } from '../components/DistributorsTable';
import { DistributorFormDialog } from '../components/DistributorFormDialog';
import { ApiClientError } from '../../../lib/api-client';

const PAGE_LIMIT = 25;
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export function DistributorsPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Distributor | null>(null);

  const { data, isLoading, isError, error, refetch } = useDistributors({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
  });

  const createMutation = useCreateDistributor();
  const updateMutation = useUpdateDistributor();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (d: Distributor) => {
    setEditing(d);
    setFormOpen(true);
  };

  const handleFormSubmit = async (input: CreateDistributorInput) => {
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
        title="الموزعون"
        description="إدارة موزعي البطاقات"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="me-2 h-4 w-4" />
            موزع جديد
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو الهاتف..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="ps-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as StatusFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">الكل</SelectItem>
            <SelectItem value="ACTIVE">مفعّل</SelectItem>
            <SelectItem value="INACTIVE">معطّل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          title="تعذّر تحميل الموزعين"
          message={error instanceof Error ? error.message : 'حدث خطأ'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <DistributorsTable data={data.data} onEdit={handleEdit} />
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <DistributorFormDialog
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