'use client';

import { Card } from '@/components/ui/card';
import { Users, Lock, Activity } from 'lucide-react';

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold text-foreground">0</p>
              <p className="text-muted-foreground text-xs mt-2">Users in the system</p>
            </div>
            <div className="bg-primary/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Active Users Card */}
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Active Users</p>
              <p className="text-3xl font-bold text-foreground">0</p>
              <p className="text-muted-foreground text-xs mt-2">Currently active</p>
            </div>
            <div className="bg-accent/20 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        {/* Admin Users Card */}
        <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-1">Admin Users</p>
              <p className="text-3xl font-bold text-foreground">0</p>
              <p className="text-muted-foreground text-xs mt-2">Administrator accounts</p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-lg">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="text-foreground font-medium">No recent activity</p>
              <p className="text-muted-foreground text-sm">User activities will appear here</p>
            </div>
          </div>
        </div>
      </Card>

      {/* User Roles Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">User Roles</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-foreground">Administrators</span>
            </div>
            <span className="font-semibold text-foreground">0</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-foreground">Station Operators</span>
            </div>
            <span className="font-semibold text-foreground">0</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-foreground">Viewers</span>
            </div>
            <span className="font-semibold text-foreground">0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
