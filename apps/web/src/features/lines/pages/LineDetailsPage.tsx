import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Pencil, Plus } from 'lucide-react';
import type { CreateLineInput } from '@prince-net/validation';
import type { LinePayment } from '@prince-net/types';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { useToast } from '../../../components/ui/use-toast';
import { useLine } from '../hooks/useLine';
import { useUpdateLine } from '../hooks/useUpdateLine';
import { LineFormDialog } from '../components/LineFormDialog';
import { useLinePayments } from '../../line-payments/hooks/useLinePayments';
import { LinePaymentsTable } from '../../line-payments/components/LinePaymentsTable';
import { CreateLinePaymentDialog } from '../../line-payments/components/CreateLinePaymentDialog';
import { ReverseLinePaymentDialog } from '../../line-payments/components/ReverseLinePaymentDialog';
import { formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/format';
import { ApiClientError } from '../../../lib/api-client';

const PAYMENTS_LIMIT = 25;

export function LineDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);
  const [reverseTarget, setReverseTarget] = useState<LinePayment | null>(null);

  const lineQuery = useLine(id);
  const updateMutation = useUpdateLine();

  const paymentsQuery = useLinePayments({
    lineId: id,
    page: paymentsPage,
    limit: PAYMENTS_LIMIT,
    order: 'desc',
  });

  if (lineQuery.isLoading) {
    return <LoadingState message="جارٍ تحميل الخط..." />;
  }

  if (lineQuery.isError || !lineQuery.data) {
    return (
      <ErrorState
        title="تعذّر تحميل الخط"
        message={
          lineQuery.error instanceof Error
            ? lineQuery.error.message
            : 'حدث خطأ'
        }
        onRetry={() => lineQuery.refetch()}
      />
    );
  }

  const line = lineQuery.data;

  const handleUpdate = async (input: CreateLineInput) => {
    try {
      await updateMutation.mutateAsync({ id: line.id, input });
      toast({ title: 'تم التحديث' });
      setEditOpen(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'فشل التحديث',
        description: err instanceof ApiClientError ? err.message : 'حدث خطأ',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ms-2">
          <Link to="/lines">
            <ArrowRight className="me-1 h-4 w-4" />
            العودة للخطوط
          </Link>
        </Button>

        <PageHeader
          title={line.name}
          description={line.provider}
          actions={
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="me-2 h-4 w-4" />
              تعديل
            </Button>
          }
        />

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={line.status === 'ACTIVE' ? 'success' : 'secondary'}>
            {line.status === 'ACTIVE' ? 'مفعّل' : 'معطّل'}
          </Badge>
        </div>
      </div>

      {/* Line Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">بيانات الخط</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">المزود</dt>
              <dd className="text-sm font-medium mt-1">{line.provider}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">المعرّف</dt>
              <dd className="text-sm font-medium mt-1 num">
                {line.identifier}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">السرعة</dt>
              <dd className="text-sm font-medium mt-1">
                {line.speed ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                التكلفة الشهرية
              </dt>
              <dd className="text-sm font-medium mt-1 num">
                {formatMoney(line.cost)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                تاريخ الاشتراك
              </dt>
              <dd className="text-sm font-medium mt-1">
                {formatDate(line.subscriptionDate)}
              </dd>
            </div>
            {line.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">ملاحظات</dt>
                <dd className="text-sm mt-1 whitespace-pre-wrap">
                  {line.notes}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Line Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">دفعات الخط</CardTitle>
          <Button
            size="sm"
            onClick={() => setCreatePaymentOpen(true)}
          >
            <Plus className="me-2 h-4 w-4" />
            إضافة دفعة
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {paymentsQuery.isLoading ? (
            <LoadingState />
          ) : paymentsQuery.isError ? (
            <ErrorState
              title="تعذّر تحميل الدفعات"
              message={
                paymentsQuery.error instanceof Error
                  ? paymentsQuery.error.message
                  : 'حدث خطأ'
              }
              onRetry={() => paymentsQuery.refetch()}
            />
          ) : (
            <LinePaymentsTable
              data={paymentsQuery.data?.data ?? []}
              page={paymentsPage}
              totalPages={paymentsQuery.data?.meta.totalPages ?? 0}
              onPageChange={setPaymentsPage}
              onReverse={setReverseTarget}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <LineFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        initialData={line}
        isSubmitting={updateMutation.isPending}
      />

      <CreateLinePaymentDialog
        open={createPaymentOpen}
        onOpenChange={setCreatePaymentOpen}
        lineId={line.id}
      />

      <ReverseLinePaymentDialog
        open={!!reverseTarget}
        onOpenChange={(open) => !open && setReverseTarget(null)}
        payment={reverseTarget}
        lineId={line.id}
      />
    </div>
  );
}