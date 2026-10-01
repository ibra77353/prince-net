import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Pencil,
  ShoppingCart,
} from 'lucide-react';
import type { CreateDistributorInput } from '@prince-net/validation';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { Pagination } from '../../../components/ui/pagination';
import { StatCard } from '../../dashboard/components/StatCard';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { EmptyState } from '../../../components/ui/empty-state';
import { useToast } from '../../../components/ui/use-toast';
import { useDistributor } from '../hooks/useDistributor';
import { useDistributorBalance } from '../hooks/useDistributorBalance';
import { useDistributorSales } from '../hooks/useDistributorSales';
import { useDistributorPayments } from '../hooks/useDistributorPayments';
import { useUpdateDistributor } from '../hooks/useUpdateDistributor';
import { DistributorFormDialog } from '../components/DistributorFormDialog';
import { formatMoney } from '../../../lib/currency';
import { formatDate, formatDateTime } from '../../../lib/format';
import { ApiClientError } from '../../../lib/api-client';

const PAGE_LIMIT = 25;

export function DistributorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [salesPage, setSalesPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);

  const distributorQuery = useDistributor(id);
  const balanceQuery = useDistributorBalance(id);
  const salesQuery = useDistributorSales({
    id,
    page: salesPage,
    limit: PAGE_LIMIT,
    order: 'desc',
  });
  const paymentsQuery = useDistributorPayments({
    id,
    page: paymentsPage,
    limit: PAGE_LIMIT,
    order: 'desc',
  });
  const updateMutation = useUpdateDistributor();

  if (distributorQuery.isLoading) {
    return <LoadingState message="جارٍ تحميل الموزع..." />;
  }

  if (distributorQuery.isError || !distributorQuery.data) {
    return (
      <ErrorState
        title="تعذّر تحميل الموزع"
        message={
          distributorQuery.error instanceof Error
            ? distributorQuery.error.message
            : 'حدث خطأ'
        }
        onRetry={() => distributorQuery.refetch()}
      />
    );
  }

  const d = distributorQuery.data;

  const handleUpdate = async (input: CreateDistributorInput) => {
    try {
      await updateMutation.mutateAsync({ id: d.id, input });
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
          <Link to="/distributors">
            <ArrowRight className="me-1 h-4 w-4" />
            العودة للموزعين
          </Link>
        </Button>

        <PageHeader
          title={d.name}
          description={d.phone}
          actions={
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="me-2 h-4 w-4" />
              تعديل
            </Button>
          }
        />

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={d.status === 'ACTIVE' ? 'success' : 'secondary'}>
            {d.status === 'ACTIVE' ? 'مفعّل' : 'معطّل'}
          </Badge>
          {d.address && (
            <span className="text-xs text-muted-foreground">{d.address}</span>
          )}
          <span className="text-xs text-muted-foreground">
            مسجّل في {formatDate(d.registrationDate)}
          </span>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="إجمالي المبيعات"
          value={
            balanceQuery.data ? formatMoney(balanceQuery.data.totalSales) : '—'
          }
          icon={ShoppingCart}
        />
        <StatCard
          title="إجمالي التحصيلات"
          value={
            balanceQuery.data
              ? formatMoney(balanceQuery.data.totalPayments)
              : '—'
          }
          icon={CreditCard}
          variant="success"
        />
        <StatCard
          title="الرصيد المتبقي"
          value={
            balanceQuery.data ? formatMoney(balanceQuery.data.balance) : '—'
          }
          icon={Banknote}
          variant="destructive"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="payments">التحصيلات</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {salesQuery.isLoading ? (
            <LoadingState />
          ) : !salesQuery.data || salesQuery.data.data.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="لا توجد مبيعات"
              description="لم تُسجَّل أي مبيعات لهذا الموزع"
            />
          ) : (
            <>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الفاتورة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الإجمالي</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesQuery.data.data.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Link
                            to={`/sales/${s.id}`}
                            className="hover:underline num font-medium"
                          >
                            {s.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(s.saleDate)}
                        </TableCell>
                        <TableCell className="num">
                          {formatMoney(s.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.status === 'ACTIVE' ? 'success' : 'destructive'
                            }
                          >
                            {s.status === 'ACTIVE' ? 'نشطة' : 'ملغاة'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {salesQuery.data.meta.totalPages > 1 && (
                <Pagination
                  page={salesPage}
                  totalPages={salesQuery.data.meta.totalPages}
                  onPageChange={setSalesPage}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {paymentsQuery.isLoading ? (
            <LoadingState />
          ) : !paymentsQuery.data || paymentsQuery.data.data.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="لا توجد تحصيلات"
              description="لم تُسجَّل أي دفعات لهذا الموزع"
            />
          ) : (
            <>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsQuery.data.data.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDateTime(p.paymentDate)}
                        </TableCell>
                        <TableCell className="num font-medium">
                          {formatMoney(p.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === 'ACTIVE' ? 'success' : 'secondary'
                            }
                          >
                            {p.status === 'ACTIVE' ? 'نشطة' : 'معكوسة'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {p.notes ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {paymentsQuery.data.meta.totalPages > 1 && (
                <Pagination
                  page={paymentsPage}
                  totalPages={paymentsQuery.data.meta.totalPages}
                  onPageChange={setPaymentsPage}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <DistributorFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        initialData={d}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}