"use client";

import { Menu, Search, User, Heart, Library } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import Link from "next/link";

export const AdemingNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6",
        isScrolled ? "bg-white/80 backdrop-blur-md py-4 shadow-soft" : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        {/* Left: Search/Menu */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors group">
            <Menu className="w-6 h-6 animate-breathe-wave-subtle" />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Right: User/Actions */}
        <div className="flex items-center justify-end gap-2">
          <Link href="/favorieten" className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block">
            <Heart className="w-5 h-5" />
          </Link>
          <Link href="/bibliotheek" className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block">
            <Library className="w-5 h-5" />
          </Link>
          <Link href="/account" className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
