import { Timestamp } from 'firebase/firestore';

export type WasteReport = {
  id: string;
  farmerName: string;
  farmerId: string;
  cropType: 'Wheat' | 'Corn' | 'Rice' | 'Sugarcane' | 'Cotton';
  quantity: number; // in tonnes
  location: string;
  notes?: string;
  status: 'Reported' | 'Collected' | 'In-Transit' | 'Received' | 'Processing' | 'Completed';
  collectionAgent?: string;
  collectionAgentId?: string;
  reportedAt: Timestamp | Date;
  lastUpdate: Timestamp | Date;
  payment?: number;
  paymentStatus?: 'Pending' | 'Paid';
};

export type Listing = {
  id?: string;
  title: string;
  price: number;
  location: string;
  category: string;
  ownerId: string;
  img?: string;
  createdAt?: Timestamp | Date;
};

export type Order = {
  id?: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  status?: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';
  createdAt?: Timestamp | Date;
};
