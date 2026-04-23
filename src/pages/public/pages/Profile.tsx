import { useEffect, useState, useCallback, useMemo } from "react";

// ─── Global animation styles ──────────────────────────────────────────────────
const animationStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
    .ag-theme-quartz {
    direction: rtl;
}
    .rtl-flex {
    display: flex;
    flex-direction: row-reverse;
}
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spinnerPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
    40%            { transform: translateY(-10px); opacity: 1; }
  }
  .anim-fade-up   { animation: fadeUp   0.55s cubic-bezier(.22,1,.36,1) both; }
  .anim-fade-in   { animation: fadeIn   0.45s ease both; }
  .anim-scale-in  { animation: scaleIn  0.5s  cubic-bezier(.22,1,.36,1) both; }
  .anim-slide-r   { animation: slideRight 0.5s cubic-bezier(.22,1,.36,1) both; }
  .delay-100 { animation-delay: 0.10s; }
  .delay-150 { animation-delay: 0.15s; }
  .delay-200 { animation-delay: 0.20s; }
  .delay-250 { animation-delay: 0.25s; }
  .delay-300 { animation-delay: 0.30s; }
  .delay-400 { animation-delay: 0.40s; }
  .delay-500 { animation-delay: 0.50s; }
  .delay-600 { animation-delay: 0.60s; }
  .shimmer-row {
    background: linear-gradient(90deg, #fef2f2 25%, #fecaca 50%, #fef2f2 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 0.5rem;
    height: 14px;
  }
`;

if (typeof document !== "undefined") {
    const existing = document.getElementById("profile-anim-styles");
    if (!existing) {
        const tag = document.createElement("style");
        tag.id = "profile-anim-styles";
        tag.textContent = animationStyles;
        document.head.appendChild(tag);
    }
}

import axios from "axios";
import {
    User, ShieldCheck, CreditCard, Phone, MapPin, Briefcase,
    Calendar, Hash, Loader2, UserCheck,
    AlertTriangle, BookMarked, Receipt, RefreshCw, History,
    LayoutGrid, AlertCircle
} from "lucide-react";
import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import { Badge } from "@/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridOptions } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withParams({
    fontFamily: "inherit",
    fontSize: 14,
    headerFontSize: 13,
    headerFontWeight: 700,
    headerTextColor: "#991b1b",
    headerBackgroundColor: "#fef2f2",
    backgroundColor: "#ffffff",
    foregroundColor: "#1e293b",
    rowHoverColor: "#fef2f2",
    borderColor: "#be2525",
    oddRowBackgroundColor: "#fff7f7",
    cellHorizontalPaddingScale: 1.2,
    wrapperBorderRadius: "1.25rem",
    rowBorder: true,
    columnBorder: false,
});


interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

interface CurrentBorrow {
    memberIdNumber: string;
    memberName: string;
    bookTitle: string;
    serialNumber: string;
    startDate: string | null;
    expectedReturnDate: string | null;
}

interface BorrowHistory {
    memberIdNumber: string;
    memberName: string;
    bookTitle: string;
    serialNumber: string;
    startDate: string | null;
    endDate: string | null;
    employeeName: string | null;
}

interface Subscription {
    memberIdNumber: string;
    memberName: string;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    subscriptionDurationDays: number;
    amount: number;
    paymentMethod: string | null;
    employeeName: string | null;
}

interface Fine {
    memberIdNumber: string;
    memberName: string;
    fineTypeName: string;
    date: string;
    amount: number;
    bookTitle: string | null;
    employeeName: string | null;
}

// ─── AG Grid shared config ────────────────────────────────────────────────────

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: true,
    resizable: false,
    suppressMovable: true,
    cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "right",
    },
};
const baseGridOptions: GridOptions = {
    enableRtl: true,
    domLayout: "autoHeight",
    rowHeight: 52,
    headerHeight: 44,
    suppressCellFocus: true,
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({
                        currentPage,
                        totalPages,
                        totalCount,
                        pageSize,
                        onPageChange,
                    }: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}) => {
    if (totalPages <= 1) return null;
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex items-center justify-between px-1 pt-4 border-t border-red-100 anim-fade-in">
            <span className="text-xs text-red-400 font-bold">
                عرض {from}–{to} من {totalCount}
            </span>
            <div className="flex items-center gap-1.5" dir="ltr">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                    ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all duration-200 hover:scale-105 active:scale-95 ${
                            p === currentPage
                                ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                                : "border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                        }`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                    ›
                </button>
            </div>
        </div>
    );
};


