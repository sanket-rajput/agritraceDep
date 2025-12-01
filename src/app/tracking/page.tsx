'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteReportsTable } from '@/components/tracking/waste-reports-table';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { WasteReport } from '@/lib/types';
import { WasteReportsTableSkeleton } from '@/components/tracking/waste-reports-table-skeleton';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TrackingPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'wasteReports'),
      where('farmerId', '==', user.uid),
      orderBy('reportedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const reportsData: WasteReport[] = [];
        querySnapshot.forEach((doc) => {
          reportsData.push({ id: doc.id, ...doc.data() } as WasteReport);
        });
        setReports(reportsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reports: ', error);
        setLoading(false);
      }
    );

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
              Waste Tracking
            </h1>
            <Card>
              <CardHeader>
                <CardTitle>All Waste Reports</CardTitle>
                <CardDescription>
                  Live status of all your agricultural waste collections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <WasteReportsTableSkeleton />
                ) : reports.length > 0 ? (
                  <WasteReportsTable reports={reports} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center">
                    <Info className="h-10 w-10 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">No Reports Found</h2>
                    <p className="text-muted-foreground">
                      You haven't reported any waste yet.
                    </p>
                    <Button asChild>
                      <Link href="/reporting">Report Waste Now</Link>
                    </Button>
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
