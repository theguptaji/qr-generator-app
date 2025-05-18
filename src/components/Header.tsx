"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-white/90 dark:bg-gray-900/90 shadow">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-600 p-1.5 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
            <path d="M13 13h4" />
            <path d="M13 17h4" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
          Kanriapps QR Generator
        </span>
      </div>
      
      {/* Theme Toggle */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
