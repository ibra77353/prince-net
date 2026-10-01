import { MoreHorizontal, RotateCcw, Wallet } from 'lucide-react';
import type { OwnerWithdrawal } from '@prince-net/types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { EmptyState } from '../../../components/ui/empty-state';
import { formatMoney } from '../../../lib/currency';
import { formatDate } from '../../../lib/format';

interface OwnerWithdrawalsTableProps {
  data: OwnerWithdrawal[];
  onReverse: (withdrawal: OwnerWithdrawal) => void;
}

export function OwnerWithdrawalsTable({
  data,
  onReverse,
}: OwnerWithdrawalsTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="لا توجد سحوبات"
        description="لم تُسجَّل أي سحوبات للمالك بعد"
      />
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>التاريخ</TableHead>
            <TableHead>السبب</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>ملاحظات</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((w) => {
            const isActive = w.status === 'ACTIVE';

            return (
              <TableRow key={w.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDate(w.withdrawalDate)}
                </TableCell>
                <TableCell className="font-medium max-w-[240px] truncate">
                  {w.reason}
                </TableCell>
                <TableCell className="num font-medium">
                  {formatMoney(w.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={isActive ? 'success' : 'secondary'}>
                    {isActive ? 'نشط' : 'معكوس'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {w.reversalReason
                    ? `معكوس: ${w.reversalReason}`
                    : (w.notes ?? '—')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isActive ? (
                        <DropdownMenuItem
                          onClick={() => onReverse(w)}
                          className="text-destructive"
                        >
                          <RotateCcw className="me-2 h-4 w-4" />
                          عكس
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          لا توجد إجراءات
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
