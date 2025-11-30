'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { wasteReports } from '@/lib/data';
import { format, subDays } from 'date-fns';

const chartConfig = {
  quantity: {
    label: 'Quantity (tons)',
    color: 'hsl(var(--accent))',
  },
};

export function CollectionOverTimeChart() {
  const data = React.useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const relevantReports = wasteReports.filter(
      (report) => report.lastUpdate >= thirtyDaysAgo && (report.status === 'Completed' || report.status === 'Processing')
    );

    const dailyData = relevantReports.reduce((acc, report) => {
      const day = format(report.lastUpdate, 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + report.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyData)
      .map(([date, quantity]) => ({
        date,
        quantity,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillQuantity" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-quantity)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-quantity)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="quantity"
          type="natural"
          fill="url(#fillQuantity)"
          fillOpacity={0.4}
          stroke="var(--color-quantity)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
