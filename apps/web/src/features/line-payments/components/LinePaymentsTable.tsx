import { CreditCard, RotateCcw } from 'lucide-react';
import type { LinePayment } from '@prince-net/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { Pagination } from '../../../components/ui/pagination';
import { formatMoney } from '../../../lib/currency';
import { formatDateTime } from '../../../lib/format';

interface LinePaymentsTableProps {
  data: LinePayment[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReverse: (payment: LinePayment) => void;
}

export function LinePaymentsTable({
  data,
  page,
  totalPages,
  onPageChange,
  onReverse,
}: LinePaymentsTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="لا توجد دفعات"
        description="لم تُسجَّل أي دفعة لهذا الخط"
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>التاريخ</TableHead>
            <TableHead>الفترة</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>ملاحظات</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((payment) => {
            const isActive = payment.status === 'ACTIVE';

            return (
              <TableRow key={payment.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDateTime(payment.paymentDate)}
                </TableCell>
                <TableCell className="num text-sm">{payment.period}</TableCell>
                <TableCell className="num font-medium">
                  {formatMoney(payment.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={isActive ? 'success' : 'secondary'}>
                    {isActive ? 'نشطة' : 'معكوسة'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                  {payment.reversalReason
                    ? `معكوسة: ${payment.reversalReason}`
                    : (payment.notes ?? '—')}
                </TableCell>
                <TableCell>
                  {isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReverse(payment)}
                      className="text-destructive hover:text-destructive"
                    >
                      <RotateCcw className="me-1 h-3.5 w-3.5" />
                      عكس
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}