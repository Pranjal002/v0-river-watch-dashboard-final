'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { riverAPI, stationAPI } from '@/lib/api';

interface River { id: number; name: string; }
interface Station { id: number; name: string; riverId: number; }

export default function ReadingsSelectionPage() {
  const router = useRouter();
  const [rivers, setRivers] = useState<River[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  const [selectedRiverId, setSelectedRiverId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      setLoading(true);
      const [riverRes, stationRes]: any[] = await Promise.all([
        riverAPI.getPaged(1, 100),
        stationAPI.getPaged(1, 100)
      ]);
      if (riverRes.data && riverRes.data.items) setRivers(riverRes.data.items);
      if (stationRes.data && stationRes.data.items) setStations(stationRes.data.items);
    } catch (err) {
      console.error('Initial fetch err', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRiverSelect = (id: string) => {
    setSelectedRiverId(id);
    setSelectedStationId('');
  };

  const submitSelection = () => {
    if (selectedStationId) {
      router.push(`/home/readings/${selectedStationId}`);
    }
  };

  const availableStations = stations.filter(s => s.riverId === Number(selectedRiverId));

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background text-foreground">
        <div className="max-w-xl mx-auto p-8 w-full">
          <h1 className="text-2xl font-bold mb-6 text-foreground">View Gauge Readings</h1>
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="space-y-6">
              <div className="relative">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 font-semibold text-primary-foreground text-xs">1</div>
                  <h2 className="text-base font-medium">Select River Basin</h2>
                </div>
                <div className="pl-[2.2rem]">
                  <select
                    value={selectedRiverId}
                    onChange={(e) => handleRiverSelect(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-input focus:outline-none focus:ring-1 focus:ring-ring appearance-none text-foreground text-base shadow-sm transition-all"
                  >
                    <option value="" disabled className="text-muted-foreground">— Choose a river —</option>
                    {rivers.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <div className={`flex items-center gap-3 mb-2 ${selectedRiverId ? 'text-muted-foreground' : 'text-muted-foreground/60'} transition-colors`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full font-semibold text-xs transition-colors ${selectedRiverId ? 'bg-blue-600 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
                  <h2 className="text-base font-medium">Select Gauging Station</h2>
                </div>
                <div className="pl-[2.2rem]">
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    disabled={!selectedRiverId}
                    className="w-full p-3 rounded-lg border border-border bg-input focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40 appearance-none text-foreground text-base transition-all"
                  >
                    <option value="" disabled>— Select a river first —</option>
                    {availableStations.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={submitSelection}
                  disabled={!selectedStationId || loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold min-w-32 transition-all opacity-100 disabled:opacity-50"
                >
                  View Readings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
