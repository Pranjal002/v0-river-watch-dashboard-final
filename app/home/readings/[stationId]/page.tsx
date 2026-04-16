'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Image as ImageIcon, MapPin, Activity, Waves, MoveRight, MoveLeft, ArrowDown, X as CloseIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { stationAPI, gaugeReadingAPI } from '@/lib/api';

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
}

interface PageData {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

function SecureThumbnail({ imagePath, onClick }: { imagePath: string, onClick: () => void }) {
  return (
    <div className="w-full md:w-[180px] bg-muted flex flex-col items-center justify-center border-r border-border min-h-[160px] md:min-h-full p-4 relative group shrink-0">
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
        <div className="flex flex-col items-center justify-center text-gray-500 h-full">
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

  const [readings, setReadings] = useState<GaugeReading[]>([]);
  const [pageData, setPageData] = useState<PageData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewingImageObjectUrl, setViewingImageObjectUrl] = useState<string | null>(null);

  const handleViewImage = (imagePath: string) => {
    setViewingImageObjectUrl(imagePath);
  };

  const closeImageModal = () => {
    setViewingImageObjectUrl(null);
  };

  const formatDateString = (isoString?: string) => {
    if (!isoString) return 'N/A';
    
    // Check if the string matches "YYYY-MM-DD HH:mm:ss.SSS" structure
    // This directly parses the literal digits to prevent the browser from adding timezone offsets
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [ , year, month, day, hour, minute ] = match;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = months[parseInt(month, 10) - 1];
      
      let h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      
      const hStr = h.toString().padStart(2, '0');
      const mStr = minute.padStart(2, '0');
      
      return `${monthStr} ${parseInt(day, 10)}, ${year} · ${hStr}:${mStr} ${ampm}`;
    }

    // Fallback if the regex doesn't match
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} · ${timeStr}`;
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
      }
    } catch (e) {
      console.warn("Could not fetch explicit station details.", e);
    }
  };

  const fetchReadings = async (page: number) => {
    try {
      setLoading(true);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const response: any = await gaugeReadingAPI.getByStationId(stationIdStr, page, 10);

      if (response && response.data) {
        const items = response.data.items || [];
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
      if (stationName === 'Loading...') setStationName('Unknown Station');
      if (riverName === 'Loading...') setRiverName('Unknown River');
      setLoading(false);
    }
  };

  const totalPages = pageData ? Math.ceil(pageData.totalCount / pageData.pageSize) : 1;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background text-foreground">
        <div className="max-w-4xl mx-auto p-12">

          <div className="flex items-center justify-between mb-8">
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

            <div className="text-gray-400 font-medium">
              {pageData && pageData.totalCount > 0 ? (
                `Showing ${(pageData.pageNumber - 1) * pageData.pageSize + 1}–${Math.min(pageData.pageNumber * pageData.pageSize, pageData.totalCount)} of ${pageData.totalCount} records`
              ) : '0 records found'}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-gray-400 font-medium gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Fetching readings...
            </div>
          ) : error ? (
            <Card className="p-8 bg-card border-destructive text-center text-destructive">
              <p>{error}</p>
              <Button onClick={() => fetchReadings(1)} className="mt-4 bg-destructive text-destructive-foreground">Retry</Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-8">
                <Card className="bg-muted border-border p-5 rounded-xl">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Total readings</p>
                  <p className="text-3xl font-semibold">{pageData?.totalCount || 0}</p>
                </Card>
                <Card className="bg-muted border-border p-5 rounded-xl">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Page</p>
                  <p className="text-3xl font-semibold">{pageData ? `${pageData.pageNumber} / ${totalPages}` : '0 / 0'}</p>
                </Card>
                <Card className="bg-muted border-border p-5 rounded-xl">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Latest value</p>
                  <p className="text-3xl font-semibold tracking-tight">{readings.length > 0 ? readings[0].readingValue : '-'}<span className="text-lg text-muted-foreground font-normal ml-2">m</span></p>
                </Card>
                <Card className="bg-muted border-border p-5 rounded-xl">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Station ID</p>
                  <p className="text-3xl font-semibold">{stationIdStr}</p>
                </Card>
              </div>

              <div className="space-y-6">
                {readings.map((reading) => (
                  <Card key={reading.id} className="bg-card border-border rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-lg">
                    <SecureThumbnail imagePath={reading.imagePath} onClick={() => handleViewImage(reading.imagePath)} />

                    <div className="p-6 flex-1 flex flex-col justify-between relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-sm text-gray-400 font-semibold tracking-wide">ID #{reading.id}</div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${reading.readingTime === 2 ? 'bg-[#1b2f42] text-blue-400' : 'bg-[#3b2a22] text-[#eab308]'}`}>
                          <div className={`w-2 h-2 rounded-full ${reading.readingTime === 2 ? 'bg-blue-400' : 'bg-[#eab308]'}`}></div>
                          {reading.readingTime === 2 ? 'Afternoon' : reading.readingTime === 1 ? 'Morning' : 'Unknown'}
                        </div>
                      </div>

                      <div className="text-5xl font-light mb-6 text-foreground tracking-tight">
                        {reading.readingValue} <span className="text-xl text-muted-foreground font-medium">metres</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-border w-full">
                        <div className="flex flex-col gap-5">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">River</p>
                            <p className="font-semibold text-gray-200">{reading.river || riverName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Uploaded on</p>
                            <p className="font-semibold text-gray-200">{formatDateString(reading.uploadedOn)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-5">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Station</p>
                            <p className="font-semibold text-gray-200">{reading.station || stationName}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-5">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Image captured on</p>
                            <p className="font-semibold text-gray-200">{formatDateString(reading.imageCapturedOn)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 mt-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm tracking-widest border border-border ring-[3px] ring-background shadow-inner">
                          {reading.uploadedBy ? reading.uploadedBy.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div className="leading-tight">
                          <p className="font-bold text-gray-200">{reading.uploadedBy || 'System'}</p>
                          <p className="text-xs text-gray-500 font-medium">Uploaded by</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

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
                  <span className="text-muted-foreground font-medium">
                    Showing {(pageData.pageNumber - 1) * pageData.pageSize + 1}–{Math.min(pageData.pageNumber * pageData.pageSize, pageData.totalCount)} of {pageData.totalCount}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fetchReadings(pageData.pageNumber - 1)}
                      disabled={pageData.pageNumber === 1 || loading}
                      className="bg-transparent border-border text-foreground hover:bg-muted rounded-lg p-2 h-10 w-10 disabled:opacity-30"
                    >
                      <MoveLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-transparent border-border text-foreground hover:bg-muted rounded-lg min-w-10 h-10 font-medium pointer-events-none"
                    >
                      {pageData.pageNumber}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fetchReadings(pageData.pageNumber + 1)}
                      disabled={pageData.pageNumber >= totalPages || loading}
                      className="bg-transparent border-border text-foreground hover:bg-muted rounded-lg p-2 h-10 w-10 disabled:opacity-30"
                    >
                      <MoveRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-12 flex justify-center pb-12">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted hover:text-foreground transition-colors">
                  <ArrowDown className="w-5 h-5 opacity-70" />
                </div>
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
