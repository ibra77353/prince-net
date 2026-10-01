import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Expense } from '@prince-net/types';
import type { CreateExpenseInput } from '@prince-net/validation';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/button';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { Pagination } from '../../../components/ui/pagination';
import { useToast } from '../../../components/ui/use-toast';
import { useExpenseCategories } from '../../expense-categories/hooks/useExpenseCategories';
import { useExpenses } from '../hooks/useExpenses';
import { useCreateExpense } from '../hooks/useCreateExpense';
import { useUpdateExpense } from '../hooks/useUpdateExpense';
import { ExpensesFilters } from '../components/ExpensesFilters';
import { ExpensesTable } from '../components/ExpensesTable';
import { ExpenseFormDialog } from '../components/ExpenseFormDialog';
import { ReverseExpenseDialog } from '../components/ReverseExpenseDialog';
import { ApiClientError } from '../../../lib/api-client';

const PAGE_LIMIT = 25;
type StatusFilter = 'ALL' | 'ACTIVE' | 'REVERSED';

export function ExpensesPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [reverseTarget, setReverseTarget] = useState<Expense | null>(null);

  const categoriesQuery = useExpenseCategories();

  const { data, isLoading, isError, error, refetch } = useExpenses({
    page,
    limit: PAGE_LIMIT,
    categoryId: categoryId || undefined,
    status: status === 'ALL' ? undefined : status,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditing(expense);
    setFormOpen(true);
  };

  const handleFormSubmit = async (input: CreateExpenseInput) => {
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
        title="المصروفات"
        description="إدارة مصروفات الشبكة"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="me-2 h-4 w-4" />
            مصروف جديد
          </Button>
        }
      />

      <ExpensesFilters
        categoryId={categoryId}
        onCategoryChange={(v) => {
          setCategoryId(v);
          setPage(1);
        }}
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
          title="تعذّر تحميل المصروفات"
          message={error instanceof Error ? error.message : 'حدث خطأ'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <ExpensesTable
            data={data.data}
            categories={categoriesQuery.data ?? []}
            onEdit={handleEdit}
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

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editing}
        isSubmitting={isSubmitting}
      />

      <ReverseExpenseDialog
        open={!!reverseTarget}
        onOpenChange={(open) => !open && setReverseTarget(null)}
        expense={reverseTarget}
      />
    </div>
  );
}
