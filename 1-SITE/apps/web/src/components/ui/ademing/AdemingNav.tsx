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
import { ContainerInstrument } from "../LayoutInstruments";

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
      <ContainerInstrument className="max-w-6xl mx-auto flex justify-center items-center">
        {/* Center: Logo Only for MVP */}
        <Logo />
      </ContainerInstrument>
    </nav>
  );
};
