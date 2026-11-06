'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteStationId, setDeleteStationId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStations(pageNumber);
  }, [pageNumber]);

  const fetchStations = async (page = pageNumber) => {
    try {
      setLoading(true);
      setError('');
      const response = (await stationAPI.getPaged(page, pageSize)) as StationResponse;

      if (response?.data) {
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
    if (pageNumber === 1) {
      fetchStations(1);
    } else {
      setPageNumber(1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteStationId) return;
    try {
      setIsDeleting(true);
      await stationAPI.delete(deleteStationId);
      if (stations.length === 1 && pageNumber > 1) {
        setPageNumber(prev => prev - 1);
      } else {
        fetchStations(pageNumber);
      }
    } catch (err) {
      console.error('Failed to delete station:', err);
    } finally {
      setIsDeleting(false);
      setDeleteStationId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (pageNumber <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (pageNumber >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', pageNumber - 1, pageNumber, pageNumber + 1, '...', totalPages);
      }
    }
    return pages;
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
                className="gap-2 bg-[#008B9B] hover:bg-[#007A88] text-white dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-[#008B9B] dark:border-zinc-800 shadow-md transition-all duration-300"
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
                      className="gap-2 bg-[#008B9B] hover:bg-[#007A88] text-white dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-[#008B9B] dark:border-zinc-800 shadow-md transition-all duration-300"
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

                  {totalCount > 10 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/40">
                      <span className="text-sm text-muted-foreground font-medium">
                        Showing <span className="text-foreground font-bold">{(pageNumber - 1) * pageSize + 1}</span> to <span className="text-foreground font-bold">{Math.min(pageNumber * pageSize, totalCount)}</span> of <span className="text-foreground font-bold">{totalCount}</span> results
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                          disabled={pageNumber === 1 || loading}
                          className="gap-1 bg-transparent border-border text-foreground hover:bg-muted text-sm font-medium h-9 px-3 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </Button>
                        <div className="flex items-center space-x-1">
                          {getPageNumbers().map((pageNum, idx) => (
                            pageNum === '...' ? (
                              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-muted-foreground">...</span>
                            ) : (
                              <Button
                                key={`page-${pageNum}`}
                                variant={pageNumber === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPageNumber(pageNum as number)}
                                disabled={loading}
                                className={`h-9 w-9 p-0 text-sm font-medium ${
                                  pageNumber === pageNum
                                    ? 'bg-primary text-primary-foreground border-transparent'
                                    : 'bg-transparent border-border text-foreground hover:bg-muted'
                                }`}
                              >
                                {pageNum}
                              </Button>
                            )
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
                          disabled={pageNumber >= totalPages || loading}
                          className="gap-1 bg-transparent border-border text-foreground hover:bg-muted text-sm font-medium h-9 px-3 disabled:opacity-50"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
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
