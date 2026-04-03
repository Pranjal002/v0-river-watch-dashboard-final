'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --midnight: #030d1a;
    --cyan: #00d4ff;
    --cyan-dim: #0099bb;
    --teal: #00f5c3;
    --slate: #8ba7c7;
    --white: #e8f4ff;
    --error: #ff4d6d;
  }

  @keyframes flow { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(400%) skewX(-15deg); } }
  @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.7; } 100% { opacity: 0.3; } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes grid-fade { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.07; } }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }

  .login-root {
    min-height: 100vh; background: var(--midnight);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; overflow: hidden; position: relative;
  }
  .bg-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(var(--cyan) 1px, transparent 1px), linear-gradient(90deg, var(--cyan) 1px, transparent 1px);
    background-size: 60px 60px; animation: grid-fade 4s ease-in-out infinite; pointer-events: none;
  }
  .bg-radial {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 40%, #0a2a4a 0%, transparent 70%),
                radial-gradient(ellipse 40% 50% at 80% 80%, #002233 0%, transparent 60%);
    pointer-events: none;
  }
  .water-svg { position: absolute; bottom: 0; left: 0; right: 0; pointer-events: none; opacity: 0.18; }
  .orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
  .orb-1 { width: 320px; height: 320px; background: radial-gradient(circle, #005577 0%, transparent 70%); top: -80px; left: -80px; animation: shimmer 6s ease-in-out infinite; }
  .orb-2 { width: 240px; height: 240px; background: radial-gradient(circle, #003344 0%, transparent 70%); bottom: 60px; right: -60px; animation: shimmer 8s ease-in-out infinite 2s; }

  .card-wrap { position: relative; z-index: 10; width: 100%; max-width: 460px; padding: 20px; animation: slideUp 0.7s cubic-bezier(.22,1,.36,1) both; }

  .card {
    background: linear-gradient(145deg, rgba(6,20,40,0.95) 0%, rgba(3,13,26,0.98) 100%);
    border: 1px solid rgba(0,212,255,0.15); border-radius: 24px; padding: 48px 44px 44px;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(0,212,255,0.05), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,212,255,0.1);
    position: relative; overflow: hidden;
  }
  .card.shake { animation: shake 0.4s ease; }
  .card::before {
    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
    animation: flow 3s linear infinite;
  }

  .logo-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 36px; animation: fadeIn 0.8s ease 0.3s both; }
  .logo-icon { position: relative; width: 72px; height: 72px; margin-bottom: 16px; animation: float 4s ease-in-out infinite; }
  .logo-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(0,212,255,0.4); animation: spin-slow 8s linear infinite; }
  .logo-ring::after { content: ''; position: absolute; top: -3px; left: 50%; width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; box-shadow: 0 0 8px var(--cyan); }
  .pulse-ring { position: absolute; inset: -8px; border-radius: 50%; border: 1px solid rgba(0,212,255,0.3); animation: pulse-ring 2.5s ease-out infinite; }
  .logo-inner { position: absolute; inset: 8px; border-radius: 50%; background: linear-gradient(135deg, #061e38 0%, #031020 100%); border: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; justify-content: center; }
  .company-name { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; color: var(--white); letter-spacing: 3px; text-transform: uppercase; }
  .company-sub { font-size: 11px; color: var(--cyan); letter-spacing: 4px; text-transform: uppercase; margin-top: 2px; font-weight: 500; }

  .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .divider-line { flex: 1; height: 1px; background: rgba(0,212,255,0.12); }
  .divider-text { font-size: 11px; color: var(--slate); letter-spacing: 2px; text-transform: uppercase; }

  .api-error-banner {
    background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.3);
    border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;
    display: flex; align-items: flex-start; gap: 10px; animation: fadeIn 0.3s ease;
  }
  .api-error-icon { color: var(--error); flex-shrink: 0; margin-top: 1px; }
  .api-error-text { font-size: 13px; color: #ff8fa3; line-height: 1.5; }

  .field-group { margin-bottom: 20px; }
  .field-label { display: block; font-size: 11px; font-weight: 600; color: var(--slate); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
  .field-wrap { position: relative; display: flex; align-items: center; }
  .field-icon { position: absolute; left: 16px; color: var(--cyan-dim); display: flex; align-items: center; pointer-events: none; }
  .field-input {
    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(0,212,255,0.15);
    border-radius: 12px; color: var(--white); font-family: 'Outfit', sans-serif; font-size: 15px;
    padding: 14px 48px 14px 46px; outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s; letter-spacing: 0.3px;
  }
  .field-input::placeholder { color: rgba(139,167,199,0.4); }
  .field-input:focus { border-color: rgba(0,212,255,0.5); background: rgba(0,212,255,0.04); box-shadow: 0 0 0 3px rgba(0,212,255,0.08), inset 0 0 20px rgba(0,212,255,0.03); }
  .field-input.error-field { border-color: rgba(255,77,109,0.5); box-shadow: 0 0 0 3px rgba(255,77,109,0.08); }
  .eye-btn { position: absolute; right: 14px; background: none; border: none; cursor: pointer; color: rgba(139,167,199,0.5); display: flex; align-items: center; padding: 4px; border-radius: 6px; transition: color 0.2s, background 0.2s; }
  .eye-btn:hover { color: var(--cyan); background: rgba(0,212,255,0.08); }
  .error-msg { font-size: 12px; color: var(--error); margin-top: 6px; display: flex; align-items: center; gap: 5px; animation: fadeIn 0.2s ease; }

  .options-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .remember-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .remember-checkbox { width: 16px; height: 16px; accent-color: var(--cyan); cursor: pointer; }
  .remember-label { font-size: 13px; color: var(--slate); cursor: pointer; user-select: none; }
  .forgot-link { font-size: 13px; color: var(--cyan-dim); text-decoration: none; background: none; border: none; cursor: pointer; transition: color 0.2s; font-family: 'Outfit', sans-serif; }
  .forgot-link:hover { color: var(--cyan); }

  .login-btn {
    width: 100%; padding: 15px; border: none; border-radius: 12px; cursor: pointer;
    font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
    color: var(--midnight); background: linear-gradient(135deg, var(--cyan) 0%, var(--teal) 100%);
    position: relative; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
    box-shadow: 0 4px 24px rgba(0,212,255,0.25), 0 0 0 1px rgba(0,212,255,0.3);
  }
  .login-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%); opacity: 0; transition: opacity 0.2s; }
  .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,212,255,0.35); }
  .login-btn:hover:not(:disabled)::before { opacity: 1; }
  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .btn-shimmer { position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); transform: skewX(-20deg); animation: flow 2s linear infinite; }

  .status-bar { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 28px; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 6px var(--teal); animation: shimmer 2s ease-in-out infinite; }
  .status-text { font-size: 11px; color: rgba(139,167,199,0.5); letter-spacing: 1px; }

  .success-overlay {
    position: absolute; inset: 0; border-radius: 24px; background: rgba(3,13,26,0.97);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
    animation: fadeIn 0.3s ease; z-index: 10;
  }
  .success-check { width: 60px; height: 60px; border-radius: 50%; background: rgba(0,245,195,0.1); border: 2px solid var(--teal); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 24px rgba(0,245,195,0.3); }
  .success-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: var(--white); letter-spacing: 2px; }
  .success-sub { font-size: 13px; color: var(--slate); }
