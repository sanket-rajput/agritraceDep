export type WasteReport = {
  id: string;
  farmerName: string;
  cropType: 'Wheat' | 'Corn' | 'Rice' | 'Sugarcane' | 'Cotton';
  quantity: number; // in tonnes
  location: string;
  status: 'Reported' | 'Collected' | 'In-Transit' | 'Received' | 'Processing' | 'Completed';
  collectionAgent: string;
  reportedAt: Date;
  lastUpdate: Date;
  payment: number;
  paymentStatus: 'Pending' | 'Paid';
};
