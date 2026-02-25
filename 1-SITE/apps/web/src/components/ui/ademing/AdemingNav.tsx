"use client";

import { 
  Home, Heart, Library, User, Menu, 
  Sparkles, Compass, Calendar, ChevronDown 
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

export const AdemingNav = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Verkennen', icon: Compass, path: '/zoeken' },
    { label: 'Bibliotheek', icon: Library, path: '/bibliotheek' },
    { label: 'Favorieten', icon: Heart, path: '/favorieten' },
    { label: 'Retreats', icon: Calendar, path: '/retreats' },
    { label: 'Profiel', icon: User, path: '/account' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6",
        isScrolled ? "bg-white/80 backdrop-blur-md py-4 shadow-soft" : "bg-transparent py-8"
      )}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-3 items-center">
        {/* Left: Hamburger Menu */}
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-black/5 rounded-full transition-colors group">
                <Menu className="w-6 h-6 animate-breathe-wave-subtle" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-xl border-r border-primary/5 p-8">
              <div className="mb-12">
                <Logo className="scale-90 origin-left" />
              </div>
              <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300",
                        isActive 
                          ? "bg-primary/10 text-primary font-semibold shadow-soft" 
                          : "text-muted-foreground hover:bg-black/5 hover:translate-x-1"
                      )}
                    >
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                      <span className="text-lg font-serif">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Premium</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">Ontgrendel alle meditaties en offline luisteren.</p>
                  <Link href="/premium" className="text-sm font-bold text-primary flex items-center gap-2 group">
                    Bekijk opties <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Right: User/Account */}
        <div className="flex items-center justify-end gap-2">
          <Link href="/account" className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
