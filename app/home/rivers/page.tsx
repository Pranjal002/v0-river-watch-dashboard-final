'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Waves } from 'lucide-react';
import AddRiverForm from '@/components/add-river-form';
import { riverAPI } from '@/lib/api';

interface River {
  id: number;
  name: string;
  location: string;
}

interface RiverResponse {
  statusCode: number;
  data: {
    items: River[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
  errors: null | string;
}

export default function RiversPage() {
  const [showForm, setShowForm] = useState(false);
  const [rivers, setRivers] = useState<River[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRivers();
  }, []);

  const fetchRivers = async () => {
    try {
      setLoading(true);
      setError('');
      const response: RiverResponse = await riverAPI.getPaged(1, 10);
      
      if (response.data) {
        setRivers(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch rivers:', err);
      setError('Failed to load rivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchRivers(); // Refresh the list after adding a river
  };

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
            <AddRiverForm onBack={handleFormClose} />
          ) : (
            <>
              {loading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading rivers...</p>
                </Card>
              ) : error ? (
                <Card className="p-8">
                  <div className="text-center text-destructive">
                    <p className="font-medium mb-4">{error}</p>
                    <Button 
                      onClick={fetchRivers}
                      variant="outline"
                      className="gap-2"
                    >
                      Retry
                    </Button>
                  </div>
                </Card>
              ) : totalCount === 0 ? (
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
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">ID</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Name</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rivers.map((river, index) => (
                          <tr 
                            key={river.id}
                            className={`border-b border-border transition-colors hover:bg-muted/50 ${
                              index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                            }`}
                          >
                            <td className="px-6 py-4 text-foreground font-medium">{river.id}</td>
                            <td className="px-6 py-4 text-foreground">{river.name}</td>
                            <td className="px-6 py-4 text-foreground">{river.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
