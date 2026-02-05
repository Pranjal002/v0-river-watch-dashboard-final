'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import AddStationForm from '@/components/add-station-form';

export default function StationsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-border z-30">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Monitoring Stations</h1>
              <p className="text-muted-foreground mt-1">Manage water level monitoring stations</p>
            </div>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Plus className="w-4 h-4" />
                Add Station
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {showForm ? (
            <AddStationForm onBack={() => setShowForm(false)} />
          ) : (
            <Card className="p-8 text-center border-dashed">
              <div className="text-muted-foreground">
                <div className="flex justify-center mb-3">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <MapPin className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">No stations configured</p>
                <p className="mb-4">Add monitoring stations to track water levels at specific locations</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Create First Station
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
