import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

interface ReportDateRangeProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function ReportDateRange({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: ReportDateRangeProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <Label className="text-xs" htmlFor="rptDateFrom">
          من تاريخ
        </Label>
        <Input
          id="rptDateFrom"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs" htmlFor="rptDateTo">
          إلى تاريخ
        </Label>
        <Input
          id="rptDateTo"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
        />
      </div>
    </div>
  );
}
