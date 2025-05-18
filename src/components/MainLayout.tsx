"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-8 shadow-sm z-10">
          <div className="flex w-full items-center justify-between">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Tabletop QR Standee Generator</div>
            <ThemeToggle />
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="container mx-auto px-2 md:px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}