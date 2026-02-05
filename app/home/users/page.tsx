'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UserDashboard from '@/components/user-dashboard';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-border z-30">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage system users and their permissions</p>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pb-0 border-t border-border">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              User List
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' ? (
            <UserDashboard />
          ) : (
            <Card className="p-8 text-center border-dashed">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">No users yet</p>
                <p className="mb-4">Users will appear here once you add them</p>
                <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                  <Plus className="w-4 h-4" />
                  Create First User
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
