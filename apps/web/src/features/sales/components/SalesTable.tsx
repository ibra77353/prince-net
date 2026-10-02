import { Link } from 'react-router-dom';
import { Printer, ShoppingCart } from 'lucide-react';
import type { Sale } from '@prince-net/types';
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
import { formatMoney } from '../../../lib/currency';
import { formatDateTime } from '../../../lib/format';

interface SalesTableProps {
  data: Sale[];
}

export function SalesTable({ data }: SalesTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="لا توجد مبيعات"
        description="ابدأ بإنشاء فاتورة جديدة"
      />
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الفاتورة</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>الإجمالي</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-center">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                <Link
                  to={`/sales/${sale.id}`}
                  className="hover:underline num font-medium"
                >
                  {sale.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap">
                {formatDateTime(sale.saleDate)}
              </TableCell>
              <TableCell className="num font-medium">
                {formatMoney(sale.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={sale.status === 'ACTIVE' ? 'success' : 'destructive'}
                >
                  {sale.status === 'ACTIVE' ? 'نشطة' : 'ملغاة'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="طباعة / PDF"
                  onClick={() =>
                    window.open(`/sales/${sale.id}?print=1`, '_blank')
                  }
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}