'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Waves } from 'lucide-react';
import AddRiverForm from '@/components/add-river-form';

export default function RiversPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-border z-30">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rivers</h1>
              <p className="text-muted-foreground mt-1">Manage river monitoring locations</p>
            </div>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Plus className="w-4 h-4" />
                Add River
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {showForm ? (
            <AddRiverForm onBack={() => setShowForm(false)} />
          ) : (
            <Card className="p-8 text-center border-dashed">
              <div className="text-muted-foreground">
                <div className="flex justify-center mb-3">
                  <div className="bg-primary/20 p-4 rounded-lg">
                    <Waves className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">No rivers configured</p>
                <p className="mb-4">Add your first river to get started monitoring water levels</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Create First River
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
