'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Droplet, Users, Waves, Map, MapPin, LogOut, Menu, X, LayoutDashboard, Activity } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRiver, setExpandedRiver] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleRiverMenu = () => {
    setExpandedRiver(!expandedRiver);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-sidebar to-sidebar/90">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border/30">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <div className="bg-sidebar-accent p-2 rounded-lg">
            <Droplet className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold">RiverWatch</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {/* Dashboard */}
          <Link href="/home">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground gap-3"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </Link>

          {/* View Gauge Readings */}
          <Link href="/home/readings">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground gap-3"
            >
              <Activity className="w-4 h-4" />
              <span>View Gauge Readings</span>
            </Button>
          </Link>

          {/* User Management */}
          <Link href="/home/users">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground gap-3"
            >
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </Button>
          </Link>

          {/* River Management */}
          <div>
            <button
              onClick={toggleRiverMenu}
              className="w-full flex items-center justify-between px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/20 rounded-md text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <Waves className="w-4 h-4" />
                <span>River Management</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${expandedRiver ? 'rotate-180' : ''
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {/* River Management Submenu */}
            {expandedRiver && (
              <div className="ml-4 mt-2 space-y-1">
                <Link href="/home/rivers">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground gap-3 text-sm pl-6"
                  >
                    <Map className="w-4 h-4" />
                    <span>Rivers</span>
                  </Button>
                </Link>
                <Link href="/home/stations">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground gap-3 text-sm pl-6"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Stations</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/30">
        <Button
          onClick={handleLogout}
          className="w-full justify-center gap-2 bg-destructive/80 hover:bg-destructive text-white"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="icon"
          className="bg-primary text-white border-primary hover:bg-primary/90"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 w-64 z-40 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
