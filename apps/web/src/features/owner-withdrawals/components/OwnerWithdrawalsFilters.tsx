import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface OwnerWithdrawalsFiltersProps {
  status: 'ALL' | 'ACTIVE' | 'REVERSED';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'REVERSED') => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

export function OwnerWithdrawalsFilters({
  status,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: OwnerWithdrawalsFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1">
        <Label className="text-xs">الحالة</Label>
        <Select
          value={status}
          onValueChange={(v) =>
            onStatusChange(v as 'ALL' | 'ACTIVE' | 'REVERSED')
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">الكل</SelectItem>
            <SelectItem value="ACTIVE">نشط</SelectItem>
            <SelectItem value="REVERSED">معكوس</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs" htmlFor="owDateFrom">
          من تاريخ
        </Label>
        <Input
          id="owDateFrom"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs" htmlFor="owDateTo">
          إلى تاريخ
        </Label>
        <Input
          id="owDateTo"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
        />
      </div>
    </div>
  );
}
