import { Database, RotateCcw } from 'lucide-react';
import type { Backup } from '@prince-net/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { formatDateTime } from '../../../lib/format';
import { formatFileSize } from '../../../lib/file-size';

interface BackupsTableProps {
  data: Backup[];
  onRestore: (backup: Backup) => void;
}

function shortChecksum(checksum: string): string {
  return checksum.slice(0, 12);
}

export function BackupsTable({ data, onRestore }: BackupsTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="لا توجد نسخ احتياطية"
        description="ابدأ بإنشاء نسخة جديدة"
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الملف</TableHead>
            <TableHead>الحجم</TableHead>
            <TableHead>عدد السجلات</TableHead>
            <TableHead>Checksum</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((backup) => (
            <TableRow key={backup.id}>
              <TableCell className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[280px]">
                    {backup.fileName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="num text-sm">
                {formatFileSize(backup.sizeBytes)}
              </TableCell>
              <TableCell className="num text-sm">
                {backup.recordCount}
              </TableCell>
              <TableCell className="num text-xs text-muted-foreground">
                {shortChecksum(backup.checksum)}…
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap">
                {formatDateTime(backup.createdAt)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(backup)}
                  className="text-destructive hover:text-destructive"
                >
                  <RotateCcw className="me-1 h-3.5 w-3.5" />
                  استعادة
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
