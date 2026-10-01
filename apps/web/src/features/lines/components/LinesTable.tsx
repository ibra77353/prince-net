import { Link } from 'react-router-dom';
import { MoreHorizontal, Wifi } from 'lucide-react';
import type { Line } from '@prince-net/types';
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

interface LinesTableProps {
  data: Line[];
  onEdit: (line: Line) => void;
}

export function LinesTable({ data, onEdit }: LinesTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Wifi}
        title="لا توجد خطوط"
        description="ابدأ بإضافة خط جديد"
      />
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>المزود</TableHead>
            <TableHead>المعرّف</TableHead>
            <TableHead>التكلفة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((line) => (
            <TableRow key={line.id}>
              <TableCell className="font-medium">
                <Link to={`/lines/${line.id}`} className="hover:underline">
                  {line.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm">{line.provider}</TableCell>
              <TableCell className="num text-sm">{line.identifier}</TableCell>
              <TableCell className="num">
                {formatMoney(line.cost)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={line.status === 'ACTIVE' ? 'success' : 'secondary'}
                >
                  {line.status === 'ACTIVE' ? 'مفعّل' : 'معطّل'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/lines/${line.id}`}>عرض التفاصيل</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(line)}>
                      تعديل
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}