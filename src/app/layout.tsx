import "./globals.css";
import { ReactNode } from "react";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";

export interface Metadata {
  title?: string;
  description?: string;
}

export const metadata: Metadata = {
  title: "Table QR Generator - Kanriapps",
  description: "Generate QR codes for restaurant tables easily",
};

// Client-side script for initializing theme based on user preference
const themeInitScript = `
  (function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
