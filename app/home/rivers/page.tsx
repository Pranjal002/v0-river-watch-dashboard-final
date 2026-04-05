'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Waves, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [deleteRiverId, setDeleteRiverId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (!deleteRiverId) return;
    try {
      setIsDeleting(true);
      await riverAPI.delete(deleteRiverId);
      fetchRivers();
    } catch (err) {
      console.error('Failed to delete river:', err);
    } finally {
      setIsDeleting(false);
      setDeleteRiverId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30 shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rivers</h1>
              <p className="text-muted-foreground mt-1">Manage river monitoring locations</p>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 shadow-md transition-all duration-300"
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
                      className="gap-2 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 shadow-md transition-all duration-300"
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
                          <th className="px-6 py-4 text-right font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rivers.map((river, index) => (
                          <tr
                            key={river.id}
                            className={`border-b border-border transition-colors hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                              }`}
                          >
                            <td className="px-6 py-4 text-foreground font-medium">{river.id}</td>
                            <td className="px-6 py-4 text-foreground">{river.name}</td>
                            <td className="px-6 py-4 text-foreground">{river.location}</td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteRiverId(river.id)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
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

        <AlertDialog open={deleteRiverId !== null} onOpenChange={(open) => !open && setDeleteRiverId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the river and remove its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteConfirm();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
