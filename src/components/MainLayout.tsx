"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 lg:px-6 shadow-sm z-10">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className={cn(
                  "text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                  pathname === "/" && "text-blue-600 dark:text-blue-400"
                )}
              >
                Tabletop QR Generator
              </Link>
              <Link
                href="/templates"
                className={cn(
                  "text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                  pathname === "/templates" &&
                    "text-blue-600 dark:text-blue-400"
                )}
              >
                Templates
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
