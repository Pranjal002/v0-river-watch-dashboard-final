'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { userAPI, apiCall } from '@/lib/api';
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

interface User {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  stationId: number;
  [key: string]: any;
}

interface RiverOption {
  id: number;
  name: string;
}

interface StationOption {
  id: number;
  name: string;
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Filters
  const [rivers, setRivers] = useState<RiverOption[]>([]);
  const [stations, setStations] = useState<StationOption[]>([]);

  const [selectedRiverId, setSelectedRiverId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');

  const [loadingRivers, setLoadingRivers] = useState(true);
  const [loadingStations, setLoadingStations] = useState(false);

  // Load Rivers
  useEffect(() => {
    const fetchRivers = async () => {
      try {
        const res: any = await apiCall('/river/drop-down-view');
        if (res?.data?.items) {
          setRivers(res.data.items);
        } else if (Array.isArray(res?.data)) {
          setRivers(res.data);
        }
      } catch (err) {
        console.error('Failed to load rivers', err);
      } finally {
        setLoadingRivers(false);
      }
    };
    fetchRivers();
  }, []);

  // Load Stations when River changes
  useEffect(() => {
    if (!selectedRiverId) {
      setStations([]);
      setSelectedStationId('');
      return;
    }

    const fetchStations = async () => {
      setLoadingStations(true);
      try {
        const res: any = await apiCall(`/station/drop-down/get-by-river/${selectedRiverId}`);
        setStations(res?.data || []);
      } catch (err) {
        console.error('Failed to load stations', err);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, [selectedRiverId]);

  // Load users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {};
      if (selectedRiverId) filters.riverId = selectedRiverId;
      if (selectedStationId) filters.stationId = selectedStationId;
      if (searchName) filters.fullName = searchName;

      // Note: We use pageNumber, and pass 0-indexed if api actually expects it, 
      // but payload snippet says `pageNumber: 0`. We'll pass `pageNumber` state.
      const res: any = await userAPI.getPagedUsers(pageNumber, pageSize, filters);

      if (res) {
        // Handle variations of response structure safely
        const data = res.data || res;
        const items = data.items || (Array.isArray(data) ? data : []);
        setUsers(Array.isArray(items) ? items : []);
        setTotalCount(data.totalCount || (Array.isArray(items) ? items.length : 0));
      }
    } catch (err: any) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pageNumber]);

  const handleSearch = () => {
    if (pageNumber !== 1) {
      setPageNumber(1); // Will trigger fetch
    } else {
      fetchUsers();
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setLoading(true);
      await apiCall(`/user/${userToDelete.id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setUserToDelete(null);
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const inputCls = "w-full md:w-auto px-3 py-2 rounded-lg border border-border text-sm bg-input text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-30 shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">View and manage system users</p>
            </div>
            <Button
              onClick={() => router.push('/home/users/add')}
              className="gap-2 bg-[#008B9B] hover:bg-[#007A88] text-white dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-[#008B9B] dark:border-zinc-800 shadow-md transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add StationUser
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <Card className="p-4 border border-border bg-card">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-1.5 w-full md:w-64">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">River</label>
                <div className="relative">
                  <select
                    className={inputCls + " w-full appearance-none"}
                    value={selectedRiverId}
                    onChange={(e) => {
                      setSelectedRiverId(e.target.value);
                      setSelectedStationId(''); // reset station
                    }}
                    disabled={loadingRivers}
                  >
                    <option value="">All Rivers</option>
                    {rivers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 w-full md:w-64">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Station</label>
                <div className="relative">
                  <select
                    className={inputCls + " w-full appearance-none"}
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    disabled={!selectedRiverId || loadingStations || stations.length === 0}
                  >
                    {!selectedRiverId ? (
                      <option value="">Select River First</option>
                    ) : (loadingStations) ? (
                      <option value="">Loading...</option>
                    ) : stations.length === 0 ? (
                      <option value="">No Stations Found</option>
                    ) : (
                      <>
                        <option value="">All Stations</option>
                        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 w-full flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  className={inputCls + " w-full"}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <Button onClick={handleSearch} className="gap-2 w-full md:w-auto bg-[#008B9B] hover:bg-[#007A88] text-white dark:bg-primary dark:text-primary-foreground min-w-[120px]">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </Card>

          {loading ? (
            <Card className="p-16 text-center flex flex-col items-center justify-center border-border">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading users...</p>
            </Card>
          ) : error ? (
            <Card className="p-8 border-destructive">
              <div className="text-center text-destructive">
                <p className="font-medium mb-4">{error}</p>
                <Button onClick={fetchUsers} variant="outline">Retry</Button>
              </div>
            </Card>
          ) : users.length === 0 ? (
            <Card className="p-16 text-center border-dashed border-border flex flex-col items-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xl font-bold mb-2 text-foreground">No users found</p>
              <p className="text-muted-foreground mb-6">There are no users matching your current filters.</p>
              <Button onClick={() => {
                setSelectedRiverId('');
                setSelectedStationId('');
                setSearchName('');
                setPageNumber(1);
                handleSearch();
              }} variant="outline">Clear Filters</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">SN</th>
                      <th className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">Full Name</th>
                      <th className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">Username</th>
                      <th className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">Password</th>
                      <th className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">Station</th>
                      <th className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">River</th>
                      <th className="px-6 py-4 font-semibold text-foreground whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-border transition-colors hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                      >
                        <td className="px-6 py-4 text-foreground font-medium">{(pageNumber - 1) * pageSize + index + 1}</td>
                        <td className="px-6 py-4 text-foreground font-medium">{user.fullName || '-'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{user.userName || user.username || user.email || '-'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{user.password || '-'}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.stationName || user.station ? (
                            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-semibold">
                              {user.stationName || user.station}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50 text-sm">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.riverName || user.river ? (
                            <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md text-xs font-semibold">
                              {user.riverName || user.river}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-primary/10 text-primary hover:bg-primary/20"
                              onClick={() => router.push(`/home/users/edit/${user.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                              onClick={() => setUserToDelete(user)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalCount > 0 && (
                <div className="flex items-center justify-between p-4 border-t border-border bg-muted/40">
                  <span className="text-sm text-muted-foreground font-medium">
                    Showing <span className="text-foreground">{(pageNumber - 1) * pageSize + 1}</span> to <span className="text-foreground">{Math.min(pageNumber * pageSize, totalCount)}</span> of <span className="text-foreground">{totalCount}</span> results
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                      disabled={pageNumber === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-16 text-center text-foreground">
                      {pageNumber} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
                      disabled={pageNumber >= totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user 
              <span className="font-semibold text-foreground"> {userToDelete?.fullName} </span> 
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
