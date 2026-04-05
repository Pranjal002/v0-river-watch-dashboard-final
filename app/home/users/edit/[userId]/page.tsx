'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import { Users, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/sidebar';

// ─── Types ────────────────────────────────────────────────────────
interface EditUserForm {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  riverId: number | '';
  stationId: number | '';
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

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  // ─── State ──────────────────────────────────────────────────────
  const [form, setForm] = useState<EditUserForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    riverId: '',
    stationId: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [rivers, setRivers] = useState<RiverOption[]>([]);
  const [stations, setStations] = useState<StationOption[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingRivers, setLoadingRivers] = useState(true);
  const [loadingStations, setLoadingStations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // ─── Fetch Initial Data ─────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res: any = await apiCall(`/station-user/user/${userId}`);
        const data = res?.data || res;
        
        setForm({
          fullName: data.fullName || '',
          email: data.userName || data.email || '',
          password: '',
          confirmPassword: '',
          phoneNumber: '', // Not in response payload, default to empty
          riverId: data.riverId || '',
          stationId: data.stationId || '',
        });
      } catch (err) {
        setApiError('Failed to load user details. They may have been deleted.');
      } finally {
        setLoadingInitial(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // ─── Fetch Rivers ───────────────────────────────────────────────
  useEffect(() => {
    const fetchRivers = async () => {
      try {
        const res: any = await apiCall('/river/drop-down-view');
        if (res?.data?.items) setRivers(res.data.items);
        else if (Array.isArray(res?.data)) setRivers(res.data);
      } catch (err) {
        setApiError('Failed to load river list. Please refresh.');
      } finally {
        setLoadingRivers(false);
      }
    };
    fetchRivers();
  }, []);

  // ─── Fetch Stations ──────────────────────────────────────────────
  useEffect(() => {
    // We do NOT reset stationId unconditionally if we literally just loaded it from initialData
    if (!form.riverId) {
      setStations([]);
      return;
    }

    const fetchStations = async () => {
      setLoadingStations(true);
      try {
        const res: any = await apiCall(`/station/drop-down/get-by-river/${form.riverId}`);
        const newStations = res?.data || [];
        setStations(newStations);
        
        // Safety check to ensure current stationId belongs to the selected river, otherwise reset it
        if (form.stationId) {
          const isValid = newStations.some((s: any) => s.id === form.stationId);
          if (!isValid && !loadingInitial) {
            setForm(prev => ({ ...prev, stationId: '' }));
          }
        }
      } catch (err) {
        // silent
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, [form.riverId, loadingInitial]);

  // ─── Validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    
    // Optional password when editing
    if (form.password && form.password.length < 6) e.password = 'Minimum 6 characters required';
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    
    if (!form.riverId) e.riverId = 'Please select a river';
    if (!form.stationId && stations.length > 0) e.stationId = 'Please select a station';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');

    try {
      const payload: any = {
        fullName: form.fullName.trim(),
        userName: form.email.trim(), 
        stationId: form.stationId,
        email: form.email.trim(),
      };
      
      if (form.password) {
        payload.password = form.password;
      }
      
      // Call creating endpoint since the backend acts as an upsert/update depending on the ID
      await apiCall(`/user/create-user?id=${userId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      setSubmitSuccess(true);
      setTimeout(() => router.push('/home/users'), 2000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to update user. Please try again.');
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

  if (loadingInitial) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
      </div>
    );
  }

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
                  <h2 className="text-lg font-bold text-foreground">Edit User</h2>
                  <p className="text-sm text-muted-foreground">Update details for an existing system user.</p>
                </div>
              </div>
            </div>

            {submitSuccess ? (
              <div className="p-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Success!</h3>
                <p className="text-muted-foreground">User has been updated. Redirecting to user list...</p>
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
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                      <span>Password</span>
                      <span className="text-[10px] text-muted-foreground/60">(Leave blank to keep current)</span>
                    </label>
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
                        disabled={!form.password} // Disable confirm password if no new password is typed
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Save Changes
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