`;

const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite"/>
    </path>
  </svg>
);

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "Email address is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const handleLogin = async () => {
    setApiError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) { triggerShake(); return; }

    setLoading(true);
    try {
      const response: any = await authAPI.login(email, password);

      if (response?.statusCode === 200 && response?.data) {
        const { accessToken } = response.data;
        if (accessToken) localStorage.setItem('authToken', accessToken);
        setSuccess(true);
        setTimeout(() => router.push('/home'), 1600);
      } else {
        // fallback: try token/accessToken directly on response
        const token = response?.token || response?.accessToken;
        if (token) {
          localStorage.setItem('authToken', token);
          if (response?.user) localStorage.setItem('user', JSON.stringify(response.user));
          setSuccess(true);
          setTimeout(() => router.push('/home'), 1600);
        } else {
          throw new Error(response?.errors || response?.message || 'Login failed. Please try again.');
        }
      }
    } catch (err: any) {
      triggerShake();
      setApiError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="login-root">
      <div className="bg-grid" />
      <div className="bg-radial" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <svg className="water-svg" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ height: 180 }}>
        <path fill="rgba(0,212,255,0.12)" d="M0,80 C200,20 300,130 500,80 C700,30 800,120 1000,80 L1000,200 L0,200 Z">
          <animate attributeName="d" dur="6s" repeatCount="indefinite"
            values="M0,80 C200,20 300,130 500,80 C700,30 800,120 1000,80 L1000,200 L0,200 Z;M0,60 C150,110 350,10 500,70 C650,130 850,30 1000,60 L1000,200 L0,200 Z;M0,80 C200,20 300,130 500,80 C700,30 800,120 1000,80 L1000,200 L0,200 Z" />
        </path>
        <path fill="rgba(0,245,195,0.06)" d="M0,100 C250,50 400,150 600,100 C800,50 900,130 1000,100 L1000,200 L0,200 Z">
          <animate attributeName="d" dur="9s" repeatCount="indefinite"
            values="M0,100 C250,50 400,150 600,100 C800,50 900,130 1000,100 L1000,200 L0,200 Z;M0,120 C200,80 450,160 600,110 C750,60 900,150 1000,120 L1000,200 L0,200 Z;M0,100 C250,50 400,150 600,100 C800,50 900,130 1000,100 L1000,200 L0,200 Z" />
        </path>
      </svg>

      <div className="card-wrap">
        <div className={`card${shake ? " shake" : ""}`}>

          {success && (
            <div className="success-overlay">
              <div className="success-check">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f5c3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="success-title">ACCESS GRANTED</div>
              <div className="success-sub">Redirecting to Dashboard…</div>
            </div>
          )}

          {/* Logo */}
          <div className="logo-area">
            <div className="logo-icon">
              <div className="pulse-ring" />
              <div className="logo-ring" />
              <div className="logo-inner">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <path d="M15 4 C15 4 8 11 8 17 C8 20.8 11.1 24 15 24 C18.9 24 22 20.8 22 17 C22 11 15 4 15 4Z"
                    fill="none" stroke="#00d4ff" strokeWidth="1.5" />
                  <path d="M11 17 C11 17 10 13.5 13.5 11" stroke="#00f5c3" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="15" cy="17" r="2.5" fill="#00d4ff" opacity="0.9" />
                  <path d="M15 24 L15 27" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M11 26 L19 26" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="company-name">RiverWatch</div>
            <div className="company-sub">Water Level Management</div>
          </div>

          <div className="divider">
            <div className="divider-line" />
            <div className="divider-text">Admin Portal</div>
            <div className="divider-line" />
          </div>

          {apiError && (
            <div className="api-error-banner">
              <span className="api-error-icon"><IconAlert /></span>
              <span className="api-error-text">{apiError}</span>
            </div>
          )}

          {/* Email */}
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <div className="field-wrap">
              <span className="field-icon"><IconUser /></span>
              <input
                className={`field-input${errors.email ? " error-field" : ""}`}
                type="email"
                placeholder="admin@riverwatch.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); setApiError(""); }}
                onKeyDown={handleKey}
                autoComplete="email"
              />
            </div>
            {errors.email && <div className="error-msg"><IconAlert />{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <span className="field-icon"><IconLock /></span>
              <input
                className={`field-input${errors.password ? " error-field" : ""}`}
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); setApiError(""); }}
                onKeyDown={handleKey}
                autoComplete="current-password"
              />
              <button className="eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1} type="button" aria-label="Toggle password">
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {errors.password && <div className="error-msg"><IconAlert />{errors.password}</div>}
          </div>

          <div className="options-row">
            <label className="remember-wrap" onClick={() => setRemember(v => !v)}>
              <input className="remember-checkbox" type="checkbox" checked={remember} onChange={() => {}} />
              <span className="remember-label">Remember me</span>
            </label>
            <button className="forgot-link" type="button">Forgot password?</button>
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            <div className="btn-shimmer" />
            {loading
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spinner />Authenticating…</span>
              : "Sign In"
            }
          </button>

          <div className="status-bar">
            <div className="status-dot" />
            <div className="status-text">Secure · Encrypted · AES-256</div>
          </div>
        </div>
      </div>
    </div>
  );
}