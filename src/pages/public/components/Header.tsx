import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LogIn, LayoutDashboard, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/main-logo.webp";
import { useEffect } from "react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // جلب البيانات والدوال من السياق (Context)
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const location = useLocation();

  const baseLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/about", label: "عن المكتبة" },
    { to: "/partner", label: "حول الموقع" },
    { to: "/posts", label: "الأخبار" },
    { to: "/services", label: "الخدمات" },
    { to: "/search", label: "بحث" },
    { to: "/contact", label: "تواصل معنا" },
  ];

  
  // دالة الخروج النهائية
  const handleLogout = () => {
    logout(); // تقوم بمسح التوكن وإعادة توجيه المتصفح
    setShowLogoutConfirm(false);
    setMobileOpen(false);
  };

  return (
      <>
        <header className="sticky top-0 z-40 w-full bg-white  border-b">
          <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">

            <Link to="/" className="flex items-center shrink-0 bg-white rounded-xl p-1">
            <img
                src={logo}
                alt="شعار المكتبة"
                className="h-10 md:h-14 w-auto object-contain mix-blend-multiply dark:brightness-125 dark:contrast-125"
            />
          </Link>

            {/* روابط التنقل (Desktop) */}
            <nav className="hidden xl:flex items-center gap-2">
              {baseLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`px-4 py-2 text-[15px] font-bold rounded-full transition-all ${
                            isActive
                                ? "bg-secondary text-white shadow-md"
                                : "text-foreground hover:text-secondary hover:bg-muted"
                        }`}
                    >
                      {link.label}
                    </Link>
                );
              })}
            </nav>

            {/* منطقة الحساب الذكية */}
            <div className="hidden md:flex items-center gap-3">
              {isLoading ? (
                  <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
              ) : !isAuthenticated ? (
                  <Link
                      to="/login"
                      className="flex items-center gap-2 px-6 py-2 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-sm"
                  >
                    <LogIn size={18} />
                    <span>تسجيل الدخول</span>
                  </Link>
              ) : (
                  <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-2xl border">
                    <div className="px-3 hidden lg:block">
                      <p className="text-[10px] text-muted-foreground leading-none">مرحباً بك</p>
                      <p className="text-xs font-bold truncate max-w-[120px]">{user?.userName}</p>
                    </div>

                    {/* زر مخصص بناءً على الدور */}
                    {user?.role === "Employee" || user?.role === "Admin" ? (
                        <Link
                            to="/admin/dash"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                        >
                          <LayoutDashboard size={18} />
                          <span>لوحة التحكم</span>
                        </Link>
                    ) : (
                        <Link
                            to="/member-profile"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-secondary text-secondary transition-all font-bold ${
                                location.pathname === "/member-profile" ? "bg-secondary text-white" : "hover:bg-white"
                            }`}
                        >
                          <User size={18} />
                          <span>ملفي الشخصي</span>
                        </Link>
                    )}

                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="تسجيل خروج"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
              )}
            </div>

            {/* زر الموبايل */}
            <button type="button" className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu size={28} />
            </button>
          </div>
        </header>

        {/* قائمة الموبايل */}
        <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${mobileOpen ? "visible" : "invisible"}`}>
          <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
          <nav className={`absolute right-0 top-0 h-full w-[280px] bg-card shadow-2xl transition-transform duration-300 flex flex-col ${mobileOpen ? "translate-x-0" : "translate-x-full"}`} dir="rtl">
            <div className="flex justify-between items-center p-5 border-b">
              <span className="font-bold text-lg text-secondary">القائمة الرئيسيـة</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-muted rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col p-4 overflow-y-auto">
              {baseLinks.map((link) => (
                  <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-4 px-4 font-bold border-b border-muted/30 ${location.pathname === link.to ? "text-secondary" : "text-foreground"}`}
                  >
                    {link.label}
                  </Link>
              ))}

              <div className="mt-6 space-y-2">
                {!isAuthenticated ? (
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-4 px-4 bg-secondary/10 text-secondary rounded-xl font-bold">
                      <LogIn size={20} /> تسجيل الدخول
                    </Link>
                ) : (
                    <>
                      <div className="px-4 py-2 text-xs text-muted-foreground border-b mb-2">
                        متصل كـ: <span className="font-bold text-foreground">{user?.userName}</span>
                      </div>
                      {user?.role === "Employee" || user?.role === "Admin" ? (
                       <Link
  to={localStorage.getItem("token") ? "/admin/dash" : "/login"}
  onClick={() => setMobileOpen(false)}
  className="flex items-center gap-3 py-4 px-4 text-slate-900 font-bold hover:bg-muted rounded-xl"
>
  <LayoutDashboard size={20} /> لوحة التحكم
</Link>
                      ) : (
                          <Link to="/member-profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-4 px-4 text-secondary font-bold hover:bg-muted rounded-xl">
                            <User size={20} /> ملفي الشخصي
                          </Link>
                      )}
                      <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-3 py-4 px-4 text-red-500 font-bold w-full text-right hover:bg-red-50 rounded-xl">
                        <LogOut size={20} /> خروج
                      </button>
                    </>
                )}
              </div>
            </div>
          </nav>
        </div>

        {showLogoutConfirm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
              <div className="relative bg-card p-7 rounded-3xl shadow-2xl max-w-sm w-full border animate-in zoom-in duration-200" dir="rtl">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">تأكيد الخروج</h3>
                <p className="text-muted-foreground mb-6 text-sm font-bold leading-relaxed">
                  هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟
                </p>
                <div className="flex gap-3">
                  <button
                      onClick={handleLogout}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-md active:scale-95"
                  >
                    تأكيد الخروج
                  </button>
                  <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all active:scale-95"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
};

export default Header;