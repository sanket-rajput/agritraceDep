'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Heart, MapPin, Search, Camera, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

// Initial Mock Data
const INITIAL_LISTINGS = [
  { id: 1, title: 'Dry Wheat Stubble - 5 Tons', price: '₹6,000', location: 'Ludhiana, PB', time: '2 days ago', img: '🌾', category: 'Wheat' },
  { id: 2, title: 'Fresh Rice Husk for Fuel', price: '₹1,500', location: 'Karnal, HR', time: '5 hours ago', img: '🍚', category: 'Rice' },
  { id: 3, title: 'Organic Cow Dung Cakes', price: '₹200', location: 'Meerut, UP', time: 'Just now', img: '🐄', category: 'Cow Dung' },
  { id: 4, title: 'Sugarcane Bagasse', price: '₹4,200', location: 'Surat, GJ', time: '1 day ago', img: '🎋', category: 'Sugarcane' },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handlePostAd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newAd = {
      id: Date.now(),
      title: formData.get('title') as string,
      price: `₹${formData.get('price')}`,
      location: formData.get('location') as string,
      time: 'Just now',
      img: formData.get('category') === 'Wheat' ? '🌾' : formData.get('category') === 'Rice' ? '🍚' : '🐄',
      category: formData.get('category') as string,
    };

    setListings([newAd, ...listings]);
    setIsDialogOpen(false);
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
                    <Label htmlFor="price">Price (₹)</Label>
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
                <Button type="submit" className="w-full bg-slate-900 text-white font-bold h-12 mt-2">
                  Publish Ad
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
                      <h3 className="text-2xl font-black text-slate-900">{item.price}</h3>
                      <p className="text-slate-600 truncate font-medium mt-1">{item.title}</p>
                      
                      <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400 uppercase font-bold">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                        </div>
                        <span>{item.time}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
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