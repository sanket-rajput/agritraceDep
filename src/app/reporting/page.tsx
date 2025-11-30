import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteReportForm } from '@/components/reporting/waste-report-form';

export default function ReportingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Report Crop Waste
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>New Waste Report</CardTitle>
          <CardDescription>
            Fill out the form below to schedule a waste collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WasteReportForm />
        </CardContent>
      </Card>
    </div>
  );
}
