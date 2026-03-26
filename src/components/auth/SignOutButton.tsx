"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function SignOutButton({ className, children }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className || "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors"}
    >
      {children || (
        <>
          <LogOut className="w-4 h-4" />
          Sair
        </>
      )}
    </button>
  );
}
