import type { AuditAction } from '@prince-net/types';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { AUDIT_ACTIONS } from '../../../lib/audit-actions';

interface AuditLogsFiltersProps {
  action: AuditAction | 'ALL';
  onActionChange: (v: AuditAction | 'ALL') => void;
  entityType: string;
  onEntityTypeChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
}

export function AuditLogsFilters({
  action,
  onActionChange,
  entityType,
  onEntityTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: AuditLogsFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <Label className="text-xs">العملية</Label>
        <Select
          value={action}
          onValueChange={(v) => onActionChange(v as AuditAction | 'ALL')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">الكل</SelectItem>
            {AUDIT_ACTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">نوع الكيان</Label>
        <Input
          placeholder="مثال: Sale, Package..."
          value={entityType}
          onChange={(e) => onEntityTypeChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs" htmlFor="auditDateFrom">
          من تاريخ
        </Label>
        <Input
          id="auditDateFrom"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs" htmlFor="auditDateTo">
          إلى تاريخ
        </Label>
        <Input
          id="auditDateTo"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
        />
      </div>
    </div>
  );
}
