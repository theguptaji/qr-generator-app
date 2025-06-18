"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

export default function MainLayout({
  children,
  onBatchDownload,
}: {
  children: React.ReactNode;
  onBatchDownload?: (
    prefix: string,
    pageCount: number,
    qrLinkTemplate: string
  ) => void;
}) {
  const pathname = usePathname();
  const [isBatchModalOpen, setBatchModalOpen] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState("Table no");
  const [batchPages, setBatchPages] = useState(1);
  const [batchQrLink, setBatchQrLink] = useState("");

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
                  "text-2xl font-semibold tracking-tight",
                  "text-[#22223b] dark:text-white"
                )}
                style={{
                  fontFamily: "Playfair Display, serif",
                  letterSpacing: 0.5,
                }}
              >
                QR Standee Generator
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button className="ml-2" onClick={() => setBatchModalOpen(true)}>
                Batch Download
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
        {/* Batch Download Modal (to be implemented) */}
        {isBatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
              <h2 className="text-xl font-bold mb-4">Batch Download</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  QR Link Template
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={batchQrLink}
                  onChange={(e) => setBatchQrLink(e.target.value)}
                  placeholder="https://example.com/table/{n}"
                />
                <div className="text-xs text-gray-500 mb-2">
                  Use <code>{"{n}"}</code> for the standee number.
                </div>
                <label className="block text-sm font-medium mb-1">
                  Prefix (e.g., Table no)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  placeholder="Table no"
                />
                <label className="block text-sm font-medium mb-1 mt-2">
                  Number of Pages
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border rounded px-3 py-2"
                  value={batchPages}
                  onChange={(e) => setBatchPages(Number(e.target.value))}
                />
              </div>
              <button
                className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors w-full"
                onClick={() => {
                  if (onBatchDownload)
                    onBatchDownload(batchPrefix, batchPages, batchQrLink);
                  setBatchModalOpen(false);
                }}
              >
                Download
              </button>
              <button
                className="mt-4 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
                onClick={() => setBatchModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
