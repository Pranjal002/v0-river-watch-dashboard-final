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
        <div className="max-w-3xl mx-auto p-12 w-full">
          <h1 className="text-3xl font-bold mb-8 text-foreground">View Gauge Readings</h1>
          <Card className="p-8 bg-card border-border">
            <div className="space-y-8">
              <div className="relative">
                <div className="flex items-center gap-4 mb-3 text-muted-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 font-semibold text-primary-foreground">1</div>
                  <h2 className="text-lg">Select River Basin</h2>
                </div>
                <div className="pl-[2.2rem]">
                  <select
                    value={selectedRiverId}
                    onChange={(e) => handleRiverSelect(e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-input focus:outline-none focus:ring-1 focus:ring-ring appearance-none text-foreground text-lg font-medium shadow-sm transition-all"
                  >
                    <option value="" disabled className="text-muted-foreground">— Choose a river —</option>
                    {rivers.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <div className={`flex items-center gap-4 mb-3 ${selectedRiverId ? 'text-muted-foreground' : 'text-muted-foreground'} transition-colors`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold transition-colors ${selectedRiverId ? 'bg-blue-600 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
                  <h2 className="text-lg">Select Gauging Station</h2>
                </div>
                <div className="pl-[2.2rem]">
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    disabled={!selectedRiverId}
                    className="w-full p-4 rounded-xl border border-border bg-input focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40 appearance-none text-foreground text-lg font-medium transition-all"
                  >
                    <option value="" disabled>— Select a river first —</option>
                    {availableStations.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <Button
                  onClick={submitSelection}
                  disabled={!selectedStationId || loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl text-lg font-semibold min-w-40 transition-all opacity-100 disabled:opacity-50"
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
