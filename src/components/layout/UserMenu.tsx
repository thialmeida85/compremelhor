"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu({ userName }: { userName: string }) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition text-sm font-medium hidden sm:block">
        Painel Admin
      </Link>
      <div className="flex items-center gap-2 bg-brand-graphite py-1 pl-1 pr-3 rounded-full border border-gray-700">
        <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm uppercase">
          {userName.charAt(0)}
        </div>
        <span className="text-xs text-white font-medium hidden sm:block max-w-[80px] truncate" title={userName}>
          {userName}
        </span>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })} 
          className="text-xs text-gray-400 hover:text-red-400 transition ml-1 border-l border-gray-600 pl-2"
          title="Sair do sistema"
        >
          Sair
        </button>
      </div>
    </div>
  );
}