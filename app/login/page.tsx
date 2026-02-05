'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Droplet } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // optional: fake loading for UX
  setLoading(true);

  // optional: store dummy user/token if your app expects it later
  localStorage.setItem('authToken', 'dummy-token');
  localStorage.setItem(
    'user',
    JSON.stringify({
      email,
      role: 'admin',
    })
  );

  // small delay just for effect (optional)
  setTimeout(() => {
    router.push('/home');
    setLoading(false);
  }, 500);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-full">
              <Droplet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">RiverWatch</h1>
          <p className="text-muted-foreground text-sm">Water Level Management System</p>
        </div>

        {/* Login Card */}
        <Card className="border-primary/20 shadow-xl bg-white/95 backdrop-blur-sm">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Welcome 
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-primary/30 focus:border-primary bg-background/50 placeholder:text-muted-foreground"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-primary/30 focus:border-primary bg-background/50 placeholder:text-muted-foreground"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg mt-6"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-3 bg-secondary/10 border border-secondary/30 rounded-lg text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Demo Credentials:</p>
              <p>Email: demo@example.com</p>
              <p>Password: demo123</p>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          River Water Level Monitoring & Management Platform
        </p>
      </div>
    </div>
  );
}
