import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardCashPoint } from '@prince-net/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatMoney } from '../../../lib/currency';

interface CashChartProps {
  data: DashboardCashPoint[];
}

export function CashChart({ data }: CashChartProps) {
  const formatted = data.map((point) => ({
    date: point.date.slice(5),
    in: Number(point.in),
    out: Number(point.out),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">حركة الصندوق - آخر 30 يومًا</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatted}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => formatMoney(String(value))}
                labelStyle={{ direction: 'rtl' }}
                contentStyle={{ direction: 'rtl' }}
              />
              <Legend
                wrapperStyle={{ direction: 'rtl', fontSize: '12px' }}
              />
              <Bar dataKey="in" fill="hsl(var(--primary))" name="وارد" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" fill="hsl(var(--destructive))" name="صادر" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}