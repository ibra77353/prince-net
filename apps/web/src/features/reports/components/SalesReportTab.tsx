import { useState } from 'react';
import { Banknote, CreditCard, ShoppingCart } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
import { StatCard } from '../../dashboard/components/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { EmptyState } from '../../../components/ui/empty-state';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { useSalesReport } from '../hooks/useSalesReport';
import { useDistributors } from '../../distributors/hooks/useDistributors';
import { usePackages } from '../../packages/hooks/usePackages';
import { formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/format';

interface SalesReportTabProps {
  dateFrom: string;
  dateTo: string;
}

export function SalesReportTab({ dateFrom, dateTo }: SalesReportTabProps) {
  const [distributorId, setDistributorId] = useState<string>('');
  const [packageId, setPackageId] = useState<string>('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'CANCELLED'>(
    'ACTIVE',
  );

  const distributorsQuery = useDistributors({
    page: 1,
    limit: 100,
    status: 'ACTIVE',
  });
  const packagesQuery = usePackages({
    page: 1,
    limit: 100,
    status: 'ACTIVE',
  });

  const { data, isLoading, isError, error, refetch } = useSalesReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    distributorId: distributorId || undefined,
    packageId: packageId || undefined,
    status: status === 'ALL' ? undefined : status,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    return (
      <ErrorState
        title="تعذّر تحميل تقرير المبيعات"
        message={error instanceof Error ? error.message : 'حدث خطأ'}
        onRetry={() => refetch()}
      />
    );
  }

  // Chart data: تجميع rows حسب التاريخ — للعرض فقط
  const chartData = (() => {
    const byDate = new Map<string, number>();
    for (const row of data.rows) {
      const day = row.date.slice(0, 10);
      const current = byDate.get(day) ?? 0;
      byDate.set(day, current + Number(row.total));
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date: date.slice(5), total }));
  })();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">الموزع</Label>
          <Select
            value={distributorId || 'ALL'}
            onValueChange={(v) => setDistributorId(v === 'ALL' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">الكل</SelectItem>
              {distributorsQuery.data?.data.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">الباقة</Label>
          <Select
            value={packageId || 'ALL'}
            onValueChange={(v) => setPackageId(v === 'ALL' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">الكل</SelectItem>
              {packagesQuery.data?.data.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">الحالة</Label>
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(v as 'ALL' | 'ACTIVE' | 'CANCELLED')
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">نشطة</SelectItem>
              <SelectItem value="CANCELLED">ملغاة</SelectItem>
              <SelectItem value="ALL">الكل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="عدد الفواتير"
          value={String(data.summary.salesCount)}
          icon={ShoppingCart}
        />
        <StatCard
          title="إجمالي المبيعات"
          value={formatMoney(data.summary.totalSales)}
          icon={ShoppingCart}
        />
        <StatCard
          title="المدفوع"
          value={formatMoney(data.summary.totalPaid)}
          icon={CreditCard}
          variant="success"
        />
        <StatCard
          title="المتبقي"
          value={formatMoney(data.summary.totalRemaining)}
          icon={Banknote}
          variant="destructive"
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-sm font-medium mb-3">المبيعات اليومية</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="salesReportGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => formatMoney(String(value))}
                  labelStyle={{ direction: 'rtl' }}
                  contentStyle={{ direction: 'rtl' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  fill="url(#salesReportGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        {data.rows.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="لا توجد بيانات"
            description="لم تُسجَّل مبيعات في الفترة المحددة"
            className="border-0 bg-transparent"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>الموزع</TableHead>
                <TableHead>الباقة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, i) => (
                <TableRow key={`${row.invoiceNumber}-${i}`}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="num text-sm font-medium">
                    {row.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.distributorName}
                  </TableCell>
                  <TableCell className="text-sm">{row.packageName}</TableCell>
                  <TableCell className="num">{row.quantity}</TableCell>
                  <TableCell className="num font-medium">
                    {formatMoney(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Badge variant="secondary" className="text-xs">
        {data.rows.length} صف
      </Badge>
    </div>
  );
}