const TableCard = ({
                       icon,
                       title,
                       count,
                       accentClass = "bg-red-50 text-red-600",
                       loading,
                       children,
                   }: {
    icon: React.ReactNode;
    title: string;
    count?: number;
    accentClass?: string;
    loading: boolean;
    children: React.ReactNode;
}) => (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-red-100 overflow-hidden anim-fade-up">
        <div className="px-8 pt-7 pb-5 flex items-center gap-3 border-b border-red-100">
            <div className={`w-10 h-10 ${accentClass} rounded-xl flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <h2 className="text-lg font-black text-slate-800">{title}</h2>
                {count !== undefined && (
                    <p className="text-xs text-red-400 font-semibold mt-0.5">الإجمالي: {count}</p>
                )}
            </div>
        </div>
        <div className="p-6">
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
            ) : children}
        </div>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
        <AlertCircle size={38} strokeWidth={1.5} className="text-red-300" />
        <p className="font-bold text-sm text-red-400">لا توجد بيانات للعرض</p>
    </div>
);


const CurrentBorrowsTab = () => {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<PaginatedResponse<CurrentBorrow> | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/PersonalReport/current-borrows", {
                headers: { Authorization: `Bearer ${token}` },
                params: { pageNumber: p, pageSize: 10 },
            });
            setResult(res.data);
        } catch {
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل الإعارات الحالية." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchData(page); }, [page, fetchData]);

    const colDefs = useMemo<ColDef<CurrentBorrow>[]>(() => [
        {
            headerName: "عنوان الكتاب",
            field: "bookTitle",
            flex: 2,
            cellStyle: { fontWeight: "700", color: "#1e293b", textAlign: "right" },
        },
        {
            headerName: "الرقم التسلسلي",
            field: "serialNumber",
            cellStyle: { fontFamily: "monospace", color: "#1e293b", fontWeight: "700", textAlign: "right" },
        },
        {
            headerName: "تاريخ الاستعارة",
            field: "startDate",
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
        {
            headerName: "تاريخ الإرجاع المتوقع",
            field: "expectedReturnDate",
            flex: 1.5,
            cellRenderer: (p: any) => {
                if (!p.value) return <span className="text-slate-400">—</span>;
                const overdue = new Date(p.value) < new Date();
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${overdue ? "bg-red-100 text-red-600" : "bg-red-50 text-red-500"}`}>
                        {p.value}
                    </span>
                );
            },
        },
    ], []);

    return (
        <TableCard icon={<BookMarked size={20} />} title="الإعارات الحالية" count={result?.totalCount} loading={loading}>
            {result?.data.length === 0 ? <EmptyState /> : (
                <>
                    <div className="w-full" dir="rtl">
                        <AgGridReact
                            {...baseGridOptions}
                            theme={gridTheme}
                            rowData={result?.data ?? []}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                        />
                    </div>
                    {result && (
                        <Pagination
                            currentPage={result.pageNumber}
                            totalPages={result.totalPages}
                            totalCount={result.totalCount}
                            pageSize={result.pageSize}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </TableCard>
    );
};


const BorrowHistoryTab = () => {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<PaginatedResponse<BorrowHistory> | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/PersonalReport/borrow-history", {
                headers: { Authorization: `Bearer ${token}` },
                params: { pageNumber: p, pageSize: 10 },
            });
            setResult(res.data);
        } catch {
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل سجل الإعارات." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchData(page); }, [page, fetchData]);

    const colDefs = useMemo<ColDef<BorrowHistory>[]>(() => [
        {
            headerName: "عنوان الكتاب",
            field: "bookTitle",
            flex: 2,
            cellStyle: { fontWeight: "700", color: "#1e293b", textAlign: "right" },
        },
        {
            headerName: "الرقم التسلسلي",
            field: "serialNumber",
            cellStyle: { fontFamily: "monospace", color: "#dc2626", fontWeight: "700", textAlign: "right" },
        },
        {
            headerName: "تاريخ الاستعارة",
            field: "startDate",
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
        {
            headerName: "تاريخ الإرجاع",
            field: "endDate",
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
        {
            headerName: "الموظف",
            field: "employeeName",
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
    ], []);

    return (
        <TableCard icon={<History size={20} />} title="سجل الإعارات" count={result?.totalCount} loading={loading}>
            {result?.data.length === 0 ? <EmptyState /> : (
                <>
                    <div className="w-full" dir="rtl">
                        <AgGridReact
                            {...baseGridOptions}
                            theme={gridTheme}
                            rowData={result?.data ?? []}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                        />
                    </div>
                    {result && (
                        <Pagination
                            currentPage={result.pageNumber}
                            totalPages={result.totalPages}
                            totalCount={result.totalCount}
                            pageSize={result.pageSize}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </TableCard>
    );
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

const SubscriptionsTab = () => {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<PaginatedResponse<Subscription> | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/PersonalReport/subscriptions", {
                headers: { Authorization: `Bearer ${token}` },
                params: { pageNumber: p, pageSize: 10 },
            });
            setResult(res.data);
        } catch {
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل سجل الاشتراكات." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchData(page); }, [page, fetchData]);

    const colDefs = useMemo<ColDef<Subscription>[]>(() => [
        {
            headerName: "تاريخ البداية",
            field: "subscriptionStartDate",
            cellStyle: { color: "#1e293b", fontWeight: "600", textAlign: "right" },
        },
        {
            headerName: "تاريخ الانتهاء",
            field: "subscriptionEndDate",
            cellStyle: { color: "#1e293b", fontWeight: "600", textAlign: "right" },
        },
        {
            headerName: "المدة",
            field: "subscriptionDurationDays",
            cellRenderer: (p: any) => (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black">
                    {p.value} يوم
                </span>
            ),
        },
        {
            headerName: "المبلغ",
            field: "amount",
            cellRenderer: (p: any) => (
                <span className="font-black text-red-700">{p.value} ₪</span>
            ),
        },
        {
            headerName: "طريقة الدفع",
            field: "paymentMethod",
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
        {
            headerName: "الموظف",
            field: "employeeName",
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
    ], []);

    return (
        <TableCard icon={<RefreshCw size={20}  />} title="سجل الاشتراكات" count={result?.totalCount} loading={loading}>
            {result?.data.length === 0 ? <EmptyState /> : (
                <>
                    <div className="w-full" dir="rtl">
                        <AgGridReact
                            {...baseGridOptions}
                            theme={gridTheme}
                            rowData={result?.data ?? []}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                        />
                    </div>
                    {result && (
                        <Pagination
                            currentPage={result.pageNumber}
                            totalPages={result.totalPages}
                            totalCount={result.totalCount}
                            pageSize={result.pageSize}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </TableCard>
    );
};

// ─── Fines ────────────────────────────────────────────────────────────────────

const FinesTab = () => {
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<PaginatedResponse<Fine> | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/PersonalReport/fines", {
                headers: { Authorization: `Bearer ${token}` },
                params: { pageNumber: p, pageSize: 10 },
            });
            setResult(res.data);
        } catch {
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل سجل المخالفات." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchData(page); }, [page, fetchData]);

    const colDefs = useMemo<ColDef<Fine>[]>(() => [
        {
            headerName: "نوع المخالفة",
            field: "fineTypeName",
            flex: 1.5,
            cellRenderer: (p: any) => (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">
                    {p.value}
                </span>
            ),
        },
        {
            headerName: "الكتاب",
            field: "bookTitle",
            flex: 1.5,
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", fontWeight: "600", textAlign: "right" },
        },
        {
            headerName: "التاريخ",
            field: "date",
            valueFormatter: (p) => new Date(p.value).toLocaleDateString("en-CA"),
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
        {
            headerName: "المبلغ",
            field: "amount",
            cellRenderer: (p: any) => (
                <span className="font-black text-red-700">{p.value} ₪</span>
            ),
        },
        {
            headerName: "الموظف",
            field: "employeeName",
            valueFormatter: (p) => p.value ?? "—",
            cellStyle: { color: "#1e293b", textAlign: "right" },
        },
    ], []);

    return (
        <TableCard icon={<Receipt size={20} />} title="سجل المخالفات" count={result?.totalCount} accentClass="bg-red-100 text-red-700" loading={loading}>
            {result?.data.length === 0 ? <EmptyState /> : (
                <>
                    <div className="w-full" dir="rtl">
                        <AgGridReact
                            {...baseGridOptions}
                            theme={gridTheme}
                            rowData={result?.data ?? []}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                        />
                    </div>
                    {result && (
                        <Pagination
                            currentPage={result.pageNumber}
                            totalPages={result.totalPages}
                            totalCount={result.totalCount}
                            pageSize={result.pageSize}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </TableCard>
    );
};


const Profile = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/Subscription/member-profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch {
                toast({ variant: "destructive", title: "خطأ في التحميل", description: "فشل جلب البيانات." });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [toast]);

    if (loading) return (
        <div className="min-h-screen flex flex-col bg-[#FEF2F2]">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-red-100 shadow-sm anim-fade-in">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8 w-full">
                            <div className="w-28 h-28 rounded-[2rem] shrink-0 shimmer-row" style={{ height: "7rem", width: "7rem", borderRadius: "1.5rem" }} />
                            <div className="space-y-3 flex-1">
                                <div className="shimmer-row" style={{ width: "14rem", height: "1.5rem" }} />
                                <div className="shimmer-row" style={{ width: "10rem", height: "1rem" }} />
                                <div className="shimmer-row" style={{ width: "18rem", height: "1rem" }} />
                            </div>
                        </div>
                        <div className="shimmer-row shrink-0" style={{ width: "15rem", height: "7rem", borderRadius: "1.5rem" }} />
                    </div>
                </div>
                <div className="shimmer-row anim-fade-in delay-100" style={{ height: "3.5rem", borderRadius: "1rem" }} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 anim-fade-up delay-200">
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-red-100 shadow-sm space-y-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="shimmer-row shrink-0" style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem" }} />
                                <div className="space-y-2 flex-1">
                                    <div className="shimmer-row" style={{ width: "5rem", height: "0.75rem" }} />
                                    <div className="shimmer-row" style={{ width: "12rem", height: "1rem" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-red-100 shadow-sm space-y-4">
                        <div className="shimmer-row" style={{ width: "8rem", height: "1.25rem" }} />
                        <div className="shimmer-row" style={{ width: "100%", height: "6rem", borderRadius: "1.5rem" }} />
                        <div className="shimmer-row" style={{ width: "100%", height: "2.5rem", borderRadius: "1rem" }} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );

    if (!data) return null;

    const { memberInfo, guarantorInfo, subscriptionInfo } = data;
    const isExpired = new Date(subscriptionInfo.endDate) < new Date();
    const fullName = `${memberInfo.firstName} ${memberInfo.fatherName} ${memberInfo.grandfatherName} ${memberInfo.familyName}`;

    return (
<div className="home-theme min-h-screen bg-[#FEF2F2] flex flex-col" dir="rtl">
                <Header />

            <main className="flex-1 container mx-auto px-4 py-8">

                {/* Hero */}
                <div className="bg-white rounded-[2.5rem] p-8 mb-8 shadow-sm border border-red-100 relative overflow-hidden anim-fade-up">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -translate-y-20 translate-x-20 blur-3xl" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right anim-slide-r delay-150">
                            <div className="relative group anim-scale-in delay-200">
                                <div className={`w-28 h-28 ${isExpired ? "bg-red-600" : "bg-red-600"} rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:rotate-3`}>
                                    <User size={56} />
                                </div>
                                <div className={`absolute -bottom-2 -right-2 ${isExpired ? "bg-red-700" : "bg-red-500"} border-4 border-white text-white p-2 rounded-2xl shadow-md`}>
                                    {isExpired ? <AlertTriangle size={18} /> : <UserCheck size={18} />}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{fullName}</h1>
                                    <Badge className={`${isExpired ? "bg-red-100 text-red-700" : "bg-red-50 text-red-600"} border-none px-4 py-1 rounded-full font-black text-xs`}>
                                        {subscriptionInfo.memberClassification}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 font-bold text-sm">
                                    <span className="flex items-center gap-2"><Hash size={18} className="text-red-400" /> {memberInfo.memberNumber}</span>
                                    <span className="flex items-center gap-2"><Briefcase size={18} className="text-red-400" /> {memberInfo.job}</span>
                                    <span className="flex items-center gap-2"><MapPin size={18} className="text-red-400" /> {memberInfo.city}</span>
                                </div>
                            </div>
                        </div>

                                          <div className={`${isExpired ? "bg-rose-600" : "bg-slate-900"} text-white p-6 rounded-[2rem] min-w-[240px] shadow-xl relative overflow-hidden group transition-colors duration-500 anim-fade-up delay-300`}>
                            <div className="absolute bottom-0 right-0 opacity-10 group-hover:scale-110 transition-transform">
                                <CreditCard size={100} />
                            </div>
                            <p className="text-[10px] font-black text-white/60 uppercase mb-2 tracking-widest">تاريخ انتهاء الاشتراك</p>
                            <p className="text-2xl font-black mb-2 tracking-tighter italic">{subscriptionInfo.endDate}</p>
                            <div className={`flex items-center gap-2 ${isExpired ? "text-rose-100" : "text-emerald-400"} text-xs font-bold`}>
                                <div className={`w-2.5 h-2.5 ${isExpired ? "bg-rose-200 animate-ping" : "bg-emerald-400 animate-pulse"} rounded-full`} />
                                {isExpired ? "الاشتراك منتهي - يرجى المراجعة" : "اشتراك نشط"}
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-8 anim-fade-up delay-400">
                    <TabsList className="bg-white p-1 rounded-2xl h-14 border border-red-100 shadow-sm flex w-full overflow-x-auto gap-1">
                       <TabsTrigger value="fines" className="flex-1 rounded-xl font-bold gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">
                            <Receipt size={18} /> سجل مخالفات
                        </TabsTrigger> 
                        <TabsTrigger value="current-borrows" className="flex-1 rounded-xl font-bold gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">
                            <BookMarked size={18} /> إعارات حالية
                        </TabsTrigger>
                        <TabsTrigger value="subscriptions" className="flex-1 rounded-xl font-bold gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">
                            <RefreshCw size={18} /> سجل اشتراكات
                        </TabsTrigger>
                        <TabsTrigger value="borrow-history" className="flex-1 rounded-xl font-bold gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">
                            <History size={18} /> سجل إعارات
                        </TabsTrigger>
                       
                         <TabsTrigger value="overview" className="flex-1 rounded-xl font-bold gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">
                            <LayoutGrid size={18} /> نظرة عامة
                        </TabsTrigger>
                    </TabsList>

                    {/* نظرة عامة */}
                    <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              <div className="lg:col-span-2 lg:order-1 order-2 space-y-8">
                                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-100 anim-fade-up delay-100">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><UserCheck size={20} /></div>
                                        <h2 className="text-xl font-black text-slate-800">البيانات الشخصية</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <InfoItem icon={<User />} label="الاسم الكامل" value={fullName} />
                                        <InfoItem icon={<User />} label="الاسم بالإنجليزية" value={`${memberInfo.firstNameEn} ${memberInfo.familyNameEn}`} />
                                        <InfoItem icon={<Hash />} label="رقم الهوية" value={memberInfo.idnumber} />
                                        <InfoItem icon={<Calendar />} label="تاريخ الولادة" value={memberInfo.birthDate} />
                                        <InfoItem icon={<Phone />} label="رقم التواصل" value={memberInfo.phoneNumbers[0]} />
                                        <InfoItem icon={<MapPin />} label="العنوان السكني" value={`${memberInfo.city} - ${memberInfo.neighborhood} - ${memberInfo.street}`} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-100 anim-fade-up delay-200">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><ShieldCheck size={20} /></div>
                                        <h2 className="text-xl font-black text-slate-800">بيانات الكفيل الضامن</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <InfoItem icon={<User />} label="اسم الكفيل" value={`${guarantorInfo.firstName} ${guarantorInfo.fatherName} ${guarantorInfo.grandfatherName || ""} ${guarantorInfo.familyName}`} />
                                        <InfoItem icon={<Hash />} label="هوية الكفيل" value={guarantorInfo.idnumber} />
                                        <InfoItem icon={<Briefcase />} label="مهنة الكفيل" value={guarantorInfo.job} />
                                        <InfoItem icon={<Phone />} label="هاتف الكفيل" value={guarantorInfo.phoneNumbers[0]} />
                                        <div className="md:col-span-2">
                                            <InfoItem icon={<MapPin />} label="عنوان الكفيل" value={`${guarantorInfo.neighborhood || ""} - ${guarantorInfo.street || ""}${guarantorInfo.village ? ` - ${guarantorInfo.village}` : ""}`} />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside>
                                <div className="bg-white rounded-[2.5rem] shadow-xl border border-red-100 overflow-hidden sticky top-24 anim-fade-up delay-300">
                                    <div className="p-8">
                                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                            <CreditCard className={isExpired ? "text-red-600" : "text-red-600"} /> حالة الاشتراك
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm py-2 border-b border-red-50 text-slate-500">
                                                <span>نوع الاشتراك:</span>
                                                <span className="font-bold text-slate-800">{subscriptionInfo.subscriptionType}</span>
                                            </div>
                                            <div className={`py-8 ${isExpired ? "bg-red-50 border-red-200" : "bg-red-50 border-red-200"} rounded-[2rem] text-center border mt-4`}>
                                                <p className={`text-[10px] font-black ${isExpired ? "text-red-600" : "text-red-600"} uppercase mb-1 tracking-widest`}>سعر الاشتراك</p>
                                                <p className={`text-5xl font-black ${isExpired ? "text-red-700" : "text-red-700"}`}>{subscriptionInfo.amount} <span className="text-xl">₪</span></p>
                                            </div>
                                            {isExpired && (
                                                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex gap-2 items-center">
                                                    <AlertTriangle size={20} className="text-red-600 shrink-0" />
                                                    <p className="text-[11px] text-red-800 font-bold leading-tight">يرجى تجديد الاشتراك لاستعادة كامل صلاحيات المكتبة.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </TabsContent>

                    <TabsContent value="current-borrows" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CurrentBorrowsTab />
                    </TabsContent>
                    <TabsContent value="subscriptions" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SubscriptionsTab />
                    </TabsContent>
                    <TabsContent value="borrow-history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <BorrowHistoryTab />
                    </TabsContent>
                    <TabsContent value="fines" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <FinesTab />
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
};


const InfoItem = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-4 group transition-transform duration-200 hover:-translate-y-0.5">
        <div className="mt-1 p-2.5 bg-red-50 text-red-400 rounded-2xl group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-300 group-hover:shadow-sm">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-[15px] font-bold text-slate-800 group-hover:text-red-600 transition-colors duration-300">{value || "—"}</p>
        </div>
    </div>
);

export default Profile;