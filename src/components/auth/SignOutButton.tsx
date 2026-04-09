"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { criarClienteSupabaseBrowser } from "@/lib/supabase/browser";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function SignOutButton({ className, children }: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = criarClienteSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
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
