import { Trash2, Plus } from 'lucide-react';
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form';
import type { CreateSaleInput } from '@prince-net/validation';
import type { PackageEntity } from '@prince-net/types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { usePackages } from '../../packages/hooks/usePackages';
import { formatMoney } from '../../../lib/currency';

interface SaleItemsInputProps {
  control: Control<CreateSaleInput>;
  register: UseFormRegister<CreateSaleInput>;
  errors: FieldErrors<CreateSaleInput>;
  disabled?: boolean;
}

export function SaleItemsInput({
  control,
  register,
  errors,
  disabled = false,
}: SaleItemsInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = useWatch({ control, name: 'items' });

  const packagesQuery = usePackages({
    page: 1,
    limit: 100,
    status: 'ACTIVE',
  });

  const packages = packagesQuery.data?.data ?? [];
  const packageMap = new Map<string, PackageEntity>(
    packages.map((p) => [p.id, p]),
  );

  const handleAdd = () => {
    append({ packageId: '', quantity: 1 });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>الباقات</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || packages.length === 0}
        >
          <Plus className="me-2 h-4 w-4" />
          إضافة باقة
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center border rounded-md">
          لم تُضف أي باقة بعد
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const currentId = watchedItems?.[index]?.packageId ?? '';
          const selectedPkg = currentId
            ? packageMap.get(currentId)
            : undefined;
          const itemErrors = errors.items?.[index];

          return (
            <div
              key={field.id}
              className="rounded-md border bg-muted/30 p-3 space-y-3"
            >
              <div className="flex items-start gap-2">
                {/* Package Select via Controller */}
                <div className="flex-1 min-w-0 space-y-1">
                  <Label className="text-xs">الباقة</Label>
                  <Controller
                    control={control}
                    name={`items.${index}.packageId`}
                    render={({ field: controllerField }) => (
                      <Select
                        value={controllerField.value}
                        onValueChange={controllerField.onChange}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الباقة" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name} — {formatMoney(pkg.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {itemErrors?.packageId && (
                    <p className="text-xs text-destructive">
                      {itemErrors.packageId.message}
                    </p>
                  )}
                </div>

                {/* Quantity via register */}
                <div className="w-24 space-y-1">
                  <Label className="text-xs">الكمية</Label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    {...register(`items.${index}.quantity`)}
                    disabled={disabled}
                  />
                  {itemErrors?.quantity && (
                    <p className="text-xs text-destructive">
                      {itemErrors.quantity.message}
                    </p>
                  )}
                </div>

                {/* Remove */}
                <div className="pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={disabled}
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {selectedPkg && (
                <p className="text-xs text-muted-foreground num">
                  سعر الوحدة: {formatMoney(selectedPkg.price)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {errors.items && typeof errors.items.message === 'string' && (
        <p className="text-xs text-destructive">{errors.items.message}</p>
      )}
    </div>
  );
}