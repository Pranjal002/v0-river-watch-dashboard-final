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
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => router.push('/home'), 2000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Helper UI ─────────────────────────────────────────────────
  const inputCls = (hasError?: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all duration-200 ${
      hasError 
        ? 'border-red-400 focus:ring-2 focus:ring-red-100' 
        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Navigation Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-10 px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Form Title Section */}
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="bg-primary p-3 rounded-xl shadow-md shadow-primary/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Add New User</h2>
                  <p className="text-sm text-gray-500">Register a new system user and link them to a monitoring station.</p>
                </div>
              </div>
            </div>

            {submitSuccess ? (
              <div className="p-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4 border border-green-100">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Success!</h3>
                <p className="text-gray-500">User has been created. Redirecting to dashboard...</p>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                {apiError && (
                   <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex items-center gap-3">
                     <AlertCircle className="w-5 h-5 flex-shrink-0" />
                     {apiError}
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input 
                      className={inputCls(errors.fullName)} 
                      value={form.fullName}
                      onChange={(e) => setForm({...form, fullName: e.target.value})}
                      placeholder="e.g. Manish Neupane"
                    />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email"
                      className={inputCls(errors.email)} 
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        className={inputCls(errors.password)} 
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirm ? "text" : "password"}
                        className={inputCls(errors.confirmPassword)} 
                        value={form.confirmPassword}
                        onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Station Assignment Section */}
                <div className="pt-6 border-t border-gray-100">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Station Assignment</span>
                     <div className="flex-1 h-px bg-gray-100" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* River Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">River</label>
                        <div className="relative">
                          <select 
                            className={inputCls(errors.riverId)}
                            value={form.riverId}
                            disabled={loadingRivers}
                            onChange={(e) => setForm({...form, riverId: e.target.value ? Number(e.target.value) : '', stationId: ''})}
                          >
                            <option value="">Select River</option>
                            {rivers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        </div>
                        {errors.riverId && <p className="text-xs text-red-500">{errors.riverId}</p>}
                      </div>

                      {/* Station Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Station</label>
                        <div className="relative">
                          <select 
                            className={inputCls(errors.stationId)}
                            value={form.stationId}
                            disabled={!form.riverId || loadingStations || (stations.length === 0 && !loadingStations)}
                            onChange={(e) => setForm({...form, stationId: e.target.value ? Number(e.target.value) : ''})}
                          >
                            {!form.riverId ? (
                              <option value="">Select a river first</option>
                            ) : loadingStations ? (
                              <option value="">Loading stations...</option>
                            ) : stations.length === 0 ? (
                              <option value="">No stations available</option>
                            ) : (
                              <>
                                <option value="">Select Station</option>
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
                <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
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