'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { riverAPI, stationAPI, dashboardAPI } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface River { id: number; name: string; }
interface Station { id: number; name: string; riverId: number; }

// Helper functions for time calculations
const timeStrToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const getMinutesFromCapturedLabel = (label: string) => {
  if (!label) return 0;
  const parts = label.split(' '); // e.g., ["2026-04-01", "06:10", "AM"]
  if (parts.length < 3) return 0;
  const time = parts[1];
  const modifier = parts[2];
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12) {
    hours = modifier === 'AM' ? 0 : 12;
  } else {
    hours = modifier === 'PM' ? hours + 12 : hours;
  }
  return hours * 60 + minutes;
};

const transformData = (stationsData: any[]) => {
  const intervalMap = new Map<string, any>();
  
  stationsData.forEach(station => {
    const stationName = station.stationName;
    station.readings?.forEach((readingDay: any) => {
      const date = readingDay.date;
      readingDay.slots?.forEach((slot: any) => {
        const intervalKey = `${date} ${slot.slotLabel}`;
        if (!intervalMap.has(intervalKey)) {
          intervalMap.set(intervalKey, { interval: intervalKey });
        }
        
        const pointData = intervalMap.get(intervalKey);
        pointData[stationName] = slot.gaugeReading;
        
        const startMins = timeStrToMinutes(slot.slotStart);
        const endMins = timeStrToMinutes(slot.slotEnd);
        const capturedMins = getMinutesFromCapturedLabel(slot.capturedTimeLabel);
        
        const isWrongTime = capturedMins < startMins || capturedMins > endMins;
        
        pointData[`${stationName}_meta`] = {
          capturedTimeLabel: slot.capturedTimeLabel,
          isWrongTime
        };
      });
    });
  });
  
  return Array.from(intervalMap.values());
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-sm">
        <p className="font-bold mb-2 text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => {
          const meta = entry.payload[`${entry.dataKey}_meta`];
          const isWrong = meta?.isWrongTime;
          return (
            <div key={index} style={{ color: entry.color }} className="mb-2">
              <p className="font-semibold">{entry.name}: {entry.value}</p>
              {meta && (
                <div className="text-xs text-muted-foreground mt-1">
                  <p>uploaded time: {meta.capturedTimeLabel}</p>
                  <p className={isWrong ? "text-red-500 font-medium" : "text-blue-500 font-medium"}>
                    {isWrong ? "user have uploaded wrong image" : "user have uploaded in right time"}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props;
  const meta = payload[`${dataKey}_meta`];
  if (!meta) return <circle cx={cx} cy={cy} r={4} fill={props.stroke} stroke="#fff" strokeWidth={1} />;
  
  const fill = meta.isWrongTime ? "#dc2626" : "#2563eb";
  
  return (
    <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#fff" strokeWidth={2} />
  );
};

export default function CompareDataPage() {
  const [rivers, setRivers] = useState<River[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  
  const [selectedRiverId, setSelectedRiverId] = useState<string>('');
  const [selectedStationIds, setSelectedStationIds] = useState<string[]>([]);
  
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

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
    setSelectedStationIds([]);
    setChartData([]);
  };

  const toggleStation = (stationId: string) => {
    setSelectedStationIds(prev => 
      prev.includes(stationId) 
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    );
  };

  const submitComparison = async () => {
    if (!selectedRiverId || selectedStationIds.length === 0 || !fromDate || !toDate) {
      setError('Please fill in all fields to compare data.');
      return;
    }
    setError('');
    
    try {
      setLoading(true);
      const res: any = await dashboardAPI.getCompare(
        selectedRiverId, 
        selectedStationIds.join(','), 
        fromDate, 
        toDate
      );
      
      if (res && res.data && Array.isArray(res.data)) {
         setChartData(transformData(res.data));
      } else {
         setChartData([]);
         setError('No data found for the selected criteria.');
      }
    } catch (err: any) {
      console.error('Failed to fetch comparison data', err);
      setError(err.message || 'Failed to fetch comparison data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async (stationId: string, stationName: string) => {
    try {
      const blob = await dashboardAPI.exportExcel(selectedRiverId, stationId, fromDate, toDate, false);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${stationName}_compare_export.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed", err);
      setError("Failed to export data for " + stationName);
    }
  };

  const availableStations = stations.filter(s => s.riverId === Number(selectedRiverId));
  
  const lines = selectedStationIds.map((id, index) => {
    const station = stations.find(s => s.id.toString() === id);
    const name = station ? station.name : `Station ${id}`;
    const colors = ['#2563eb', '#16a34a', '#dc2626', '#eab308', '#9333ea', '#db2777'];
    const color = colors[index % colors.length];
    
    return { id, name, color };
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background text-foreground">
        <div className="max-w-4xl mx-auto p-8 w-full">
          <h1 className="text-2xl font-bold mb-6 text-foreground">Compare Gauge Readings</h1>
          <Card className="p-6 bg-card border-border mb-6 shadow-sm">
            <div className="space-y-6">
              {/* River Selection */}
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

              {/* Station Selection */}
              <div className="relative">
                <div className={`flex items-center gap-3 mb-2 ${selectedRiverId ? 'text-muted-foreground' : 'text-muted-foreground/60'} transition-colors`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full font-semibold text-xs transition-colors ${selectedRiverId ? 'bg-blue-600 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
                  <h2 className="text-base font-medium">Select Gauging Stations</h2>
                </div>
                <div className="pl-[2.2rem]">
                  {selectedRiverId && availableStations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableStations.map(s => (
                        <label key={s.id} className="flex items-center space-x-3 p-2.5 rounded-lg border border-border bg-input cursor-pointer hover:bg-accent/50 transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 bg-background border-border" 
                            checked={selectedStationIds.includes(s.id.toString())}
                            onChange={() => toggleStation(s.id.toString())}
                          />
                          <span className="text-foreground font-medium">{s.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full p-3 rounded-lg border border-border bg-input text-muted-foreground text-sm italic">
                      {selectedRiverId ? 'No stations available for this river.' : '— Select a river first —'}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates Selection */}
              <div className="relative">
                <div className={`flex items-center gap-3 mb-2 ${selectedStationIds.length > 0 ? 'text-muted-foreground' : 'text-muted-foreground/60'} transition-colors`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full font-semibold text-xs transition-colors ${selectedStationIds.length > 0 ? 'bg-blue-600 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
                  <h2 className="text-base font-medium">Select Date Range</h2>
                </div>
                <div className="pl-[2.2rem]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">From Date</label>
                      <input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        disabled={selectedStationIds.length === 0}
                        className="w-full p-3 rounded-lg border border-border bg-input focus:outline-none focus:ring-1 focus:ring-ring appearance-none text-foreground text-base shadow-sm transition-all disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">To Date</label>
                      <input 
                        type="date" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        disabled={selectedStationIds.length === 0}
                        className="w-full p-3 rounded-lg border border-border bg-input focus:outline-none focus:ring-1 focus:ring-ring appearance-none text-foreground text-base shadow-sm transition-all disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="pl-[2.2rem] text-destructive font-medium">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={submitComparison}
                  disabled={!selectedRiverId || selectedStationIds.length === 0 || !fromDate || !toDate || loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold min-w-32 transition-all opacity-100 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Compare Data'}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Chart Display */}
          {chartData.length > 0 && (
            <div className="space-y-8">
              {/* Individual Station Graphs */}
              {lines.map((line) => (
                <Card key={`individual-${line.id}`} className="p-6 bg-card border-border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-foreground">{line.name} Graph</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleExportExcel(line.id, line.name)}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                        <XAxis 
                          dataKey="interval" 
                          stroke="currentColor" 
                          className="text-muted-foreground text-xs" 
                          tick={{ fill: 'currentColor' }}
                        />
                        <YAxis 
                          stroke="currentColor" 
                          className="text-muted-foreground text-xs" 
                          label={{ value: 'Gauge Reading (m)', angle: -90, position: 'insideLeft', fill: 'currentColor' }}
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={line.name} 
                          stroke={line.color} 
                          dot={<CustomDot />}
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              ))}

              {/* Comparison Graph */}
              {lines.length > 1 && (
                <Card className="p-6 bg-card border-border shadow-sm">
                  <h2 className="text-lg font-bold mb-4 text-foreground">Comparison Graph</h2>
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                        <XAxis 
                          dataKey="interval" 
                          stroke="currentColor" 
                          className="text-muted-foreground text-xs" 
                          tick={{ fill: 'currentColor' }}
                        />
                        <YAxis 
                          stroke="currentColor" 
                          className="text-muted-foreground text-xs" 
                          label={{ value: 'Gauge Reading (m)', angle: -90, position: 'insideLeft', fill: 'currentColor' }}
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {lines.map((line) => (
                          <Line 
                            key={line.id}
                            type="monotone" 
                            dataKey={line.name} 
                            stroke={line.color} 
                            dot={<CustomDot />}
                            activeDot={{ r: 8 }} 
                            strokeWidth={2}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

