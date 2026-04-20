import { ReactNode, useState } from "react";
import { AppSidebar } from "@/pages/admin/components/AddSide";
import { useTheme } from "@/contexts/ThemeProvider";
import { Moon, Sun, Menu, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/ui/button";
import Footer from "@/pages/admin/pages/Footer";

// استيراد الشعار
import sloganLogo from "@/assets/slogan.jpeg";
import logo from "@/assets/upscalemedia-transformed.png";


interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = localStorage.getItem("userName") || "الموظف";

  return (

    <div className="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-slate-950 text-right" dir="rtl">

      <header className="h-auto md:h-24 sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-0
        bg-white dark:bg-slate-900
        border-b-4 border-indigo-600 shadow-lg">

        {/* القسم الأيمن - القائمة والمستخدم */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl transition-all duration-300
              text-slate-600 dark:text-slate-400
              hover:bg-indigo-600 hover:text-white
              hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none
              active:scale-90"
          >
            <Menu className="w-5 h-5 md:w-7 md:h-7" />
          </Button>

          <div className="flex items-center gap-2 md:gap-3 bg-slate-50 dark:bg-slate-800 p-1.5 md:p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center border-2 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                {userName}
              </span>
            </div>
          </div>
        </div>

        {/* القسم الأوسط - الشعار الكبير (يظهر في منتصف الشاشة على الكمبيوتر ويختفي على الموبايل) */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-5">
          <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-800">
            <img
              src={sloganLogo}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-md border-4 border-white dark:border-slate-800"
              alt="شعار البلدية والمكتبة"
            />
            <div className="w-px h-6 bg-indigo-200 dark:bg-indigo-800" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">بلدية طولكرم</span>
              <span className="text-sm md:text-lg font-black text-indigo-700 dark:text-indigo-300 leading-tight whitespace-nowrap">
                المنظومة الإلكترونية لإدارة المكتبة
              </span>
            </div>
            <img
              src={logo}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-md border-4 border-white dark:border-slate-800"
              alt="شعار البلدية والمكتبة"
            />
          </div>
        </div>

        {/* شعار مصغر يظهر على الموبايل والتابلت */}
        <div className="flex lg:hidden items-center justify-center w-full md:w-auto">
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
            <img
              src={sloganLogo}
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-800"
              alt="شعار البلدية والمكتبة"
            />
            <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-800" />
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
              منظومة المكتبة
            </span>
            <img
              src={logo}
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-800"
              alt="شعار البلدية والمكتبة"
            />
          </div>
        </div>

        {/* القسم الأيسر - أيقونة المكتبة */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-200 hidden sm:block">مكتبة البلدية</span>
          <div className="w-8 h-8 md:w-11 md:h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none ring-2 md:ring-4 ring-indigo-50 dark:ring-indigo-900/30">
            <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
          <div className="flex-1 p-3 md:p-6 lg:p-10">
            {children || (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold">جاري تحميل البيانات...</p>
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}