'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Image as ImageIcon, MapPin, Activity, Waves, MoveRight, MoveLeft, ArrowDown, X as CloseIcon, Calendar, Download, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { stationAPI, gaugeReadingAPI, dashboardAPI } from '@/lib/api';

interface GaugeReading {
  id: number;
  stationId: number;
  station: string;
  riverId: number;
  river: string;
  imagePath: string;
  readingValue: number;
  imageCapturedOn: string;
  readingTime: number;
  uploadedBy: string;
  uploadedOn: string;
  actualDateToUpload?: string;
  actualDatetoUpload?: string;
  slotDetails?: {
    startTime: string;
    endTime: string;
    displayLabel: string;
  };
}

interface PageData {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

function SecureThumbnail({ imagePath, onClick }: { imagePath: string, onClick: () => void }) {
  return (
    <div className="w-full md:w-[120px] bg-muted flex flex-col items-center justify-center border-r border-border min-h-[120px] md:min-h-full p-2 relative group shrink-0">
      {imagePath ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center rounded-l-2xl filter contrast-125 transition-opacity duration-500" style={{ backgroundImage: `url(${imagePath})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div onClick={onClick} className="p-3 bg-black/60 rounded-xl backdrop-blur-sm shadow-xl flex flex-col gap-2 cursor-pointer transform hover:scale-105 transition-transform text-white items-center">
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs font-semibold">View image</span>
            </div>
          </div>
          <div onClick={onClick} className="absolute bottom-0 inset-x-0 p-3 bg-black/40 backdrop-blur-sm flex justify-center border-t border-white/10 md:hidden cursor-pointer">
            <span className="text-xs font-bold text-white">View Image</span>
          </div>
          <div onClick={onClick} className="absolute bottom-0 inset-x-0 p-3 border-t border-white/10 hidden md:flex justify-center transition-opacity opacity-100 group-hover:opacity-0 bg-black/40 cursor-pointer">
            <span className="text-sm font-semibold text-white">View image</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-semibold">No Image</span>
        </div>
      )}
    </div>
  );
}

