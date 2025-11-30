import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Leaf, AlertTriangle, Tractor, DollarSign } from 'lucide-react';
import { wasteReports } from '@/lib/data';

export function StatsCards() {
  const totalWasteCollected = wasteReports
    .filter((report) => report.status === 'Completed' || report.status === 'Processing')
    .reduce((sum, report) => sum + report.quantity, 0);

  const pendingReports = wasteReports.filter(
    (report) => report.status === 'Reported'
  ).length;
  
  const inTransit = wasteReports.filter(
    (report) => report.status === 'Collected' || report.status === 'In-Transit'
  ).length;

  const totalIncome = wasteReports
    .filter((report) => report.paymentStatus === 'Paid')
    .reduce((sum, report) => sum + report.payment, 0);

  const stats = [
    {
      title: 'Total Waste Collected',
      value: `${totalWasteCollected.toFixed(1)} tons`,
      icon: <Leaf className="h-5 w-5 text-muted-foreground" />,
      description: 'Total biomass processed',
    },
    {
      title: 'Pending Reports',
      value: pendingReports,
      icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
      description: 'New waste reports awaiting collection',
    },
    {
      title: 'Collections In-Transit',
      value: inTransit,
      icon: <Tractor className="h-5 w-5 text-muted-foreground" />,
      description: 'Waste currently being transported',
    },
    {
      title: 'Total Income Generated',
      value: `$${(totalIncome / 1000).toFixed(1)}k`,
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
      description: 'Payments made to farmers',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
