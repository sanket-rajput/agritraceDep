import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { WasteReport, Listing, Order } from './types';

export async function createWasteReport(values: Omit<Partial<WasteReport>, 'id' | 'reportedAt' | 'lastUpdate' | 'status'> & { farmerId: string }) {
  const payload = {
    ...values,
    status: 'Reported',
    reportedAt: serverTimestamp(),
    lastUpdate: serverTimestamp(),
  } as Partial<WasteReport>;
  const ref = await addDoc(collection(db, 'wasteReports'), payload as any);
  return ref.id;
}

export async function updateWasteReportStatus(reportId: string, update: Partial<Pick<WasteReport, 'status' | 'collectionAgent' | 'collectionAgentId'>>) {
  const ref = doc(db, 'wasteReports', reportId);
  await updateDoc(ref, { ...update, lastUpdate: serverTimestamp() } as Partial<WasteReport>);
}

export function reportsQueryForUser(userId: string, role?: string) {
  if (role === 'agent') {
    // Agents see all reports ordered by reportedAt
    return query(collection(db, 'wasteReports'), orderBy('reportedAt', 'desc'));
  }

  return query(collection(db, 'wasteReports'), where('farmerId', '==', userId), orderBy('reportedAt', 'desc'));
}

// Listings helpers
export async function createListing(data: Omit<Listing, 'id' | 'createdAt'>): Promise<string> {
  const payload: Partial<Listing> = {
    ...data,
    // serverTimestamp returns a FieldValue; cast to any for Firestore write
    createdAt: serverTimestamp() as any,
  };
  const ref = await addDoc(collection(db, 'listings'), payload as any);
  return ref.id;
}

export function listingsQuery() {
  // For now, show all listings ordered by newest first. We can add filters for role/user later.
  return query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const payload: Partial<Order> = {
    ...data,
    status: 'Pending',
    createdAt: serverTimestamp() as any,
  };
  try {
    const ref = await addDoc(collection(db, 'orders'), payload as any);
    return ref.id;
  } catch (err: any) {
    console.error('createOrder failed:', err);
    // Throw a sanitized error to avoid leaking internal SDK messages to clients
    throw new Error('Failed to persist order');
  }
}

export function ordersQueryForBuyer(buyerId: string) {
  return query(collection(db, 'orders'), where('buyerId', '==', buyerId), orderBy('createdAt', 'desc'));
}

export function ordersQueryForSeller(sellerId: string) {
  return query(collection(db, 'orders'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
} 

 
