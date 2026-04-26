import { useNavigate } from "react-router-dom";
import {
    BookOpen, Users, Settings, BookMarked,
    UserCheck, BarChart3, Globe, Bell,
    RefreshCw, Trash2, Tag, FileText,
    LogOut, ShieldCheck, Layers, LayoutDashboard, Database, BarChart2,
    UserCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/ui/button";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { Link } from "react-router-dom";


const ALL_CARDS = [
    { title: "إضافة كتاب", description: "إدخال كتاب جديد للنظام", icon: BookOpen, color: "bg-amber-500", path: "/admin/add-book", permission: "Create-Book_books", category: "إدارة الكتب" },
    { title: "عرض الكتب", description: "إدارة وتعديل الكتب", icon: BookMarked, color: "bg-lime-600", path: "/admin/books", permission: "Read-Book_books", category: "إدارة الكتب" },
    { title: "باركود الكتب", description: "طباعة ملصقات الباركود", icon: Tag, color: "bg-emerald-500", path: "/admin/barcode", permission: "Read-Book_books", category: "إدارة الكتب" },
    { title: "اخراج الكتب", description: "سجل الكتب المخرجة", icon: Trash2, color: "bg-rose-500", path: "/admin/delete", permission: "Delete-Book_books", category: "إدارة الكتب" },
    { title: "تقارير الكتب", description: "تقارير الجرد التفصيلية", icon: FileText, color: "bg-cyan-600", path: "/admin/reports", permission: "Read-Reports_books", category: "إدارة الكتب" },

    // --- فريق 3: الاستعارات والاشتراكات ---
    { title: "إعارة كتاب", description: "تسجيل إعارة جديدة", icon: BookOpen, color: "bg-blue-500", path: "/admin/loan", permission: "Create-Borrow_borrows", category: "الاستعارات والعمليات" },
    { title: "إرجاع كتاب", description: "إتمام عملية الإرجاع", icon: RefreshCw, color: "bg-indigo-500", path: "/admin/return-loan", permission: "Handle-Borrow_borrows", category: "الاستعارات والعمليات" },
    { title: "المتأخرين", description: "قائمة الكتب المتأخرة", icon: AlertCircle, color: "bg-red-500", path: "/admin/late-returns", permission: "Handle-Borrow_borrows", category: "الاستعارات والعمليات" },
    { title: "الطلبات أونلاين", description: "إعارات الموقع الإلكتروني واشتراكاته", icon: Globe, color: "bg-purple-500", path: "/admin/online-requests", permission: ["Handle-Online-Borrow_borrows", "Handle-Online-Subscription_Subscriptions"], category: "الاستعارات والعمليات" },
    { title: "الاشتراكات الجديدة", description: "فتح حساب مشترك", icon: UserCheck, color: "bg-teal-500", path: "/admin/subscription/new", permission: "Create-Subscription_Subscriptions", category: "إدارة المشتركين" },
    { title: "تجديد اشتراك", description: "تحديث صلاحية العضوية", icon: RefreshCw, color: "bg-sky-500", path: "/admin/subscription/renew", permission: "Renew-Subscription_Subscriptions", category: "إدارة المشتركين" },
    { title: "تعديل اشتراك", description: "تحديث بيانات المشتركين", icon: Settings, color: "bg-slate-500", path: "/admin/subscription/edit", permission: "Update-Subscription_Subscriptions", category: "إدارة المشتركين" },
    { title: "تقارير عامة", description: "تقارير الإعارات الشاملة", path: "/admin/general-reports", icon: BarChart2, color: "bg-slate-400", permission: "Read-Reports_borrows", category: "الاستعارات والعمليات" },
    { title: "تقرير شخصي", description: "سجل عمليات محددة", path: "/admin/personal-reports", icon: UserCircle, color: "bg-blue-300", permission: "Read-Reports_borrows", category: "الاستعارات والعمليات" },
    { title: "التنبيهات", description: "تنبيهات النظام والمواعيد", path: "/admin/alerts", icon: Bell, color: "bg-orange-500", permission: "Handle-Borrow_borrows", category: "الاستعارات والعمليات" },

    // --- فريق 4: الموظفين والنظام ---
    { title: "الاحصائيات", description: "عرض احصائيات المكتبة", icon: BarChart3, color: "bg-violet-200", path: "/admin/statistics", permission: "DashboardAccess_Admin", category: "النظام والإدارة" },
    { title: "الموظفين", description: "إدارة حسابات الموظفين", icon: Users, color: "bg-violet-300", path: "/admin/employees", permission: "Read-Employees_Admin", category: "النظام والإدارة" },
    { title: "المجموعات", description: "إدارة أدوار الصلاحيات", icon: ShieldCheck, color: "bg-slate-400", path: "/admin/groups", permission: "Read-Groups_Admin", category: "النظام والإدارة" },
    { title: "الصفحة الرئيسية", description: "تحكم بمحتوى الموقع", icon: Layers, color: "bg-pink-500", path: "/admin/homepage", permission: "Update-HomePage_Admin", category: "النظام والإدارة" },
    { title: "قوائم منسدلة", description: "إدارة قوائم الاختيار", icon: Database, color: "bg-zinc-100", path: "/admin/select", permission: "Read-Employees_Admin", category: "النظام والإدارة" },
];


export default function Dashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const userName = localStorage.getItem("userName") || "الموظف";
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

const visibleCards = ALL_CARDS.filter((card) => {
    // إذا كانت صلاحيات الكارد مصفوفة، نتحقق إذا كان المستخدم يملك واحدة منها على الأقل
    if (Array.isArray(card.permission)) {
        return card.permission.some(p => permissions.includes(p));
    }
    // إذا كانت نصاً عادياً، نستخدم الطريقة القديمة
    return permissions.includes(card.permission);
});
    const groupedCards = visibleCards.reduce((acc: any, card) => {
        if (!acc[card.category]) acc[card.category] = [];
        acc[card.category].push(card);
        return acc;
    }, {});

    return (
        <div className="w-full pb-12 transition-all duration-300 bg-background text-foreground min-h-screen" dir="rtl">

            {/* Header - تم ضبطه ليكون شفافاً بذكاء في الدارك */}
            <header className="bg-card/70 backdrop-blur-xl border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm rounded-b-[2rem] mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                        <LayoutDashboard className="text-primary-foreground w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-foreground">لوحة القيادة</h1>
                        <p className="text-[10px] text-muted-foreground font-extrabold tracking-widest uppercase">
                            {userName} | مدير النظام
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate("/admin/profile")}
                        variant="outline"
                        className="rounded-xl border-border bg-transparent hover:bg-accent text-foreground font-bold transition-all h-10"
                    >
                        <UserCircle size={18} className="ml-2" />
                        <span className="hidden sm:inline">الملف الشخصي</span>
                    </Button>
<Link to="/">
  <button
    className="flex items-center gap-2 px-4 py-2 rounded-xl 
    text-red-500 bg-red-50 hover:bg-red-100 
    hover:text-red-600 transition-all duration-200 
    shadow-sm hover:shadow-md"
    title="خروج من لوحة التحكم"
  >
    {/* أيقونة خروج */}
    <LogOut className="w-4 h-4" />

    <span className="font-medium">خروج من لوحة التحكم</span>
  </button>
</Link>
                </div>
                
            </header>

            <main className="px-6 space-y-14">
                {visibleCards.length === 0 ? (
                    <div className="text-center py-32 bg-card/50 rounded-[3rem] border border-dashed border-border">
                        <ShieldCheck className="mx-auto w-16 h-16 text-muted mb-4 opacity-20" />
                        <h2 className="text-xl font-black text-muted-foreground">لا توجد صلاحيات متاحة</h2>
                    </div>
                ) : (
                    Object.entries(groupedCards).map(([category, cards]: any) => (
                        <div key={category} className="space-y-8">
                            {/* Category Label */}
                            <div className="flex items-center gap-6">
                                <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                                    {category}
                                </h2>
                                <div className="h-[1px] bg-gradient-to-l from-border to-transparent w-full"></div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {cards.map((card: any) => {
                                    const Icon = card.icon;
                                    return (
                                        <button
                                            key={card.path}
                                            onClick={() => navigate(card.path)}
                                            className="group relative bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-[2.5rem] p-7 text-right transition-all duration-500
               /* الهوفر الفخم: ظل نيلي خفيف جداً يبرز الكرت */
               hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.12)]
               hover:border-primary/30
               hover:-translate-y-2
               active:scale-95
               overflow-hidden"
                                        >
                                            {/* تأثير ضوئي عند الزاوية يظهر بنعومة في الهوفر */}
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>

                                            {/* أيقونة الكرت */}
                                            <div className={`w-14 h-14 ${card.color} rounded-[1.3rem] flex items-center justify-center mb-6 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-[8deg] group-hover:shadow-lg group-hover:shadow-primary/10`}>
                                                <Icon className="w-7 h-7" />
                                            </div>

                                            {/* النصوص */}
                                            <h3 className="font-black text-foreground text-md mb-2 group-hover:text-primary transition-colors duration-300">
                                                {card.title}
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                                {card.description}
                                            </p>

                                            {/* لمسة أخيرة: سهم صغير يظهر عند الهوفر */}
                                            <div className="absolute bottom-6 left-6 opacity-0 translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary text-[10px]">←</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}