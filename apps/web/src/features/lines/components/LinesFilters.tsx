import { Search } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface LinesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
}

export function LinesFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: LinesFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث بالاسم أو المزود أو المعرّف..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(v) =>
          onStatusChange(v as 'ALL' | 'ACTIVE' | 'INACTIVE')
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">الكل</SelectItem>
          <SelectItem value="ACTIVE">مفعّل</SelectItem>
          <SelectItem value="INACTIVE">معطّل</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}