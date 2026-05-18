'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Waves, Users, MapPin, Droplet, Plus, ArrowRight, Loader2, Info } from 'lucide-react';
import { apiCall } from '@/lib/api';
import AddUserModal from '@/app/home/modals/addUserModal';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface DashboardStats {
  totalRivers: number;
  totalStations: number;
  totalStationUsers: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRivers: 0,
    totalStations: 0,
    totalStationUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }

    const fetchDashboardData = async () => {
      try {
        // Call the /DashBoard API endpoint using the established apiCall method
        const data = await apiCall<DashboardStats>('/DashBoard');

        setStats({
          totalRivers: data.totalRivers || 0,
          totalStations: data.totalStations || 0,
          totalStationUsers: data.totalStationUsers || 0,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleUserCreated = () => {
    setStats(prev => ({ ...prev, totalStationUsers: prev.totalStationUsers + 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium tracking-wide">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 dark:bg-accent/10 blur-[100px]" />
      </div>

      <Sidebar />

      <main className="flex-1 overflow-auto z-10">
        {/* Modern Glassmorphic Header */}
        <header className="sticky top-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 z-30 transition-all duration-300">
          <div className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                Overview
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Welcome back, {user?.name || 'Administrator'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground font-medium">System Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 ring-2 ring-background">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">

          {/* Bento Box Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Stat Card 1 */}
            <Card
              onClick={() => router.push('/home/rivers')}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                <Waves className="w-24 h-24 text-primary" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Waves className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-600 dark:text-zinc-300">Monitored Rivers</h3>
                </div>
                <div>
                  <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stats.totalRivers}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center gap-1">
                    <span className="text-emerald-500 flex items-center"><ArrowRight className="w-3 h-3 -rotate-45 mr-1" /> Active</span> across regions
                  </p>
                </div>
              </div>
            </Card>

            {/* Stat Card 2 */}
            <Card
              onClick={() => router.push('/home/stations')}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                <MapPin className="w-24 h-24 text-secondary" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary ring-1 ring-secondary/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-600 dark:text-zinc-300">Active Stations</h3>
                </div>
                <div>
                  <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stats.totalStations}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center gap-1">
                    Reporting real-time data
                  </p>
                </div>
              </div>
            </Card>

            {/* Stat Card 3 */}
            <Card
              onClick={() => router.push('/home/users')}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                <Users className="w-24 h-24 text-accent" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-600 dark:text-zinc-300">Station Users</h3>
                </div>
                <div>
                  <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stats.totalStationUsers}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center gap-1">
                    Managing field operations
                  </p>
                </div>
              </div>
            </Card>

          </div>

          {/* Quick Actions Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <button
                onClick={() => router.push('/home/stations')}
                className="group relative flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white text-primary transition-all duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white mb-1">Add Station</span>
                <span className="text-sm text-muted-foreground">Register new monitoring point</span>
              </button>

              <button
                onClick={() => router.push('/home/rivers')}
                className="group relative flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-secondary/50 dark:hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white text-secondary transition-all duration-300">
                  <Waves className="w-5 h-5" />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white mb-1">Add River</span>
                <span className="text-sm text-muted-foreground">Define new water bodies</span>
              </button>

              <button
                onClick={() => router.push('/home/readings')}
                className="group relative flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white text-emerald-500 transition-all duration-300">
                  <Droplet className="w-5 h-5" />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white mb-1">Log Reading</span>
                <span className="text-sm text-muted-foreground">Record manual level data</span>
              </button>

              <button
                onClick={() => router.push('/home/users/add')}
                className="group relative flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-accent/50 dark:hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-accent group-hover:text-white text-accent transition-all duration-300">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white mb-1">Add User</span>
                <span className="text-sm text-muted-foreground">Add new Station Users</span>
              </button>

            </div>
          </div>

          {/* Info Section - Modernized */}
          <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-900 dark:to-black border-0 p-8 text-white shadow-xl mt-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-zinc-100">RiverWatch Platform</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your comprehensive water level management system. Use the modular tools above to track stations, manage data flow, and add operational personnel for field readings.
                </p>
              </div>

              <div className="flex gap-4 self-stretch md:self-auto flex-wrap">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[120px] backdrop-blur-sm">
                  <p className="text-xs text-zinc-400 font-medium mb-1">Status</p>
                  <p className="text-sm font-semibold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[120px] backdrop-blur-sm">
                  <p className="text-xs text-zinc-400 font-medium mb-1">Network</p>
                  <p className="text-sm font-semibold">Secure Sync</p>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </main>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSuccess={handleUserCreated}
        />
      )}
    </div>
  );
}
