import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecyclingDashboardTable } from '@/components/recycling/recycling-dashboard-table';
import { wasteReports } from '@/lib/data';

export default function RecyclingPage() {
  const incomingWaste = wasteReports.filter(
    (r) => r.status !== 'Reported' && r.status !== 'Completed'
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Recycling Center Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Incoming Waste</CardTitle>
          <CardDescription>
            Manage and track all active waste collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecyclingDashboardTable reports={incomingWaste} />
        </CardContent>
      </Card>
    </div>
  );
}
