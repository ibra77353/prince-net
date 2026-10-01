import { Link } from 'react-router-dom';
import { MoreHorizontal, Users } from 'lucide-react';
import type { Distributor } from '@prince-net/types';
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
import { formatDate } from '../../../lib/format';

interface DistributorsTableProps {
  data: Distributor[];
  onEdit: (d: Distributor) => void;
}

export function DistributorsTable({ data, onEdit }: DistributorsTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="لا يوجد موزعون"
        description="ابدأ بإضافة موزع جديد"
      />
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ التسجيل</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">
                <Link
                  to={`/distributors/${d.id}`}
                  className="hover:underline"
                >
                  {d.name}
                </Link>
              </TableCell>
              <TableCell className="num">{d.phone}</TableCell>
              <TableCell>
                <Badge
                  variant={d.status === 'ACTIVE' ? 'success' : 'secondary'}
                >
                  {d.status === 'ACTIVE' ? 'مفعّل' : 'معطّل'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(d.registrationDate)}
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
                      <Link to={`/distributors/${d.id}`}>
                        عرض التفاصيل
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(d)}>
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