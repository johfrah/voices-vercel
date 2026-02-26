"use client";

import { 
  Home, Heart, Library, UserCircle, Menu, Search as SearchIcon,
  Sparkles, Compass, Calendar, ChevronDown, Users as UsersIcon 
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { VoiceglotText } from "../VoiceglotText";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/ademing/ui/sheet";

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
    { label: <VoiceglotText translationKey="nav.home" defaultText="Home" />, icon: Home, path: '/' },
    { label: <VoiceglotText translationKey="nav.explore" defaultText="Verkennen" />, icon: Compass, path: '/zoeken' },
    { label: <VoiceglotText translationKey="nav.library" defaultText="Bibliotheek" />, icon: Library, path: '/bibliotheek' },
    { label: <VoiceglotText translationKey="nav.favorites" defaultText="Favorieten" />, icon: Heart, path: '/favorieten' },
    { label: <VoiceglotText translationKey="nav.retreats" defaultText="Retreats" />, icon: Calendar, path: '/retreats' },
    { label: <VoiceglotText translationKey="nav.profile" defaultText="Mijn Ademing" />, icon: UserCircle, path: '/mijn-ademing' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6",
        isScrolled ? "bg-white/80 backdrop-blur-md py-4 shadow-soft" : "bg-transparent py-8"
      )}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-3 items-center">
        {/* Left: Hamburger Menu & Search */}
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-4 hover:bg-black/5 rounded-full transition-all group active:scale-90 relative">
                <Menu className="w-8 h-8 animate-breathe-wave-subtle" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-xl border-r border-primary/5 p-0 overflow-y-auto">
              <div className="p-8 border-b border-primary/5">
                <Logo className="scale-90 origin-left" />
              </div>
              
              <nav className="flex flex-col p-4 gap-1">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">
                  <VoiceglotText translationKey="nav.section.menu" defaultText="Menu" />
                </p>
                {navigationItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
                        isActive 
                          ? "bg-primary/10 text-primary font-semibold shadow-soft" 
                          : "text-muted-foreground hover:bg-black/5 hover:translate-x-1"
                      )}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                      <span className="text-base font-serif">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 mt-4">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">
                  <VoiceglotText translationKey="nav.section.explore" defaultText="Verkennen" />
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { label: <VoiceglotText translationKey="nav.themes" defaultText="Thema's" />, icon: Sparkles, path: '/themas' },
                    { label: <VoiceglotText translationKey="nav.elements" defaultText="Elementen" />, icon: Compass, path: '/elementen' },
                    { label: <VoiceglotText translationKey="nav.guides" defaultText="Begeleiders" />, icon: UsersIcon, path: '/begeleiders' },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-black/5 transition-all"
                    >
                      <item.icon size={18} strokeWidth={1.5} />
                      <span className="text-base font-serif">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-auto p-8">
                <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                    <VoiceglotText translationKey="nav.premium.title" defaultText="Premium" />
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    <VoiceglotText translationKey="nav.premium.description" defaultText="Ontgrendel alle meditaties en offline luisteren." />
                  </p>
                  <Link href="/premium" className="text-sm font-bold text-primary flex items-center gap-2 group">
                    <VoiceglotText translationKey="nav.premium.cta" defaultText="Bekijk opties" />
                    <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <button className="p-4 hover:bg-black/5 rounded-full transition-all hidden md:flex active:scale-90 text-va-black/40 hover:text-primary">
            <SearchIcon className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Right: User/Actions */}
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
          <Link href="/favorieten" className="p-3 hover:bg-black/5 rounded-full transition-all hidden md:flex active:scale-90">
            <Heart className="w-6 h-6" strokeWidth={1.5} />
          </Link>
          <Link href="/bibliotheek" className="p-3 hover:bg-black/5 rounded-full transition-all hidden md:flex active:scale-90">
            <Library className="w-6 h-6" strokeWidth={1.5} />
          </Link>
          <Link href="/mijn-ademing" className="p-3 hover:bg-black/5 rounded-full transition-all active:scale-90 bg-primary/5 text-primary">
            <UserCircle className="w-6 h-6" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  );
};
