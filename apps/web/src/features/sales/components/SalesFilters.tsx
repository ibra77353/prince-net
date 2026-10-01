import { Search } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useDistributors } from '../../distributors/hooks/useDistributors';

interface SalesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: 'ALL' | 'ACTIVE' | 'CANCELLED';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'CANCELLED') => void;
  distributorId: string;
  onDistributorChange: (value: string) => void;
}

export function SalesFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  distributorId,
  onDistributorChange,
}: SalesFiltersProps) {
  const distributorsQuery = useDistributors({
    page: 1,
    limit: 100,
    status: 'ACTIVE',
  });

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث برقم الفاتورة..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(v) =>
          onStatusChange(v as 'ALL' | 'ACTIVE' | 'CANCELLED')
        }
      >
        <SelectTrigger className="w-full lg:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">الكل</SelectItem>
          <SelectItem value="ACTIVE">نشطة</SelectItem>
          <SelectItem value="CANCELLED">ملغاة</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={distributorId || 'ALL'}
        onValueChange={(v) => onDistributorChange(v === 'ALL' ? '' : v)}
      >
        <SelectTrigger className="w-full lg:w-56">
          <SelectValue placeholder="الموزع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">كل الموزعين</SelectItem>
          {distributorsQuery.data?.data.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}