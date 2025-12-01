'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecyclingDashboardTable } from '@/components/recycling/recycling-dashboard-table';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { WasteReport } from '@/lib/types';
import { WasteReportsTableSkeleton } from '@/components/tracking/waste-reports-table-skeleton';
import { Info } from 'lucide-react';

export default function RecyclingPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For agents, show all non-completed reports.
    // In a real-world scenario, you'd likely filter by agent assignment.
    const q = query(
      collection(db, 'wasteReports'),
      where('status', '!=', 'Completed'),
      orderBy('status'),
      orderBy('reportedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: WasteReport[] = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() } as WasteReport);
      });
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="flex min-h-svh flex-col">
        <Header />
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Assigned Collections
            </h1>
            <Card>
              <CardHeader>
                <CardTitle>Incoming Waste</CardTitle>
                <CardDescription>
                  Manage and track all active waste collections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <WasteReportsTableSkeleton />
                ) : reports.length > 0 ? (
                  <RecyclingDashboardTable reports={reports} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center">
                    <Info className="h-10 w-10 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">No Pending Collections</h2>
                    <p className="text-muted-foreground">
                      There are currently no active waste reports assigned.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
