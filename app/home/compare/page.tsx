'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Activity, Check, Filter } from 'lucide-react';
import { riverAPI, stationAPI, dashboardAPI } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '@/components/sidebar';

interface River { id: number; name: string; }
interface Station { id: number; name: string; riverId: number; elevation?: string; }

const STATION_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#14b8a6", "#ec4899", "#eab308", "#6366f1"];
const RIVER_COLORS = ["#0ea5e9", "#14b8a6", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

// Helper functions
const timeStrToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const getMinutesFromCapturedLabel = (label: string) => {
  if (!label) return 0;
  const parts = label.split(' ');
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

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const validPayload = payload.filter((p: any) => p.value !== undefined && p.value !== null);
    if (validPayload.length === 0) return null;

    return (
      <div className="bg-popover text-popover-foreground border border-border rounded-lg p-3 shadow-lg z-10 text-sm">
        <p className="font-semibold mb-2 text-muted-foreground">{label}</p>
        {validPayload.map((entry: any, index: number) => {
          const meta = entry.payload[`${entry.dataKey}_meta`];
          const isAlert = entry.value > 8;
          return (
            <div key={index} className="mb-1 last:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                <span className="font-bold" style={{ color: entry.color }}>
                  {entry.name}: {entry.value.toFixed(2)}m
                </span>
                {isAlert && <span className="ml-1 text-xs text-destructive font-bold">● ALERT</span>}
              </div>
              {meta && (
                <div className="pl-4 mt-0.5 text-xs text-muted-foreground">
                  Uploaded: {meta.capturedTimeLabel}
                  {meta.isWrongTime && <span className="text-destructive block">⚠ Wrong Time</span>}
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
  if (cx === undefined || cy === undefined) return null;
  const meta = payload[`${dataKey}_meta`];
  if (!meta) return null;

  // Red for wrong time, Blue for right time
  const fill = meta.isWrongTime ? "#ef4444" : "#3b82f6";

  return (
    <circle cx={cx} cy={cy} r={4.5} fill={fill} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
  );
};

function KPICard({ label, value, sub, accent, icon }: { label: string, value: any, sub: string, accent: string, icon: React.ReactNode }) {
  return (
    <Card className="p-4 flex-1 min-w-[160px] bg-card border-border shadow-sm">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5 font-medium">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1 truncate">{sub}</div>}
    </Card>
  );
}

export default function CompareDataPage() {
  const [rivers, setRivers] = useState<River[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  const [selectedRiverId, setSelectedRiverId] = useState<string>('');
  const [selectedStationIds, setSelectedStationIds] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  const [loading, setLoading] = useState(false);
  const [rawApiData, setRawApiData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  const [viewMode, setViewMode] = useState<"stacked" | "overlay">("stacked");
  const [tableOpen, setTableOpen] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const ROWS_PER_PAGE = 12;

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

      const rData = riverRes.data?.items || [];
      const sData = stationRes.data?.items || [];
      setRivers(rData);
      setStations(sData);

      if (rData.length > 0) {
        const firstRId = rData[0].id.toString();
        setSelectedRiverId(firstRId);

        const rStations = sData.filter((s: any) => s.riverId.toString() === firstRId);
        if (rStations.length > 0) {
          setSelectedStationIds([rStations[0].id.toString()]);
        }
      }
    } catch (err) {
      console.error('Initial fetch err', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRiverId && selectedStationIds.length > 0 && fromDate && toDate) {
      submitComparison();
    }
  }, [selectedRiverId, selectedStationIds, fromDate, toDate]);

  const submitComparison = async () => {
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
        setRawApiData(res.data);
      } else {
        setRawApiData([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch comparison data', err);
      setError(err.message || 'Failed to fetch comparison data.');
      setRawApiData([]);
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
      a.download = `${stationName.replace(/\s+/g, '_')}_compare_${fromDate}_to_${toDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data for " + stationName);
    }
  };

  const toggleStation = (id: string) => {
    setSelectedStationIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const availableStations = stations.filter(s => s.riverId.toString() === selectedRiverId);
  const activeStations = availableStations.filter(s => selectedStationIds.includes(s.id.toString()));
  const selectedRiverObj = rivers.find(r => r.id.toString() === selectedRiverId);

  const chartData = useMemo(() => {
    const intervalMap = new Map<string, any>();

    rawApiData.forEach(station => {
      const stationName = station.stationName;
      station.readings?.forEach((readingDay: any) => {
        const date = readingDay.actualUploadedDate || readingDay.date;
        readingDay.slots?.forEach((slot: any) => {
          const intervalKey = `${date} ${slot.slotLabel}`;
          if (!intervalMap.has(intervalKey)) {
            let timeLabel = slot.slotLabel;
            if (timeLabel && timeLabel.includes(' - ')) {
              timeLabel = timeLabel.split(' - ')[0];
            }
            intervalMap.set(intervalKey, {
              interval: intervalKey,
              timeLabel: timeLabel,
              time: slot.slotLabel,
              date: date,
              sortKey: `${date} ${slot.slotStart || slot.slotLabel}`
            });
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

    return Array.from(intervalMap.values()).sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey));
  }, [rawApiData]);

  const allValues = chartData.flatMap(d => activeStations.map(s => d[s.name]).filter(v => v !== undefined && v !== null));
  const globalYMin = allValues.length ? Math.min(...allValues) : 0;
  const globalYMax = allValues.length ? Math.max(...allValues) : 10;
  const maxReading = allValues.length ? Math.max(...allValues) : 0;

  const tableData = useMemo(() => {
    const flat: any[] = [];
    rawApiData.forEach(station => {
      if (!selectedStationIds.includes(station.stationId.toString())) return;
      station.readings?.forEach((readingDay: any) => {
        readingDay.slots?.forEach((slot: any) => {
          flat.push({
            stationId: station.stationId.toString(),
            station: station.stationName,
            time: `${readingDay.actualUploadedDate || readingDay.date} ${slot.slotLabel}`,
            value: slot.gaugeReading
          });
        });
      });
    });
    return flat.sort((a, b) => a.time.localeCompare(b.time) || a.station.localeCompare(b.station));
  }, [rawApiData, selectedStationIds]);

  const paginatedTable = tableData.slice(tablePage * ROWS_PER_PAGE, (tablePage + 1) * ROWS_PER_PAGE);
  const totalPages = Math.ceil(tableData.length / ROWS_PER_PAGE);

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Global Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden text-foreground">

        {/* Header */}
        <div className="px-8 py-5 border-b border-border bg-card flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Compare Gauge Readings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Select parameters to compare river station data</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-xs font-semibold text-amber-500 animate-pulse bg-amber-500/10 px-2 py-1 rounded-full">FETCHING DATA...</span>}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-500">LIVE SYNC</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Filters Panel */}
          <div className="w-72 bg-card border-r border-border flex flex-col shrink-0 overflow-y-auto">

            {/* Dates */}
            <div className="p-5 border-b border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> Date Range</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Rivers */}
            <div className="p-5 border-b border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">River Basin</h3>
              <div className="space-y-1.5">
                {rivers.map((r, idx) => {
                  const rColor = RIVER_COLORS[idx % RIVER_COLORS.length];
                  const isSelected = selectedRiverId === r.id.toString();
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRiverId(r.id.toString());
                        const rvStations = stations.filter(s => s.riverId === r.id);
                        if (rvStations.length > 0) setSelectedStationIds([rvStations[0].id.toString()]);
                        else setSelectedStationIds([]);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted text-muted-foreground border border-transparent'
                        }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isSelected ? rColor : 'currentColor', opacity: isSelected ? 1 : 0.4 }} />
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stations */}
            <div className="p-5 border-b border-border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gauge Stations</h3>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedStationIds(availableStations.map(s => s.id.toString()))} className="text-[10px] font-bold text-primary hover:underline">ALL</button>
                  <button onClick={() => setSelectedStationIds([])} className="text-[10px] font-bold text-muted-foreground hover:underline">NONE</button>
                </div>
              </div>
              <div className="space-y-1.5">
                {availableStations.map((st, i) => {
                  const stIdStr = st.id.toString();
                  const isSelected = selectedStationIds.includes(stIdStr);
                  const stColor = isSelected ? STATION_COLORS[selectedStationIds.indexOf(stIdStr)] : "";

                  return (
                    <button
                      key={st.id}
                      onClick={() => toggleStation(stIdStr)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${isSelected ? 'bg-accent/50 text-foreground border border-border' : 'hover:bg-muted text-muted-foreground border border-transparent'
                        }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 ${isSelected ? 'border-transparent' : 'border-muted-foreground/40'}`} style={{ backgroundColor: isSelected ? stColor : 'transparent' }}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className="truncate flex-1 font-medium">{st.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Mode */}
            <div className="p-5 mt-auto bg-card border-t border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Chart Layout</h3>
              <div className="flex gap-1.5 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("stacked")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === "stacked" ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground border border-transparent"}`}
                >
                  Stacked
                </button>
                <button
                  onClick={() => setViewMode("overlay")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === "overlay" ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground border border-transparent"}`}
                >
                  Overlay
                </button>
              </div>
            </div>
          </div>

          {/* Main Dashboard Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">

            {/* KPIs */}
            <div className="p-6 pb-2 border-b border-border flex gap-4 flex-wrap shrink-0">
              <KPICard label="Max Reading" value={`${maxReading.toFixed(2)}m`} sub="Peak across active stations" accent="#3b82f6" icon={undefined} />
              <KPICard label="Active Stations" value={activeStations.length} sub={`Out of ${availableStations.length} total`} accent="#8b5cf6" icon={undefined} />
              <KPICard label="Scale Range" value={`${globalYMin.toFixed(1)}–${globalYMax.toFixed(1)}m`} sub="Global Y-axis domain" accent="currentColor" icon={undefined} />
            </div>

            {/* Charts & Table */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {activeStations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  <Activity className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium">Select stations from the left panel to begin monitoring</p>
                </div>
              ) : chartData.length === 0 && !loading ? (
                <div className="flex items-center justify-center h-[300px] border border-destructive/20 bg-destructive/5 rounded-xl text-destructive font-medium">
                  {error || "No data found for the selected date range."}
                </div>
              ) : viewMode === "overlay" ? (
                <Card className="overflow-hidden border-border">
                  <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-foreground">Overlay View</h3>
                      <p className="text-xs text-muted-foreground">{selectedRiverObj?.name} River · {activeStations.length} stations</p>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {activeStations.map((st, i) => (
                        <div key={st.id} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATION_COLORS[i % STATION_COLORS.length] }} />
                          <span className="text-xs font-medium text-muted-foreground">{st.name.split(" ")[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-[380px] p-4 pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          {activeStations.map((st, i) => {
                            const color = STATION_COLORS[i % STATION_COLORS.length];
                            return (
                              <linearGradient key={`grad-${st.id}`} id={`color-${st.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                        <XAxis dataKey="timeLabel" tick={{ fill: "currentColor", opacity: 0.5, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: "currentColor", opacity: 0.5, fontSize: 11 }} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />

                        {activeStations.map((st, i) => {
                          const color = STATION_COLORS[i % STATION_COLORS.length];
                          return (
                            <Area
                              key={st.id}
                              type="monotone"
                              dataKey={st.name}
                              stroke={color}
                              fillOpacity={1}
                              fill={`url(#color-${st.id})`}
                              strokeWidth={2}
                              dot={<CustomDot />}
                              activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                              connectNulls={true}
                            />
                          );
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeStations.map((st, i) => {
                    const color = STATION_COLORS[i % STATION_COLORS.length];
                    const stValues = chartData.map(d => d[st.name]).filter(v => v !== undefined && v !== null);
                    const maxVal = stValues.length > 0 ? Math.max(...stValues) : 0;

                    return (
                      <Card key={st.id} className="overflow-hidden transition-colors border-border">
                        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: color }} />
                            <div>
                              <h3 className="font-bold text-foreground leading-tight">{st.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">ID: {st.id}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportExcel(st.id.toString(), st.name)}
                              className="h-8 gap-2 text-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Export
                            </Button>

                            <div className="text-right">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Period Max</p>
                              <p className="text-lg font-bold" style={{ color }}>{maxVal.toFixed(2)}m</p>
                            </div>
                          </div>
                        </div>

                        <div className="h-[200px] p-4 pt-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`color-solo-${st.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                              <XAxis dataKey="timeLabel" tick={{ fill: "currentColor", opacity: 0.5, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={30} />
                              <YAxis domain={['auto', 'auto']} tick={{ fill: "currentColor", opacity: 0.5, fontSize: 11 }} tickLine={false} axisLine={false} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Area
                                type="monotone"
                                dataKey={st.name}
                                stroke={color}
                                fillOpacity={1}
                                fill={`url(#color-solo-${st.id})`}
                                strokeWidth={2}
                                dot={<CustomDot />}
                                activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                                connectNulls={true}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Data Table */}
              {tableData.length > 0 && (
                <Card className="overflow-hidden border-border mt-8">
                  <button
                    onClick={() => setTableOpen(!tableOpen)}
                    className="w-full p-4 flex justify-between items-center bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-foreground">Raw Data Table</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{tableData.length} records</span>
                    </div>
                    <span className={`text-muted-foreground transition-transform ${tableOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {tableOpen && (
                    <div className="border-t border-border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3 font-medium">Time</th>
                              <th className="px-4 py-3 font-medium">Station</th>
                              <th className="px-4 py-3 font-medium">Reading (m)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {paginatedTable.map((row, idx) => {
                              const si = activeStations.findIndex(s => s.id.toString() === row.stationId);
                              const rowColor = si !== -1 ? STATION_COLORS[si % STATION_COLORS.length] : "currentColor";
                              return (
                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                  <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rowColor }} />
                                      <span className="font-medium text-foreground">{row.station}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-bold" style={{ color: rowColor }}>{row.value.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3 border-t border-border flex justify-between items-center bg-muted/10">
                        <span className="text-xs text-muted-foreground">
                          Page <span className="font-bold text-foreground">{tablePage + 1}</span> of <span className="font-bold text-foreground">{totalPages || 1}</span>
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTablePage(p => Math.max(0, p - 1))}
                            disabled={tablePage === 0}
                            className="h-7 text-xs"
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTablePage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={tablePage >= totalPages - 1}
                            className="h-7 text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
