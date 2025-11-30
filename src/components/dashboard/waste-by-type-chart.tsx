'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { wasteReports } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chartConfig = {
  quantity: {
    label: 'Quantity (tons)',
    color: 'hsl(var(--primary))',
  },
};

export function WasteByTypeChart() {
  const data = React.useMemo(() => {
    const wasteByType = wasteReports.reduce((acc, report) => {
      acc[report.cropType] = (acc[report.cropType] || 0) + report.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wasteByType).map(([cropType, quantity]) => ({
      cropType,
      quantity,
    }));
  }, []);

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="cropType"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="quantity" fill="var(--color-quantity)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
