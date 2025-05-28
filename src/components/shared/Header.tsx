
'use client';

import Link from 'next/link';
import { Home, ShieldCheck } from 'lucide-react'; // Using ShieldCheck for Admin as an example
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    // The logo item is now handled directly in the JSX for simplicity
    { href: '/admin', label: 'Admin', icon: <ShieldCheck className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* Icon removed from here */}
          <span className="font-bold text-xl text-primary sm:inline-block">
            Adilla
          </span>
        </Link>
        
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80 flex items-center gap-1.5 py-2 px-3 rounded-md',
                pathname === item.href ? 'text-foreground bg-accent' : 'text-foreground/60',
                'font-medium'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
