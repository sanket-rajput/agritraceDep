'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import type { WasteReport } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Props = {
  reports: WasteReport[];
};

const statusColors: Record<WasteReport['status'], string> = {
  Reported: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Collected: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'In-Transit': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Received: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const availableStatuses: WasteReport['status'][] = [
  'Received',
  'Processing',
  'Completed',
];

export function RecyclingDashboardTable({ reports: initialReports }: Props) {
  const [reports, setReports] = React.useState(initialReports);
  const { toast } = useToast();

  const handleStatusUpdate = (reportId: string, newStatus: WasteReport['status']) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, status: newStatus, lastUpdate: new Date() } : report
      )
    );
    toast({
      title: 'Status Updated',
      description: `Report ${reportId} has been updated to "${newStatus}".`,
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Report ID</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Crop Type</TableHead>
            <TableHead className="text-right">Quantity (t)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.id}</TableCell>
              <TableCell>{report.collectionAgent}</TableCell>
              <TableCell>{report.cropType}</TableCell>
              <TableCell className="text-right">{report.quantity}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    'border-transparent',
                    statusColors[report.status]
                  )}
                >
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Shipment Details</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {availableStatuses.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            disabled={report.status === status}
                            onClick={() => handleStatusUpdate(report.id, status)}
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
