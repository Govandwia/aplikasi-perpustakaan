import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aplikasi Perpustakaan",
  description: "Aplikasi manajemen perpustakaan desktop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-[#f4f5f7] text-slate-900 flex min-h-screen font-sans`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
