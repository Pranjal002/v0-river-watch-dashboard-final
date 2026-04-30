'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, ChevronDown, AlertCircle } from 'lucide-react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/sidebar';

// ─── Types ────────────────────────────────────────────────────────
interface CreateUserForm {
  fullName: string;
  email: string; // Used for the UI/Validation
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  riverId: number | '';
  stationId: number | '';
  startTime: string;
  endTime: string;
  intervalMinutes: number | '';
  effectiveFromDate: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface RiverOption {
  id: number;
  name: string;
}

interface StationOption {
  id: number;
  name: string;
}

export default function AddUserPage() {
  const router = useRouter();

  // ─── State ──────────────────────────────────────────────────────
  const [form, setForm] = useState<CreateUserForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    riverId: '',
    stationId: '',
    startTime: '',
    endTime: '',
    intervalMinutes: '',
    effectiveFromDate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [rivers, setRivers] = useState<RiverOption[]>([]);
  const [stations, setStations] = useState<StationOption[]>([]);

  const [loadingRivers, setLoadingRivers] = useState(true);
  const [loadingStations, setLoadingStations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // ─── Fetch Rivers ───────────────────────────────────────────────
  useEffect(() => {
    const fetchRivers = async () => {
      try {
        const res: any = await apiCall('/river/drop-down-view');
        if (res?.data) setRivers(res.data);
      } catch (err) {
        setApiError('Failed to load river list. Please refresh.');
      } finally {
        setLoadingRivers(false);
      }
    };
    fetchRivers();
  }, []);

  // ─── Fetch Stations (Improved Logic) ───────────────────────────
  useEffect(() => {
    // Reset stations if no river is selected
    if (!form.riverId) {
      setStations([]);
      setForm(prev => ({ ...prev, stationId: '' }));
      return;
    }

    const fetchStations = async () => {
      setLoadingStations(true);
      setApiError(''); // Clear previous errors
      try {
        const res: any = await apiCall(`/station/drop-down/get-by-river/${form.riverId}`);
        // Handle empty station list silently (no error message)
        setStations(res?.data || []);
      } catch (err) {

      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, [form.riverId]);

  // ─── Validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (form.password.length < 6) e.password = 'Minimum 6 characters required';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.riverId) e.riverId = 'Please select a river';
    if (!form.stationId && stations.length > 0) e.stationId = 'Please select a station';
    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    if (!form.intervalMinutes) e.intervalMinutes = 'Interval minutes is required';
    if (!form.effectiveFromDate) e.effectiveFromDate = 'Effective date is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');

    try {
      await apiCall('/user/create-user', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          userName: form.email.trim(), // Mapping email to userName as per your API requirement
          password: form.password,
          stationId: form.stationId,
          email: form.email.trim(),
          readingIntervalDetails: {
            startTime: form.startTime,
            endTime: form.endTime,
            intervalMinutes: Number(form.intervalMinutes),
            effectiveFromDate: form.effectiveFromDate
          }
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => router.push('/home/users'), 2000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Helper UI ─────────────────────────────────────────────────
  const inputCls = (hasError?: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm bg-input text-foreground outline-none transition-all duration-200 ${hasError
      ? 'border-destructive focus:ring-2 focus:ring-destructive/30'
      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
    }`;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Navigation Header */}
        <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">User Management</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-10 px-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">

            {/* Form Title Section */}
            <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-muted to-card">
              <div className="flex items-center gap-4">
                <div className="bg-primary p-3 rounded-xl shadow-md shadow-primary/20">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Add New User</h2>
                  <p className="text-sm text-muted-foreground">Register a new system user and link them to a monitoring station.</p>
                </div>
              </div>
            </div>

            {submitSuccess ? (
              <div className="p-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Success!</h3>
                <p className="text-muted-foreground">User has been created. Redirecting to user list...</p>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                {apiError && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm border border-destructive flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {apiError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <input
                      className={inputCls(errors.fullName)}
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Manish Neupane"
                    />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      autoComplete="new-email"
                      className={inputCls(errors.email)}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={inputCls(errors.password)}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        className={inputCls(errors.confirmPassword)}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Station Assignment Section */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Station Assignment</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* River Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">River</label>
                      <div className="relative">
                        <select
                          className={inputCls(errors.riverId)}
                          value={form.riverId}
                          disabled={loadingRivers}
                          onChange={(e) => setForm({ ...form, riverId: e.target.value ? Number(e.target.value) : '', stationId: '' })}
                        >
                          <option value="" className="text-muted-foreground">Select River</option>
                          {rivers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                      {errors.riverId && <p className="text-xs text-red-500">{errors.riverId}</p>}
                    </div>

                    {/* Station Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Station</label>
                      <div className="relative">
                        <select
                          className={inputCls(errors.stationId)}
                          value={form.stationId}
                          disabled={!form.riverId || loadingStations || (stations.length === 0 && !loadingStations)}
                          onChange={(e) => setForm({ ...form, stationId: e.target.value ? Number(e.target.value) : '' })}
                        >
                          {!form.riverId ? (
                            <option value="" className="text-muted-foreground">Select a river first</option>
                          ) : loadingStations ? (
                            <option value="" className="text-muted-foreground">Loading stations...</option>
                          ) : stations.length === 0 ? (
                            <option value="" className="text-muted-foreground">No stations available</option>
                          ) : (
                            <>
                              <option value="" className="text-muted-foreground">Select Station</option>
                              {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </>
                          )}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {loadingStations && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                        </div>
                      </div>
                      {errors.stationId && <p className="text-xs text-red-500">{errors.stationId}</p>}
                    </div>
                  </div>
                </div>

                {/* Reading Interval Details Section */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Reading Interval Details</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Time</label>
                      <input
                        type="time"
                        className={inputCls(errors.startTime)}
                        value={form.startTime}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      />
                      {errors.startTime && <p className="text-xs text-red-500">{errors.startTime}</p>}
                    </div>

                    {/* End Time */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">End Time</label>
                      <input
                        type="time"
                        className={inputCls(errors.endTime)}
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      />
                      {errors.endTime && <p className="text-xs text-red-500">{errors.endTime}</p>}
                    </div>

                    {/* Interval Minutes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interval (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        className={inputCls(errors.intervalMinutes)}
                        value={form.intervalMinutes}
                        onChange={(e) => setForm({ ...form, intervalMinutes: e.target.value ? Number(e.target.value) : '' })}
                        placeholder="e.g. 60"
                      />
                      {errors.intervalMinutes && <p className="text-xs text-red-500">{errors.intervalMinutes}</p>}
                    </div>
                    
                    {/* Effective From Date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Effective From Date</label>
                      <input
                        type="date"
                        className={inputCls(errors.effectiveFromDate)}
                        value={form.effectiveFromDate}
                        onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
                      />
                      {errors.effectiveFromDate && <p className="text-xs text-red-500">{errors.effectiveFromDate}</p>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-8 border-t border-border">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted rounded-lg transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Create User Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}