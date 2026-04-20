import {
  LayoutDashboard, Users, UserCog, LogOut,
  Moon, Sun, X, Globe, Library,
  ListChecks, ChevronLeft, BookPlus, BookMarked,
  RefreshCw, Edit, RotateCcw, Clock, BarChart2,
  UserCircle, Bell, Trash2, QrCode, FileText,
  ShieldCheck, ChevronDown, ChevronUp, BookOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

import {useAuth} from "@/contexts/AuthContext.tsx";

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  permission?: string;
}
interface NavGroup {
  label: string;
  icon: React.ElementType;
  children: NavItem[];
}
type MenuItem = NavItem | NavGroup;
const isGroup = (item: MenuItem): item is NavGroup => "children" in item;

const ALL_MENU: MenuItem[] = [
  { title: "لوحة القيادة", path: "/admin/dash", icon: LayoutDashboard },

  {
    label: "إدارة الكتب", icon: BookOpen,
    children: [
      { title: "إضافة كتاب",     path: "/admin/add-book",  icon: BookPlus,        permission: "Create-Book_books" },
      { title: "عرض الكتب",      path: "/admin/books",     icon: BookMarked,      permission: "Read-Book_books" },
      { title: "باركود الكتب",   path: "/admin/barcode",   icon: QrCode,          permission: "Read-Book_books" },
      { title: "اخراج الكتب",      path: "/admin/delete",    icon: Trash2,          permission: "Delete-Book_books" },
      { title: "تقارير الكتب",   path: "/admin/reports",   icon: FileText,        permission: "Read-Reports_books" },
    ],
  },

  {
    label: "الاستعارات", icon: BookMarked,
    children: [
      { title: "إعارة كتاب",      path: "/admin/loan",            icon: BookOpen,  permission: "Create-Borrow_borrows" },
      { title: "إرجاع كتاب",      path: "/admin/return-loan",     icon: RotateCcw, permission: "Handle-Borrow_borrows" },
      { title: "المتأخرين",        path: "/admin/late-returns",    icon: Clock,     permission: "Handle-Borrow_borrows" },
      { title: "الطلبات أونلاين", path: "/admin/online-requests", icon: Globe,     permission: "Handle-Online-Borrow_borrows" },
    ],
  },

  {
    label: "الاشتراكات", icon: BookPlus,
    children: [
      { title: "اشتراك جديد",  path: "/admin/subscription/new",   icon: BookPlus,  permission: "Create-Subscription_Subscriptions" },
      { title: "تجديد اشتراك", path: "/admin/subscription/renew", icon: RefreshCw, permission: "Renew-Subscription_Subscriptions" },
      { title: "تعديل اشتراك", path: "/admin/subscription/edit",  icon: Edit,      permission: "Update-Subscription_Subscriptions" },
    ],
  },

  {
    label: "التقارير", icon: BarChart2,
    children: [
      { title: "تقارير عامة", path: "/admin/general-reports",  icon: BarChart2,  permission: "Read-Reports_borrows" },
      { title: "تقرير شخصي", path: "/admin/personal-reports", icon: UserCircle, permission: "Read-Reports_borrows" },
    ],
  },


  {
    label: "النظام والإدارة", icon: ShieldCheck,
    children: [
      { title: "الاحصائيات",         path: "/admin/statistics", icon: UserCog,    permission: "DashboardAccess_Admin" },
      { title: "الموظفين",         path: "/admin/employees", icon: UserCog,    permission: "Read-Employees_Admin" },
      { title: "المجموعات",        path: "/admin/groups",    icon: Users,      permission: "Read-Groups_Admin" },
      { title: "محتوى الموقع",     path: "/admin/homepage",  icon: Globe,      permission: "Update-HomePage_Admin" },
      { title: "القوائم المنسدلة", path: "/admin/select",    icon: ListChecks, permission: "Read-Employees_Admin" },
    ],
  },  
  { title: "التنبيهات", path: "/admin/alerts", icon: Bell, permission: "Handle-Borrow_borrows" },

];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const permissions: string[] = JSON.parse(localStorage.getItem("permissions") || "[]");
  const userName = localStorage.getItem("userName") || "الموظف";

  const visibleMenu: MenuItem[] = ALL_MENU.map((item) => {
    if (isGroup(item)) {
      const visibleChildren = item.children.filter((c) => !c.permission || permissions.includes(c.permission));
      if (visibleChildren.length === 0) return null;
      return { ...item, children: visibleChildren };
    }
    if (item.permission && !permissions.includes(item.permission)) return null;
    return item;
  }).filter(Boolean) as MenuItem[];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => { onClose(); }, [location.pathname]);

  const toggleGroup = (label: string) =>
    setExpandedGroups((prev) => prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]);

  const handleNav = (path: string) => { navigate(path); onClose(); };

  const { logout } = useAuth();

  const confirmLogout = () => {
    setShowLogoutConfirm(false); // إغلاق المودال أولاً
     logout()
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />}

      <div
        ref={sidebarRef}
        className={`fixed top-4 right-4 z-50 w-[300px] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-8 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
      {/* ─── Header Section ─── */}
<div className="relative p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-l from-indigo-50/30 to-transparent dark:from-indigo-950/10">
  
  {/* زر الإغلاق - بوضعية أوضح */}
  <div className="flex items-center justify-between mb-6">
    <button 
      onClick={onClose} 
      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
    >
      <X size={20} />
    </button>

    <div className="flex items-center gap-3">
      <div className="text-right">
        <h2 className="font-black text-base text-slate-800 dark:text-slate-100 leading-none">إدارة المكتبة</h2>
        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
          لوحة التحكم
        </span>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none ring-4 ring-indigo-50 dark:ring-indigo-900/30">
        <Library className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>

  {/* بطاقة تعريف الموظف - كبرناها وعطيناها تفاصيل أكتر */}
  <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex-1 text-right">
      <p className="text-[10px] text-slate-400 font-bold mb-0.5">مرحباً بك،</p>
      <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{userName}</p>
    </div>
    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
      <UserCircle size={24} />
    </div>
  </div>
</div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleMenu.map((item) => {
            if (!isGroup(item)) {
              const isActive = location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-2xl text-[13px] font-semibold transition-all justify-end ${
                    isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                  }`}
                >
                  {isActive && <ChevronLeft className="w-4 h-4 opacity-70" />}
                  <span>{item.title}</span>
                  <item.icon className="w-5 h-5 shrink-0" />
                </button>
              );
            }

            const isExpanded = expandedGroups.includes(item.label);
            const hasActive = item.children.some((c) => location.pathname === c.path);

            return (
              <div key={item.label}>
                <button onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center justify-between px-4 h-11 rounded-2xl text-[13px] font-semibold transition-all ${
                    hasActive ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                  }`}
                >
                  <div>{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    <item.icon className="w-5 h-5 shrink-0" />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mr-4 mt-1 space-y-1 border-r-2 border-indigo-100 dark:border-indigo-900 pr-2">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.path;
                          return (
                            <button key={child.path} onClick={() => handleNav(child.path)}
                              className={`w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[12px] font-semibold transition-all justify-end ${
                                isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                              }`}
                            >
                              {isActive && <ChevronLeft className="w-3 h-3 opacity-70" />}
                              <span>{child.title}</span>
                              <child.icon className="w-4 h-4 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-end gap-3 h-12 px-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all font-black text-xs">
            <span>تسجيل الخروج</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
     

      {/* Logout Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()} dir="rtl"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center">
                <LogOut className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">تسجيل الخروج</h3>
              <p className="text-sm text-slate-500 mb-6">هل أنت متأكد من رغبتك في تسجيل الخروج؟</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 transition-colors">إلغاء</button>
                <button onClick={confirmLogout} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors shadow-md">تأكيد الخروج</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}