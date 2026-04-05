'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full absolute top-6 right-6 z-50 bg-background/50 backdrop-blur-sm border border-border"
    >
      <Moon className="w-5 h-5 hidden dark:block transition-all" />
      <Sun className="w-5 h-5 block dark:hidden transition-all text-yellow-500" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
