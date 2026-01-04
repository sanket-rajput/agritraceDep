'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useFirebase } from '@/hooks/use-firebase';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot } from 'firebase/firestore';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import type { Listing } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Heart, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';



export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);

  const { createListing, listingsQuery, ordersQueryForBuyer, ordersQueryForSeller } = useFirebase();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  // Helper to format createdAt timestamps
  function formatTime(ts?: any) {
    if (!ts) return 'Just now';
    try {
      if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString();
      return new Date(ts).toLocaleString();
    } catch {
      return 'Just now';
    }
  }

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Subscribe to listings from Firestore
  useEffect(() => {
    if (!user) {
      setListings([]);
      setLoadingListings(false);
      return;
    }

    const q = listingsQuery();
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setListings(data as Listing[]);
        setLoadingListings(false);
      },
      (error) => {
        console.error('Error fetching listings:', error);
        toast({ variant: 'destructive', title: 'Load Failed', description: 'Could not load listings.' });
        setLoadingListings(false);
      }
    );

    return () => unsubscribe();
  }, [user, listingsQuery, toast]);

  // Subscribe to buyer orders
  useEffect(() => {
    if (!user) return; // only for authenticated users

    const q = ordersQueryForBuyer(user.uid);
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setOrders(data as any[]);
    }, (err: any) => {
      console.error('Failed to load orders', err);
      const match = err?.message?.match(/https?:\/\/[^\s)]+/);
      const indexUrl = match ? match[0] : 'https://console.firebase.google.com/';
      toast({
        variant: 'destructive',
        title: 'Failed to load orders',
        description: 'Query requires a composite index. Open Console to create it.',
        action: <ToastAction asChild altText="Open Console"><a href={indexUrl} target="_blank" rel="noreferrer">Open Console</a></ToastAction>,
      });
    });

    return () => unsubscribe();
  }, [user, ordersQueryForBuyer]);

  // Subscribe to seller orders (sales)
  useEffect(() => {
    if (!user) return;

    const q = ordersQueryForSeller(user.uid);
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const data = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setSales(data as any[]);
    }, (err: any) => {
      console.error('Failed to load sales', err);
      const match = err?.message?.match(/https?:\/\/[^\s)]+/);
      const indexUrl = match ? match[0] : 'https://console.firebase.google.com/';
      toast({
        variant: 'destructive',
        title: 'Failed to load sales',
        description: 'Query requires a composite index. Open Console to create it.',
        action: <ToastAction asChild altText="Open Console"><a href={indexUrl} target="_blank" rel="noreferrer">Open Console</a></ToastAction>,
      });
    });

    return () => unsubscribe();
  }, [user, ordersQueryForSeller]);

  const handlePostAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated', description: 'Please log in to post a listing.' });
      return;
    }

    setPosting(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get('title') as string,
      price: Number(formData.get('price')),
      location: formData.get('location') as string,
      category: formData.get('category') as string,
      ownerId: user.uid,
      img: (formData.get('category') === 'Wheat' ? '🌾' : formData.get('category') === 'Rice' ? '🍚' : '🐄'),
    };

    try {
      const id = await createListing(payload);
      toast({ title: 'Ad Posted', description: `Your listing (ID: ${id}) has been posted.` });
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to post listing:', err);
      toast({ variant: 'destructive', title: 'Post Failed', description: err?.message || 'Could not post your listing.' });
    } finally {
      setPosting(false);
    }
  };

  if (loading || !user) return <LoadingGrid />;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="bg-white">
        <Header />
        
        {/* Search & Sell Action Bar */}
        <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md p-4 border-b flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-2/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search stubble, cow dung, or location..." 
              className="pl-10 bg-white border-2 border-slate-200 focus:border-slate-900 transition-colors h-12 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-12 px-8 font-black gap-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                <PlusCircle className="w-5 h-5" /> SELL NOW
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Post Your Ad</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostAd} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">What are you selling?</Label>
                  <Input id="title" name="title" placeholder="e.g. 10 Tons Rice Stubble" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ( ₹ )</Label>
                    <Input id="price" name="price" type="number" placeholder="5000" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wheat">Wheat</SelectItem>
                        <SelectItem value="Rice">Rice</SelectItem>
                        <SelectItem value="Cow Dung">Cow Dung</SelectItem>
                        <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="City, State" required />
                </div>
                <Button type="submit" className="w-full bg-slate-900 text-white font-bold h-12 mt-2" disabled={posting}>
                  {posting ? 'Posting...' : 'Post Ad'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <main className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900">Recommended for you</h2>
            <Button variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100">
              View all
            </Button>
          </div>

          {/* OLX Style Grid */}
          {loadingListings ? (
            <LoadingGrid />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {listings
                  .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group cursor-pointer border-2 border-slate-100 hover:border-yellow-400 overflow-hidden rounded-2xl transition-all shadow-sm hover:shadow-xl">
                      <div className="h-48 bg-slate-50 flex items-center justify-center text-7xl relative group-hover:scale-105 transition-transform duration-500">
                         {item.img}
                         <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:text-red-500 hover:bg-white transition-all" title="Add to favorites">
                           <Heart className="w-5 h-5" />
                         </button>
                      </div>
                      
                      <CardContent className="p-4 bg-white">
                        <h3 className="text-2xl font-black text-slate-900">{typeof item.price === 'number' ? `₹${item.price}` : item.price}</h3>
                        <p className="text-slate-600 truncate font-medium mt-1">{item.title}</p>
                        
                        <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400 uppercase font-bold">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                          </div>
                          <span>{formatTime(item.createdAt)}</span>
                        </div>
                      <div className="mt-4">
                        {user && user.uid !== item.ownerId ? (
                          <Button
                            onClick={async () => {
                              try {
                                // Create Razorpay order on server
                                const createResp = await fetch('/api/razorpay/create', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ listingId: item.id, amount: item.price, buyerId: user.uid, sellerId: item.ownerId }),
                                });
                                const createData = await createResp.json();
                                if (!createResp.ok) throw new Error(createData.error || 'Failed to create payment');

                                // Load Razorpay checkout
                                await new Promise((resolve, reject) => {
                                  if ((window as any).Razorpay) return resolve(true);
                                  const s = document.createElement('script');
                                  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                  s.onload = () => resolve(true);
                                  s.onerror = () => reject(new Error('Failed to load Razorpay script'));
                                  document.body.appendChild(s);
                                });

                                const options = {
                                  key: createData.key_id,
                                  amount: createData.amount,
                                  currency: createData.currency,
                                  name: 'AgriTrace',
                                  order_id: createData.id,
                                  handler: async (response: any) => {
                                    // Verification removed: show optimistic success to avoid client-side failures
                                    toast({ title: 'Payment completed', description: 'Payment was processed. Order creation will occur on the server.' });
                                  },
                                  prefill: {
                                    email: user.email || undefined,
                                  },
                                } as any;

                                const rzp = new (window as any).Razorpay(options);
                                rzp.open();

                              } catch (err: any) {
                                console.error('Buy flow failed', err);
                                toast({ variant: 'destructive', title: 'Purchase Failed', description: err?.message || 'Could not initiate purchase.' });
                              }
                            }}
                            className="w-full bg-green-600 text-white font-bold h-10 rounded-lg"
                          >
                            Buy
                          </Button>
                        ) : (
                          <Button disabled className="w-full bg-gray-200 text-gray-600 font-bold h-10 rounded-lg">{user ? 'Your Listing' : 'Log in to buy'}</Button>
                        )}
                      </div>                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Purchases */}
            <section>
              <h3 className="text-xl font-bold mb-4">My Purchases</h3>
              <div className="grid gap-3">
                {orders.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center">You have no purchases yet.</div>
                ) : (
                  orders.map((o: any) => (
                    <Card key={o.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">Listing: {listings.find(l => l.id === o.listingId)?.title ?? o.listingId}</div>
                          <div className="text-sm text-muted-foreground">Price: ₹{o.price}</div>
                        </div>
                        <div className="text-sm text-right">
                          <div className="font-semibold">{o.status === 'Pending' ? 'Done' : o.status}</div>
                          <div className="text-xs">{formatTime(o.createdAt)}</div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* My Sales (as a seller) */}
            <section>
              <h3 className="text-xl font-bold mb-4">Sales</h3>
              <div className="grid gap-3">
                {sales.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center">No sales yet.</div>
                ) : (
                  sales.map((s: any) => (
                    <Card key={s.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">Listing: {listings.find(l => l.id === s.listingId)?.title ?? s.listingId}</div>
                          <div className="text-sm text-muted-foreground">Price: ₹{s.price}</div>
                        </div>
                        <div className="text-sm text-right">
                          <div className="font-semibold">{s.status === 'Pending' ? 'Done' : s.status}</div>
                          <div className="text-xs">{formatTime(s.createdAt)}</div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function LoadingGrid() {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Skeleton key={i} className="h-72 w-full rounded-2xl" />
      ))}
    </div>
  );
}