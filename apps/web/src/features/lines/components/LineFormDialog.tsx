import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createLineSchema,
  type CreateLineInput,
} from '@prince-net/validation';
import type { Line } from '@prince-net/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

interface LineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLineInput) => Promise<void>;
  initialData?: Line | null;
  isSubmitting: boolean;
}

/**
 * يحول Date إلى القيمة المطلوبة لـ input[type="date"].
 *
 * مثال:
 * Date -> "2026-10-01"
 *
 * يتم استخدام الوقت المحلي لتجنب مشاكل اختلاف اليوم بسبب UTC.
 */
function formatDateForInput(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * يحول قيمة input[type="date"] إلى Date محلي.
 *
 * نستخدم منتصف اليوم بدل:
 * new Date("2026-10-01")
 *
 * لأن الصيغة السابقة قد تُفسر كـ UTC وتسبب انزياحًا في التاريخ.
 */
function parseDateFromInput(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return new Date();
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return new Date();
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * يحول أي قيمة تاريخ قادمة من الـ API إلى Date آمنة.
 */
function toDate(value: Date | string): Date {
  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

export function LineFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}: LineFormDialogProps) {
  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLineInput>({
    resolver: zodResolver(createLineSchema),
    defaultValues: {
      name: '',
      provider: '',
      identifier: '',
      speed: '',
      cost: '',
      subscriptionDate: new Date(),
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      reset({
        name: initialData.name,
        provider: initialData.provider,
        identifier: initialData.identifier,
        speed: initialData.speed ?? '',
        cost: initialData.cost,
        subscriptionDate: toDate(initialData.subscriptionDate),
        notes: initialData.notes ?? '',
      });

      return;
    }

    reset({
      name: '',
      provider: '',
      identifier: '',
      speed: '',
      cost: '',
      subscriptionDate: new Date(),
      notes: '',
    });
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: CreateLineInput) => {
    const cleaned: CreateLineInput = {
      name: data.name.trim(),
      provider: data.provider.trim(),
      identifier: data.identifier.trim(),
      speed: data.speed?.trim() ? data.speed.trim() : null,
      cost: data.cost,
      subscriptionDate: data.subscriptionDate,
      notes: data.notes?.trim() ? data.notes.trim() : null,
    };

    await onSubmit(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'تعديل الخط' : 'إضافة خط جديد'}
          </DialogTitle>

          <DialogDescription>
            {isEdit ? 'عدّل بيانات الخط' : 'أدخل بيانات الخط'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          id="line-form"
        >
          {/* اسم الخط */}
          <div className="space-y-2">
            <Label htmlFor="name">اسم الخط</Label>

            <Input
              id="name"
              autoFocus
              placeholder="خط رئيسي"
              {...register('name')}
              disabled={isSubmitting}
            />

            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* المزود + المعرّف */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">المزود</Label>

              <Input
                id="provider"
                placeholder="اسم المزود"
                {...register('provider')}
                disabled={isSubmitting}
              />

              {errors.provider && (
                <p className="text-xs text-destructive">
                  {errors.provider.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">المعرّف</Label>

              <Input
                id="identifier"
                placeholder="رقم الحساب أو المعرّف"
                {...register('identifier')}
                disabled={isSubmitting}
              />

              {errors.identifier && (
                <p className="text-xs text-destructive">
                  {errors.identifier.message}
                </p>
              )}
            </div>
          </div>

          {/* السرعة + التكلفة */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="speed">السرعة (اختياري)</Label>

              <Input
                id="speed"
                placeholder="مثال: 100 Mbps"
                {...register('speed')}
                disabled={isSubmitting}
              />

              {errors.speed && (
                <p className="text-xs text-destructive">
                  {errors.speed.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">التكلفة الشهرية (ر.ي)</Label>

              <Input
                id="cost"
                type="text"
                inputMode="decimal"
                placeholder="مثال: 5,000"
                {...register('cost', {
                  setValueAs: (value) =>
                    typeof value === 'string'
                      ? value.replace(/,/g, '').trim()
                      : value,
                })}
                disabled={isSubmitting}
              />

              {errors.cost && (
                <p className="text-xs text-destructive">
                  {errors.cost.message}
                </p>
              )}
            </div>
          </div>

          {/* تاريخ الاشتراك */}
          <div className="space-y-2">
            <Label htmlFor="subscriptionDate">
              تاريخ الاشتراك
            </Label>

            <Controller
              name="subscriptionDate"
              control={control}
              render={({ field }) => (
                <Input
                  id="subscriptionDate"
                  type="date"
                  value={
                    field.value
                      ? formatDateForInput(toDate(field.value))
                      : ''
                  }
                  onChange={(event) => {
                    const value = event.target.value;

                    if (!value) {
                      field.onChange(new Date());
                      return;
                    }

                    field.onChange(parseDateFromInput(value));
                  }}
                  onBlur={field.onBlur}
                  disabled={isSubmitting}
                />
              )}
            />

            {errors.subscriptionDate && (
              <p className="text-xs text-destructive">
                {errors.subscriptionDate.message}
              </p>
            )}
          </div>

          {/* الملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>

            <Textarea
              id="notes"
              rows={3}
              placeholder="ملاحظات إضافية..."
              {...register('notes')}
              disabled={isSubmitting}
            />

            {errors.notes && (
              <p className="text-xs text-destructive">
                {errors.notes.message}
              </p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            form="line-form"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'جارٍ الحفظ...'
              : isEdit
                ? 'حفظ التعديلات'
                : 'إضافة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}