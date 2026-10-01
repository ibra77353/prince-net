import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { useCashReport } from '../hooks/useCashReport';
import { formatMoney } from '../../../lib/currency';
import { formatDateTime } from '../../../lib/format';
import { cn } from '../../../lib/utils';

interface CashReportTabProps {
  dateFrom: string;
  dateTo: string;
}

export function CashReportTab({ dateFrom, dateTo }: CashReportTabProps) {
  const { data, isLoading, isError, error, refetch } = useCashReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    return (
      <ErrorState
        title="تعذّر تحميل تقرير الصندوق"
        message={error instanceof Error ? error.message : 'حدث خطأ'}
        onRetry={() => refetch()}
      />
    );
  }

  const chartData = [
    { name: 'افتتاحي', value: Number(data.summary.opening) },
    { name: 'وارد', value: Number(data.summary.totalIn) },
    { name: 'صادر', value: Number(data.summary.totalOut) },
    { name: 'ختامي', value: Number(data.summary.closing) },
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="الرصيد الافتتاحي"
          value={formatMoney(data.summary.opening)}
          icon={Wallet}
        />
        <StatCard
          title="إجمالي الوارد"
          value={formatMoney(data.summary.totalIn)}
          icon={ArrowDownCircle}
          variant="success"
        />
        <StatCard
          title="إجمالي الصادر"
          value={formatMoney(data.summary.totalOut)}
          icon={ArrowUpCircle}
          variant="destructive"
        />
        <StatCard
          title="الرصيد الختامي"
          value={formatMoney(data.summary.closing)}
          icon={Wallet}
        />
      </div>

      {/* Chart */}
      <div className="rounded-md border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">ملخص الحركة</h3>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => formatMoney(String(value))}
                contentStyle={{ direction: 'rtl' }}
              />
              <Legend wrapperStyle={{ direction: 'rtl', fontSize: '12px' }} />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                name="المبلغ"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        {data.rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="لا توجد حركات"
            description="لم تُسجَّل حركات في الفترة المحددة"
            className="border-0 bg-transparent"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الاتجاه</TableHead>
                <TableHead>المصدر</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(row.date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.direction === 'IN' ? 'success' : 'destructive'}
                    >
                      {row.direction === 'IN' ? 'وارد' : 'صادر'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{row.sourceType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                    {row.description || '—'}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'num font-medium',
                      row.direction === 'IN'
                        ? 'text-green-600'
                        : 'text-red-600',
                    )}
                  >
                    {row.direction === 'IN' ? '+' : '-'}
                    {formatMoney(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Badge variant="secondary" className="text-xs">
        {data.rows.length} حركة
      </Badge>
    </div>
  );
}
