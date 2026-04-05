'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Trash2 } from 'lucide-react';
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
import AddStationForm from '@/components/add-station-form';
import { stationAPI } from '@/lib/api';

interface Station {
  id: number;
  name: string;
  code: string;
  location: string;
  basin: string;
  latitude: number;
  longitude: number;
  elevation: number;
  riverId: number;
  riverName: string;
  remarks: string;
}

interface StationResponse {
  statusCode: number;
  data: {
    items: Station[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
  errors: null | string;
}

export default function StationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteStationId, setDeleteStationId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError('');
      const response: StationResponse = await stationAPI.getPaged(1, 10);

      if (response.data) {
        setStations(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch stations:', err);
      setError('Failed to load stations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchStations(); // Refresh the list after adding a station
  };

  const handleDeleteConfirm = async () => {
    if (!deleteStationId) return;
    try {
      setIsDeleting(true);
      await stationAPI.delete(deleteStationId);
      fetchStations();
    } catch (err) {
      console.error('Failed to delete station:', err);
    } finally {
      setIsDeleting(false);
      setDeleteStationId(null);
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
              <h1 className="text-3xl font-bold text-foreground">Monitoring Stations</h1>
              <p className="text-muted-foreground mt-1">Manage water level monitoring stations</p>
            </div>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 shadow-md transition-all duration-300"
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
            <AddStationForm onBack={handleFormClose} />
          ) : (
            <>
              {loading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading stations...</p>
                </Card>
              ) : error ? (
                <Card className="p-8">
                  <div className="text-center text-destructive">
                    <p className="font-medium mb-4">{error}</p>
                    <Button
                      onClick={fetchStations}
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
                      <div className="bg-secondary/20 p-4 rounded-lg">
                        <MapPin className="w-8 h-8 text-secondary" />
                      </div>
                    </div>
                    <p className="text-lg font-medium mb-2">No stations configured</p>
                    <p className="mb-4">Add monitoring stations to track water levels at specific locations</p>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="gap-2 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 shadow-md transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Station
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
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Code</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Location</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Basin</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">River</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Latitude</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Longitude</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Elevation</th>
                          <th className="px-6 py-4 text-left font-semibold text-foreground">Remarks</th>
                          <th className="px-6 py-4 text-right font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.map((station, index) => (
                          <tr
                            key={station.id}
                            className={`border-b border-border transition-colors hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                              }`}
                          >
                            <td className="px-6 py-4 text-foreground font-medium">{station.id}</td>
                            <td className="px-6 py-4 text-foreground font-medium">{station.name}</td>
                            <td className="px-6 py-4 text-foreground text-sm">{station.code}</td>
                            <td className="px-6 py-4 text-foreground">{station.location}</td>
                            <td className="px-6 py-4 text-foreground">{station.basin}</td>
                            <td className="px-6 py-4 text-foreground">{station.riverName}</td>
                            <td className="px-6 py-4 text-foreground text-sm">{station.latitude}</td>
                            <td className="px-6 py-4 text-foreground text-sm">{station.longitude}</td>
                            <td className="px-6 py-4 text-foreground text-sm">{station.elevation}</td>
                            <td className="px-6 py-4 text-foreground text-sm max-w-xs truncate">{station.remarks}</td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteStationId(station.id)}
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

        <AlertDialog open={deleteStationId !== null} onOpenChange={(open) => !open && setDeleteStationId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the station and remove its data.
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
