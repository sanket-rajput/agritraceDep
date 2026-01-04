import { useCallback } from 'react';
import * as service from '@/lib/firebase-service';
import type { Listing } from '@/lib/types';

export function useFirebase() {
  const createReport = useCallback(async (data: unknown) => {
    try {
      return await service.createWasteReport(data as any);
    } catch (err) {
      console.error('createReport error', err);
      throw err;
    }
  }, []);

  const updateStatus = useCallback(async (reportId: string, update: Partial<any>) => {
    try {
      return await service.updateWasteReportStatus(reportId, update as any);
    } catch (err) {
      console.error('updateStatus error', err);
      throw err;
    }
  }, []);

  const createListing = useCallback(async (data: Omit<Listing, 'id' | 'createdAt'>) => {
    try {
      return await service.createListing(data);
    } catch (err) {
      console.error('createListing error', err);
      throw err;
    }
  }, []);

  const createOrder = useCallback(async (data: { listingId: string; buyerId: string; sellerId: string; price: number }) => {
    try {
      return await service.createOrder(data as any);
    } catch (err) {
      console.error('createOrder error', err);
      throw err;
    }
  }, []);

  const ordersQueryForBuyer = useCallback((buyerId: string) => service.ordersQueryForBuyer(buyerId), []);
  const ordersQueryForSeller = useCallback((sellerId: string) => service.ordersQueryForSeller(sellerId), []);

  return {
    createReport,
    updateStatus,
    createListing,
    createOrder,
    ordersQueryForBuyer,
    ordersQueryForSeller,
    reportsQueryForUser: service.reportsQueryForUser,
    listingsQuery: service.listingsQuery,
  };
} 
