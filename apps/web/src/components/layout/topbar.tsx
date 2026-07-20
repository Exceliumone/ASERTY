'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { navItems } from '@/lib/nav-items';

export function Topbar() {
  const pathname = usePathname();
  const current = navItems.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg lg:px-8">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h1 className="font-display text-lg font-semibold">{current?.label ?? 'Pablo AI Social Agent'}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <div className="ml-2 h-9 w-9 rounded-full bg-gradient-to-br from-pablo-solanaPurple to-pablo-solanaGreen" />
      </div>
    </header>
  );
}
