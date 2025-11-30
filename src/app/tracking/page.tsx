import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteReportsTable } from '@/components/tracking/waste-reports-table';
import { wasteReports } from '@/lib/data';

export default function TrackingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Waste Tracking
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>All Waste Reports</CardTitle>
          <CardDescription>
            Live status of all agricultural waste collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WasteReportsTable reports={wasteReports} />
        </CardContent>
      </Card>
    </div>
  );
}
