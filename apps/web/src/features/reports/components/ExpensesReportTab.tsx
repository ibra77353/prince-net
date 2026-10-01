import { TrendingDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LoadingState } from '../../../components/ui/loading-state';
import { ErrorState } from '../../../components/ui/error-state';
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
import { useExpensesReport } from '../hooks/useExpensesReport';
import { formatMoney } from '../../../lib/currency';

interface ExpensesReportTabProps {
  dateFrom: string;
  dateTo: string;
}

export function ExpensesReportTab({
  dateFrom,
  dateTo,
}: ExpensesReportTabProps) {
  const { data, isLoading, isError, error, refetch } = useExpensesReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    return (
      <ErrorState
        title="تعذّر تحميل تقرير المصروفات"
        message={error instanceof Error ? error.message : 'حدث خطأ'}
        onRetry={() => refetch()}
      />
    );
  }

  if (data.rows.length === 0) {
    return (
      <EmptyState
        icon={TrendingDown}
        title="لا توجد مصروفات"
        description="لم تُسجَّل مصروفات في الفترة المحددة"
      />
    );
  }

  const chartData = data.rows.map((row) => ({
    name: row.categoryName,
    total: Number(row.total),
  }));

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="rounded-md border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">المصروفات حسب التصنيف</h3>
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
              <Bar
                dataKey="total"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التصنيف</TableHead>
              <TableHead>العدد</TableHead>
              <TableHead>الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.categoryId}>
                <TableCell className="font-medium">
                  {row.categoryName}
                </TableCell>
                <TableCell className="num">{row.count}</TableCell>
                <TableCell className="num font-medium">
                  {formatMoney(row.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Badge variant="secondary" className="text-xs">
        {data.rows.length} تصنيف
      </Badge>
    </div>
  );
}
