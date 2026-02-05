'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Waves, Users, MapPin, Droplet, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface DashboardStats {
  totalRivers: number;
  totalStations: number;
  activeUsers: number;
  criticalAlerts: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRivers: 0,
    totalStations: 0,
    activeUsers: 0,
    criticalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
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

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // Replace with actual API calls when backend is ready
        // For now, we'll use placeholder data
        setStats({
          totalRivers: 12,
          totalStations: 45,
          activeUsers: 28,
          criticalAlerts: 3,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-border z-30">
          <div className="flex items-center justify-between p-6 max-w-full">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name || 'User'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Rivers */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Rivers</p>
                  <p className="text-3xl font-bold text-primary mt-2">{stats.totalRivers}</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Waves className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Total Stations */}
            <Card className="bg-gradient-to-br from-secondary/10 to-primary/5 border-secondary/20 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Stations
                  </p>
                  <p className="text-3xl font-bold text-secondary mt-2">
                    {stats.totalStations}
                  </p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            {/* Active Users */}
            <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Active Users</p>
                  <p className="text-3xl font-bold text-accent mt-2">{stats.activeUsers}</p>
                </div>
                <div className="bg-accent/20 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>

            {/* Critical Alerts */}
            <Card className="bg-gradient-to-br from-destructive/10 to-primary/5 border-destructive/20 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Critical Alerts</p>
                  <p className="text-3xl font-bold text-destructive mt-2">
                    {stats.criticalAlerts}
                  </p>
                </div>
                <div className="bg-destructive/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold">
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>Add Station</span>
                </div>
              </Button>
              <Button className="h-20 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-semibold">
                <div className="flex flex-col items-center gap-2">
                  <Waves className="w-5 h-5" />
                  <span>Add River</span>
                </div>
              </Button>
              <Button className="h-20 bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-white font-semibold">
                <div className="flex flex-col items-center gap-2">
                  <Droplet className="w-5 h-5" />
                  <span>Log Reading</span>
                </div>
              </Button>
              <Button className="h-20 bg-gradient-to-r from-primary/70 to-accent/70 hover:from-primary/60 hover:to-accent/60 text-white font-semibold">
                <div className="flex flex-col items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Add User</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome to RiverWatch
            </h3>
            <p className="text-muted-foreground mb-4">
              Your comprehensive water level management and monitoring system. Use the navigation menu on the left to manage users, rivers, and monitoring stations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground">📊 Monitor</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Track water levels in real-time
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">🚨 Alert</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Get notified of critical levels
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">📈 Analyze</p>
                <p className="text-muted-foreground text-xs mt-1">
                  View historical data trends
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