export default function StationReadingsPage() {
  const params = useParams();
  const router = useRouter();
  const stationIdStr = params.stationId as string;

  const [stationName, setStationName] = useState('Loading...');
  const [riverName, setRiverName] = useState('Loading...');
  const [riverId, setRiverId] = useState<number | null>(null);

  const [readings, setReadings] = useState<GaugeReading[]>([]);
  const [pageData, setPageData] = useState<PageData | null>(null);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewingImageObjectUrl, setViewingImageObjectUrl] = useState<string | null>(null);

  const handleViewImage = (imagePath: string) => {
    setViewingImageObjectUrl(imagePath);
  };

  const closeImageModal = () => {
    setViewingImageObjectUrl(null);
  };

  const formatDateParts = (isoString?: string): { date: string; time: string } => {
    if (!isoString) return { date: 'N/A', time: '' };

    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hour, minute] = match;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = months[parseInt(month, 10) - 1];

      let h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;

      return {
        date: `${monthStr} ${parseInt(day, 10)}, ${year}`,
        time: `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')} ${ampm}`,
      };
    }

    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return { date: 'N/A', time: '' };

    return {
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getStatusFlag = (reading: GaugeReading): { type: 'NORMAL' | 'MISMATCH' | 'LATE'; message: string } => {
    const actualDate = reading.actualDateToUpload || reading.actualDatetoUpload || (reading.uploadedOn ? reading.uploadedOn.split('T')[0] : (reading.imageCapturedOn ? reading.imageCapturedOn.split('T')[0] : ''));
    if (!actualDate || !reading.slotDetails || !reading.imageCapturedOn) {
      return { type: 'NORMAL', message: '' };
    }

    const slot = reading.slotDetails;
    if (!slot.startTime || !slot.endTime) {
      return { type: 'NORMAL', message: '' };
    }

    const normalizeDateTime = (dateStr: string, timeStr: string) => {
      const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
      let cleanTime = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr;
      cleanTime = cleanTime.split('.')[0].replace('Z', '');
      const parts = cleanTime.split(':');
      const h = parts[0]?.padStart(2, '0') || '00';
      const m = parts[1]?.padStart(2, '0') || '00';
      const s = parts[2]?.padStart(2, '0') || '00';
      return `${cleanDate}T${h}:${m}:${s}`;
    };

    const normCaptured = normalizeDateTime(reading.imageCapturedOn, reading.imageCapturedOn);
    const normSlotStart = normalizeDateTime(actualDate, slot.startTime);
    const normSlotEnd = normalizeDateTime(actualDate, slot.endTime);

    if (normCaptured < normSlotStart || normCaptured > normSlotEnd) {
      return {
        type: 'MISMATCH',
        message: 'User uploaded image time does not match with allocated date/time'
      };
    }

    if (reading.uploadedOn) {
      const normUploaded = normalizeDateTime(reading.uploadedOn, reading.uploadedOn);
      if (normUploaded > normSlotEnd) {
        return {
          type: 'LATE',
          message: 'Late upload'
        };
      }
    }

    return { type: 'NORMAL', message: 'Verified on-time capture & upload' };
  };

  useEffect(() => {
    if (stationIdStr) {
      fetchStationDetails();
      fetchReadings(1);
    }
  }, [stationIdStr]);

  const fetchStationDetails = async () => {
    try {
      const response: any = await stationAPI.getById(stationIdStr);
      const station = response.data || response;
      if (station) {
        setStationName(station.name);
        setRiverName(station.riverName || station.river);
        if (station.riverId) setRiverId(station.riverId);
      }
    } catch (e) {
      console.warn("Could not fetch explicit station details.", e);
    }
  };

  const fetchReadings = async (page: number, overrideFrom?: string, overrideTo?: string) => {
    try {
      setLoading(true);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const from = overrideFrom !== undefined ? overrideFrom : fromDate;
      const to = overrideTo !== undefined ? overrideTo : toDate;

      const response: any = await gaugeReadingAPI.getByStationId(stationIdStr, page, 10, from, to);

      if (response && response.data) {
        let items = response.data.items || [];

        items = await Promise.all(items.map(async (item: any) => {
          let updatedItem = { ...item };
          if (item.imagePath) {
            try {
              updatedItem.imagePath = await gaugeReadingAPI.fetchImageAsUrl(item.imagePath);
            } catch (e) {
              console.error("Failed to load image for", item.id, e);
            }
          }
          return updatedItem;
        }));

        setReadings(items);
        setPageData({
          totalCount: response.data.totalCount || 0,
          pageNumber: response.data.pageNumber || page,
          pageSize: response.data.pageSize || 10
        });

        // As a fallback safely lock in naming references directly from the payload items
        if (items.length > 0) {
          setStationName(prev => (prev === 'Loading...' || prev === 'Unknown Station' || !prev) ? items[0].station : prev);
          setRiverName(prev => (prev === 'Loading...' || prev === 'Unknown River' || !prev) ? items[0].river : prev);
        }
      }
    } catch (err: any) {
      console.error('Failed to load readings:', err);
      setError('Failed to load gauge readings. Please try again.');
    } finally {
      setStationName(prev => prev === 'Loading...' ? 'Unknown Station' : prev);
      setRiverName(prev => prev === 'Loading...' ? 'Unknown River' : prev);
      setLoading(false);
    }
  };

  const totalPages = pageData ? Math.ceil(pageData.totalCount / pageData.pageSize) : 1;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (!pageData) return pages;

    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (pageData.pageNumber <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (pageData.pageNumber >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', pageData.pageNumber - 1, pageData.pageNumber, pageData.pageNumber + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    if (!riverId) {
      alert("River ID is missing. Please wait for station details to load.");
      return;
    }

    try {
      setExporting(true);
      const blob = await dashboardAPI.exportExcel(riverId, stationIdStr, fromDate, toDate, false);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${stationName.replace(/\s+/g, '_')}_readings_${fromDate}_to_${toDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background text-foreground">
        <div className="max-w-4xl mx-auto p-12">

          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={() => router.push('/home/readings')} variant="outline" className="gap-2 bg-transparent border-border text-foreground hover:bg-muted hover:text-foreground rounded-full px-6 py-5 cursor-pointer z-10 relative">
                  <ChevronLeft className="w-5 h-5" /> Back
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-muted py-2 px-4 rounded-full text-blue-400 font-medium text-sm">
                    <Waves className="w-4 h-4" /> {riverName}
                  </div>
                  <div className="flex items-center gap-2 bg-secondary py-2 px-4 rounded-full text-green-400 font-medium text-sm">
                    <MapPin className="w-4 h-4" /> {stationName}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-2">
              <div className="text-muted-foreground font-medium text-sm">
                {pageData && pageData.totalCount > 0 ? (
                  <>Showing <span className="text-foreground font-bold">{((pageData.pageNumber - 1) * pageData.pageSize) + 1}–{Math.min(pageData.pageNumber * pageData.pageSize, pageData.totalCount)}</span> of <span className="text-foreground font-bold">{pageData.totalCount}</span></>
                ) : '0 records found'}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type={fromDate ? "date" : "text"}
                    placeholder="From"
                    onFocus={(e) => (e.currentTarget.type = "date")}
                    onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text" }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-[150px] h-[38px] px-3 bg-transparent border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-0" />
                </div>

                <div className="relative">
                  <input
                    type={toDate ? "date" : "text"}
                    placeholder="to"
                    onFocus={(e) => (e.currentTarget.type = "date")}
                    onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text" }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-[150px] h-[38px] px-3 bg-transparent border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-0" />
                </div>

                <Button
                  onClick={() => fetchReadings(1)}
                  disabled={loading}
                  variant="outline"
                  className="h-[38px] px-5 rounded-full border-primary text-primary hover:bg-primary/5 hover:text-primary font-semibold text-sm ml-1"
                >
                  Apply Date Filter
                </Button>

                {(fromDate || toDate) && (
                  <Button
                    onClick={() => { setFromDate(''); setToDate(''); fetchReadings(1, '', ''); }}
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    className="h-[38px] w-[38px] text-muted-foreground hover:text-destructive rounded-full"
                    title="Clear Filters"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-muted-foreground font-medium gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Fetching readings...
            </div>
          ) : error ? (
            <Card className="p-8 bg-card border-destructive text-center text-destructive">
              <p>{error}</p>
              <Button onClick={() => fetchReadings(1)} className="mt-4 bg-destructive text-destructive-foreground">Retry</Button>
            </Card>
          ) : (
            <>
              <div className="space-y-6">
                {readings.map((reading) => {
                  const statusFlag = getStatusFlag(reading);
                  return (
                    <Card key={reading.id} className="bg-card border-border rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
                      <SecureThumbnail imagePath={reading.imagePath} onClick={() => handleViewImage(reading.imagePath)} />

                      <div className="p-4 flex-1 flex flex-col justify-between relative">
                        <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                          <div className="font-mono text-xs text-muted-foreground font-semibold tracking-wide mt-1">ID #{reading.id}</div>
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-[#1b2f42] text-blue-400 shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                              {reading.slotDetails?.displayLabel || 'Unknown Slot'}
                            </div>
                            {statusFlag.type === 'MISMATCH' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-destructive/15 text-destructive cursor-pointer hover:bg-destructive/25 transition-colors border border-destructive/20 shadow-sm animate-in fade-in duration-300" title={statusFlag.message}>
                                    <AlertCircle className="w-4 h-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="bg-destructive text-destructive-foreground font-medium text-xs shadow-lg p-2 max-w-[250px]">
                                  <p>{statusFlag.message}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {statusFlag.type === 'LATE' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 text-amber-500 cursor-pointer hover:bg-amber-500/25 transition-colors border border-amber-500/20 shadow-sm animate-in fade-in duration-300" title={statusFlag.message}>
                                    <Clock className="w-4 h-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="bg-amber-500 text-black font-semibold text-xs shadow-lg p-2 max-w-[250px]">
                                  <p>{statusFlag.message}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {statusFlag.type === 'NORMAL' && statusFlag.message && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-500 cursor-pointer hover:bg-emerald-500/25 transition-colors border border-emerald-500/20 shadow-sm animate-in fade-in duration-300" title={statusFlag.message}>
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="bg-emerald-500 text-black font-semibold text-xs shadow-lg p-2 max-w-[250px]">
                                  <p>{statusFlag.message}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>

                      <div className="text-3xl font-light mb-4 text-foreground tracking-tight flex items-baseline gap-2">
                        {reading.readingValue} <span className="text-base text-muted-foreground font-medium">metres</span>
                      </div>

                      <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 border-t border-border w-full">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Image captured</p>
                          <p className="text-sm font-semibold text-foreground">{formatDateParts(reading.imageCapturedOn).date}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{formatDateParts(reading.imageCapturedOn).time}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Uploaded on</p>
                          <p className="text-sm font-semibold text-foreground">{formatDateParts(reading.uploadedOn).date}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{formatDateParts(reading.uploadedOn).time}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-auto">
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs tracking-widest border border-border">
                            {reading.uploadedBy ? reading.uploadedBy.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div className="leading-tight flex flex-col">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Uploaded by</p>
                            <p className="text-sm font-semibold text-foreground">{reading.uploadedBy || 'System'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  );
                })}

                {readings.length === 0 && !loading && (
                  <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                      <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No Readings Found</h3>
                    <p className="text-muted-foreground mt-2">There are zero gauge readings attached to the selected station.</p>
                  </div>
                )}
              </div>

              {pageData && pageData.totalCount > 0 && (
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                  <span className="text-sm text-muted-foreground font-medium">
                    Showing {(pageData.pageNumber - 1) * pageData.pageSize + 1} to {Math.min(pageData.pageNumber * pageData.pageSize, pageData.totalCount)} of {pageData.totalCount} results
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => fetchReadings(pageData.pageNumber - 1)}
                      disabled={pageData.pageNumber === 1 || loading}
                      className="bg-transparent border-border text-foreground hover:bg-muted text-sm font-medium h-9 px-4 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={`page-${pageNum}`}
                            variant={pageData.pageNumber === pageNum ? "default" : "outline"}
                            onClick={() => fetchReadings(pageNum as number)}
                            disabled={loading}
                            className={`h-9 w-9 p-0 text-sm font-medium ${pageData.pageNumber === pageNum ? 'bg-primary text-primary-foreground border-transparent' : 'bg-transparent border-border text-foreground hover:bg-muted'}`}
                          >
                            {pageNum}
                          </Button>
                        )
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fetchReadings(pageData.pageNumber + 1)}
                      disabled={pageData.pageNumber >= totalPages || loading}
                      className="bg-transparent border-border text-foreground hover:bg-muted text-sm font-medium h-9 px-4 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-12 flex justify-center pb-12">
                <Button
                  onClick={handleExportExcel}
                  disabled={exporting || loading}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-6 flex items-center gap-2 shadow-lg shadow-green-600/20 text-md font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {exporting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {exporting ? 'Exporting...' : 'Export to Excel'}
                </Button>
              </div>
            </>
          )}

          <Dialog open={viewingImageObjectUrl !== null} onOpenChange={(isOpen) => !isOpen && closeImageModal()}>
            <DialogContent className="max-w-5xl p-2 bg-card border-border overflow-hidden flex flex-col items-center justify-center min-h-[60vh] max-h-[90vh]">
              {viewingImageObjectUrl ? (
                <div className="relative w-full h-full flex justify-center items-center">
                  <img src={viewingImageObjectUrl} alt="Gauge Reading" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

        </div>
      </main>
    </div>
  );
}
