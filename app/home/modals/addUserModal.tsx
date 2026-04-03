'use client';

import { useEffect, useState, useCallback } from "react";
import { Users, X, Eye, EyeOff, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import { apiCall } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  riverId: number | '';
  stationId: number | '';
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  riverId?: string;
  stationId?: string;
}

interface RiverOption {
  id: number;
  name: string;
}

interface StationOption {
  id: number;
  name: string;
}

// ─── Add User Modal ────────────────────────────────────────────────────────────
export default function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
  
    // Dropdown data
    const [rivers, setRivers] = useState<RiverOption[]>([]);
    const [stations, setStations] = useState<StationOption[]>([]);
    const [loadingRivers, setLoadingRivers] = useState(true);
    const [loadingStations, setLoadingStations] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [apiError, setApiError] = useState('');
  
    // Fetch rivers on mount
    useEffect(() => {
      const fetchRivers = async () => {
        try {
          const res: any = await apiCall('/river/drop-down-view');
          if (res?.data) setRivers(res.data);
        } catch {
          setApiError('Failed to load rivers.');
        } finally {
          setLoadingRivers(false);
        }
      };
      fetchRivers();
    }, []);
  
    // Fetch stations when river changes
    useEffect(() => {
      if (!form.riverId) {
        setStations([]);
        setForm(f => ({ ...f, stationId: '' }));
        return;
      }
      const fetchStations = async () => {
        setLoadingStations(true);
        setStations([]);
        setForm(f => ({ ...f, stationId: '' }));
        try {
          const res: any = await apiCall(`/station/drop-down/get-by-river/${form.riverId}`);
          if (res?.data) setStations(res.data);
        } catch {
          setApiError('Failed to load stations.');
        } finally {
          setLoadingStations(false);
        }
      };
      fetchStations();
    }, [form.riverId]);
  
    const validate = (): boolean => {
      const e: FormErrors = {};
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Minimum 6 characters';
      if (!form.confirmPassword) e.confirmPassword = 'Please confirm password';
      else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
      if (!form.riverId) e.riverId = 'Please select a river';
      if (!form.stationId) e.stationId = 'Please select a station';
      setErrors(e);
      return Object.keys(e).length === 0;
    };
  
    const handleSubmit = async () => {
      setApiError('');
      if (!validate()) return;
      setSubmitting(true);
      try {
        await apiCall('/user/create-user', {
          method: 'POST',
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            password: form.password,
            phoneNumber: form.phoneNumber.trim(),
            stationId: form.stationId,
          }),
        });
        setSubmitSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } catch (err: any) {
        setApiError(err.message || 'Failed to create user. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };
  
    // Memoized change handlers to prevent unnecessary re-renders
    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, fullName: e.target.value }));
      setErrors(er => ({ ...er, fullName: '' }));
    }, []);
  
    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, email: e.target.value }));
      setErrors(er => ({ ...er, email: '' }));
    }, []);
  
    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, phoneNumber: e.target.value }));
      setErrors(er => ({ ...er, phoneNumber: '' }));
    }, []);
  
    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, password: e.target.value }));
      setErrors(er => ({ ...er, password: '' }));
    }, []);
  
    const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, confirmPassword: e.target.value }));
      setErrors(er => ({ ...er, confirmPassword: '' }));
    }, []);
  
    const handleRiverChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value ? Number(e.target.value) : '';
      setForm(f => ({ ...f, riverId: value, stationId: '' }));
      setErrors(er => ({ ...er, riverId: '', stationId: '' }));
    }, []);
  
    const handleStationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value ? Number(e.target.value) : '';
      setForm(f => ({ ...f, stationId: value }));
      setErrors(er => ({ ...er, stationId: '' }));
    }, []);
  
    const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  
    const inputCls = (hasError?: string) =>
      `w-full px-3 py-2.5 rounded-lg border text-sm bg-white transition-all outline-none
       ${hasError
         ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
         : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
       }`;
  
    const selectCls = (hasError?: string) =>
      `w-full px-3 py-2.5 rounded-lg border text-sm bg-white transition-all outline-none appearance-none cursor-pointer
       ${hasError
         ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
         : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
       }`;
  
    // Prevent body scroll when modal is open
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);
  
    return (
      // Backdrop
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
  
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Add New User</h2>
                <p className="text-xs text-gray-400">Fill in the details to create a user</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
  
          {/* Success state */}
          {submitSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-base font-semibold text-gray-700">User Created Successfully!</p>
              <p className="text-sm text-gray-400">Closing…</p>
            </div>
          ) : (
            <>
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
  
                {/* API error */}
                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{apiError}</span>
                  </div>
                )}
  
                {/* Full Name */}
                <Field label="Full Name" error={errors.fullName}>
                  <input
                    type="text"
                    className={inputCls(errors.fullName)}
                    placeholder="e.g. John Doe"
                    value={form.fullName}
                    onChange={handleFullNameChange}
                  />
                </Field>
  
                {/* Email */}
                <Field label="Email Address" error={errors.email}>
                  <input
                    type="email"
                    className={inputCls(errors.email)}
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={handleEmailChange}
                  />
                </Field>
  
                {/* Phone */}
                <Field label="Phone Number" error={errors.phoneNumber}>
                  <input
                    type="tel"
                    className={inputCls(errors.phoneNumber)}
                    placeholder="+977 98XXXXXXXX"
                    value={form.phoneNumber}
                    onChange={handlePhoneChange}
                  />
                </Field>
  
                {/* Password row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password" error={errors.password}>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={inputCls(errors.password) + ' pr-9'}
                        placeholder="Min. 6 chars"
                        value={form.password}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
  
                  <Field label="Confirm Password" error={errors.confirmPassword}>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        className={inputCls(errors.confirmPassword) + ' pr-9'}
                        placeholder="Repeat password"
                        value={form.confirmPassword}
                        onChange={handleConfirmPasswordChange}
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirm(v => !v)}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                </div>
  
                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Station Assignment</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
  
                {/* River dropdown */}
                <Field label="River" error={errors.riverId}>
                  <div className="relative">
                    {loadingRivers ? (
                      <div className={selectCls() + ' flex items-center gap-2 text-gray-400'}>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading rivers…</span>
                      </div>
                    ) : (
                      <>
                        <select
                          className={selectCls(errors.riverId)}
                          value={form.riverId}
                          onChange={handleRiverChange}
                        >
                          <option value="">— Select a river —</option>
                          {rivers.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </>
                    )}
                  </div>
                </Field>
  
                {/* Station dropdown — shown only after a river is picked */}
                <Field label="Station" error={errors.stationId}>
                  <div className="relative">
                    {!form.riverId ? (
                      <div className={selectCls() + ' text-gray-300 cursor-not-allowed'}>
                        Select a river first
                      </div>
                    ) : loadingStations ? (
                      <div className={selectCls() + ' flex items-center gap-2 text-gray-400'}>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading stations…</span>
                      </div>
                    ) : (
                      <>
                        <select
                          className={selectCls(errors.stationId)}
                          value={form.stationId}
                          disabled={stations.length === 0}
                          onChange={handleStationChange}
                        >
                          <option value="">
                            {stations.length === 0 ? 'No stations for this river' : '— Select a station —'}
                          </option>
                          {stations.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </>
                    )}
                  </div>
                </Field>
              </div>
  
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600
                             hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                             bg-gradient-to-r from-primary to-accent hover:opacity-90
                             disabled:opacity-60 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
}