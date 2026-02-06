'use client';

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Droplet } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await authAPI.login(email, password);
      console.log("LOGIN RESPONSE:", response);

      if (response?.statusCode === 200 && response?.data) {
        const { accessToken, refreshToken } = response.data;

        // Store tokens
        localStorage.setItem('authToken', accessToken);
        // localStorage.setItem('refreshToken', refreshToken);

        // Safe token decode (optional)
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          console.log("User payload:", payload);
        } catch (err) {
          console.warn("Token decode failed (safe to ignore)");
        }

        // 🔥 Important: delay redirect so middleware/localStorage sync properly
        setTimeout(() => {
          console.log("Redirecting to /home...");
          router.push('/home');
          setLoading(false);

        }, 700);

      } else {
        setError(response?.errors || 'Login failed. Please try again.');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center px-4 py-12">
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-full">
              <Droplet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">RiverWatch</h1>
          <p className="text-muted-foreground text-sm">Water Level Management System</p>
        </div>

        {/* Card */}
        <Card className="border-primary/20 shadow-xl bg-white/95 backdrop-blur-sm">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Welcome
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-accent text-white font-semibold mt-6"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo */}
            <div className="mt-6 p-3 bg-secondary/10 border border-secondary/30 rounded-lg text-xs">
              <p className="font-semibold mb-1">Test Credentials:</p>
              <p>Email: manish@admin.com</p>
              <p>Password: Test@123</p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          River Water Level Monitoring & Management Platform
        </p>
      </div>
    </div>
  );
}
