"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Library, LayoutList, Briefcase, Minus, UserPlus, Settings, HelpCircle, ChevronDown, Book } from "lucide-react";
import { getBooks } from "@/lib/db";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const books = await getBooks();
        const catMap = new Map<string, number>();
        
        books.forEach(book => {
          const cat = book.kategori || "Tanpa Kategori";
          catMap.set(cat, (catMap.get(cat) || 0) + 1);
        });

        const catArray = Array.from(catMap.entries()).map(([name, count]) => ({
          name, count
        })).sort((a, b) => b.count - a.count); // Sort by most books

        setCategories(catArray);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }

    fetchCategories();

    // Custom event listener for when books change
    const handleUpdate = () => fetchCategories();
    window.addEventListener("focus", handleUpdate); // Simple refresh when coming back to tab
    
    return () => {
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  const mainNav = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Katalog Buku", icon: Library, path: "/katalog" },
    { name: "Sirkulasi", icon: LayoutList, path: "/sirkulasi" },
    { name: "Pelaporan", icon: Briefcase, path: "/laporan" },
  ];

  const handleCategoryClick = (catName: string) => {
    // Navigate to catalog with some query param or just simple redirect
    router.push(`/katalog?kategori=${encodeURIComponent(catName)}`);
  };

  return (
    <div className="w-[260px] bg-[#fdfdfd] border-r border-slate-200 min-h-screen flex flex-col">
      {/* Header / Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200">
        <div className="bg-[#f4722b] p-1.5 rounded-md flex items-center justify-center">
          <Library className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">PerpusDesktop</h1>
          <p className="text-[11px] text-slate-500 font-medium">Library Management</p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
              <span className="text-slate-600 font-medium text-sm">AD</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">Admin Pustaka</p>
              <p className="text-xs text-slate-500">admin@perpus.com</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="px-4 py-2 space-y-0.5">
        {mainNav.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? "bg-slate-100 text-slate-900" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-[18px] h-[18px] stroke-[2px]" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Collections Section */}
      <div className="mt-4 px-4 flex-1 overflow-y-auto">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Kategori Buku</h3>
        <div className="space-y-0.5">
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 italic">Belum ada kategori data</div>
          ) : (
            categories.map((cat, i) => (
              <div 
                key={i} 
                onClick={() => handleCategoryClick(cat.name)}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-slate-200 group-hover:bg-[#f4722b] transition-colors flex items-center justify-center text-slate-500 group-hover:text-white">
                    <Minus className="w-3 h-3" />
                  </div>
                  <span className="truncate max-w-[120px]">{cat.name}</span>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md group-hover:bg-slate-200">
                  {cat.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="p-4 space-y-0.5 border-t border-slate-100">
        <Link href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4" />
            Bantuan
          </div>
        </Link>
      </div>
    </div>
  );
}
