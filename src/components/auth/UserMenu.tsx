"use client";

import { signOut } from "next-auth/react";
import { UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-white hover:text-red-400 transition-colors focus:outline-none"
      >
        <UserCircle className="w-4 h-4" />
        <span className="max-w-[100px] truncate">Olá, {user.name?.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[100] border border-gray-200 animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Usuário</p>
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
          </div>
          
          <Link 
            href="/perfil" 
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-700 transition-colors font-bold"
            onClick={() => setIsOpen(false)}
          >
            <UserCircle className="w-4 h-4" />
            Meu Perfil
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-700 transition-colors font-bold border-t border-gray-100"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

