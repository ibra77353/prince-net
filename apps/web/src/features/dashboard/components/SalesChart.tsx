import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardSalesPoint } from '@prince-net/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatMoney } from '../../../lib/currency';

interface SalesChartProps {
  data: DashboardSalesPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  const formatted = data.map((point) => ({
    date: point.date.slice(5), // MM-DD
    total: Number(point.total),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">مبيعات آخر 30 يومًا</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatted}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => formatMoney(String(value))}
                labelStyle={{ direction: 'rtl' }}
                contentStyle={{ direction: 'rtl' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                fill="url(#salesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}