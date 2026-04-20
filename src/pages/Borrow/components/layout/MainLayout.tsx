import { ReactNode, useState } from "react";
import { AppSidebar } from "@/pages/admin/components/AddSide";
import { useTheme } from "@/contexts/ThemeProvider";
import { Moon, Sun, Menu, BookOpen } from "lucide-react";
import { Button } from "@/ui/button";
import Footer from "@/pages/admin/pages/Footer";


interface AdminLayoutProps {
  children: ReactNode;
}


export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-slate-950 text-right" dir="rtl">
      
      {/* ─── Header ─── */}
      <header className="h-24 sticky top-0 z-40 flex items-center justify-between px-8
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
        border-b border-slate-200/70 dark:border-slate-800/70 shadow-sm">

        <div className="flex items-center gap-4">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="w-11 h-11 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </Button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-3">
             <div className="relative">
                <img
                  src="/slogan.png"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-100 dark:ring-indigo-900"
                  alt="Logo"
                />
             </div>
             <p className="text-base font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
               مدير النظام
             </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 hidden md:block">
               نظام إدارة المكتبة
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-11 h-11 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* السايدبار الملون الجديد */}
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* منطقة عرض الصفحات */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
          <div className="flex-1 p-4 md:p-8 lg:p-10">
            {/* ⚠️ تأكد أن هذا الجزء يتم تمريره بشكل صحيح من App.tsx */}
            {children || <div className="text-center p-20 text-slate-400">جاري تحميل المحتوى...</div>}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}