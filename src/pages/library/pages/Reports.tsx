import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  FileText, Search, Download, Printer, Filter, BarChart3,
  Layers, Archive, CalendarDays, ArrowUpDown, RefreshCw,
  Inbox, BookOpen, ChevronLeft, ChevronRight, PackageOpen,
  AlertCircle,
} from "lucide-react";
import { Button }                                   from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input }                                    from "@/ui/input";
import { Label }                                    from "@/ui/label";
import { Badge }                                    from "@/ui/badge";
import { Separator }                                from "@/ui/separator";
import { Skeleton }                                 from "@/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui/select";

ModuleRegistry.registerModules([AllCommunityModule]);

// ── Theme: inherit the host app's font & sizing, keep AG Grid's quartz look
const gridTheme = themeQuartz.withParams({
  fontFamily:                 "inherit",
  fontSize:                   13,
  rowHeight:                  44,
  headerHeight:               42,
  cellHorizontalPaddingScale: 1.2,
});


type ReportTab =
  | "material-type"
  | "entry-date"
  | "discarded"
  | "classification"
  | "supply-method";

interface FilterState {
  materialType:       string;
  fromDate:           string;
  toDate:             string;
  fromClassification: string;
  toClassification:   string;
  supplyMethod:       string;
}

interface BookRecord {
  serialNo:       number | string;
  title:          string;
  author:         string;
  classification: string;
  materialType:   string;
  status:         string;
  entryDate?:     string;
  supplierName?:  string;
  supplyMethod?:  string;
  removeReason?:  string;
  discardDate?:   string;
}



interface MaterialTypeItem { id: number; name: string }
interface SupplyMethodItem  { id: number; name: string }

// ═══════════════════════════════════════════════
// ── Auth + Data helpers
// ═══════════════════════════════════════════════

const PAGE_SIZE = 8;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

function mapRecord(b: any, idx: number): BookRecord {
  return {
    serialNo:       b.serialNo          ?? b.serialNumber    ?? b.bookId        ?? idx + 1,
    title:          b.title             ?? b.bookTitle        ?? "—",
    author:         b.author            ?? b.authors          ?? b.authorName    ?? "—",
    classification: b.classificationCode ?? b.classification  ?? b.classCode    ?? "—",
    materialType:   b.materialTypeName  ?? b.materialType     ?? b.bookType      ?? "—",
    status:         b.status            ?? b.bookStatus        ?? "—",
    entryDate:      b.entryDate         ?? b.supplyDate        ?? b.addDate      ?? undefined,
    supplierName:   b.supplierName      ?? b.supplier          ?? undefined,
    supplyMethod:   b.supplyMethodName  ?? b.supplyMethod      ?? undefined,
    removeReason:   b.removeReason      ?? b.removeReasonName  ?? b.discardReason ?? undefined,
    discardDate:    b.removalDate       ?? b.removeDate         ?? b.discardDate  ?? undefined,
  };
}

function extractData(res: any): {
  records: BookRecord[];
  total: number;
  totalPages: number;
} {
  const raw: any[] = res.data ?? [];
  const records = raw.map(mapRecord);

  const total = res.totalCount ?? 0;
  const pageSize = res.pageSize ?? raw.length;

  // ✅ الحساب الصحيح من الباك
  const totalPages = Math.ceil(total / pageSize);

  return { records, total, totalPages };
}

const REPORT_TABS: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
  { id: "classification", label: "تقرير حسب أرقام التصنيف",  icon: <ArrowUpDown  className="w-4 h-4" /> },
  { id: "supply-method",  label: "تقرير حسب طريقة التزويد",  icon: <RefreshCw    className="w-4 h-4" /> },
  { id: "material-type",  label: "تقرير حسب نوع المادة",     icon: <Layers       className="w-4 h-4" /> },
  { id: "entry-date",     label: "تقرير حسب تاريخ الإدخال",  icon: <CalendarDays className="w-4 h-4" /> },
  { id: "discarded",      label: "تقرير حسب الكتب المخرجة",  icon: <Archive      className="w-4 h-4" /> },
];

const DEFAULT_FILTERS: FilterState = {
  materialType: "الكل", fromDate: "", toDate: "",
  fromClassification: "", toClassification: "", supplyMethod: "الكل",
};

const COPYRIGHT_FOOTER = `© ${new Date().getFullYear()} جميع حقوق الملكية والفكرية محفوظة وفقاً لمذكرة التفاهم الموقعة بين جامعة فلسطين التقنية - خضوري وبلدية طولكرم`;

const getArabicStatus = (status: string) => {
  const map: Record<string, string> = {
    "Available": "متاح",
    "Borrowed": "معار",
    "Reserved": "محجوز",
    "Removed": "مخرج",
  };

  return map[status] ?? status;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    "متاح":     "bg-green-100  text-green-800  border-green-200  dark:bg-green-900/30  dark:text-green-400",
    "Available":"bg-green-100  text-green-800  border-green-200  dark:bg-green-900/30  dark:text-green-400",
    "معار":     "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
    "Borrowed": "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
    "محجوز":    "bg-blue-100   text-blue-800   border-blue-200   dark:bg-blue-900/30   dark:text-blue-400",
    "Reserved": "bg-blue-100   text-blue-800   border-blue-200   dark:bg-blue-900/30   dark:text-blue-400",
    "مخرج":     "bg-red-100    text-red-800    border-red-200    dark:bg-red-900/30    dark:text-red-400",
    "Removed":  "bg-red-100    text-red-800    border-red-200    dark:bg-red-900/30    dark:text-red-400",
    "تالف":     "bg-red-100    text-red-800    border-red-200    dark:bg-red-900/30    dark:text-red-400",
    "مفقود":    "bg-gray-100   text-gray-600   border-gray-300   dark:bg-gray-800      dark:text-gray-400",
  };
  const arabicLabels: Record<string, string> = {
    Available: "متاح", Borrowed: "معار", Reserved: "محجوز", Removed: "مخرج",
  };
  const label = arabicLabels[status] ?? status;
  return (
    <Badge variant="outline" className={`${map[status] ?? "bg-muted text-muted-foreground"} font-medium text-xs px-2.5 py-0.5`}>
      {label}
    </Badge>
  );
};

const SupplyMethodBadge = ({ method }: { method: string }) => {
  const map: Record<string, string> = {
    "شراء":  "bg-blue-100    text-blue-800    border-blue-200    dark:bg-blue-900/30    dark:text-blue-400",
    "إهداء": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    "تبادل": "bg-purple-100  text-purple-800  border-purple-200  dark:bg-purple-900/30  dark:text-purple-400",
  };
  return (
    <Badge variant="outline" className={`${map[method] ?? "bg-muted text-muted-foreground"} font-medium text-xs px-2.5 py-0.5`}>
      {method || "—"}
    </Badge>
  );
};

const MaterialTypeBadge = ({ type }: { type: string }) => {
  const colors = [
    "bg-sky-100    text-sky-800    border-sky-200    dark:bg-sky-900/30    dark:text-sky-400",
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400",
    "bg-pink-100   text-pink-800   border-pink-200   dark:bg-pink-900/30   dark:text-pink-400",
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
    "bg-cyan-100   text-cyan-800   border-cyan-200   dark:bg-cyan-900/30   dark:text-cyan-400",
    "bg-lime-100   text-lime-800   border-lime-200   dark:bg-lime-900/30   dark:text-lime-400",
    "bg-rose-100   text-rose-800   border-rose-200   dark:bg-rose-900/30   dark:text-rose-400",
  ];
  const idx = type ? type.charCodeAt(0) % colors.length : 0;
  return (
    <Badge variant="outline" className={`${colors[idx]} font-medium text-xs px-2.5 py-0.5`}>
      {type || "—"}
    </Badge>
  );
};

const DiscardReasonBadge = ({ reason }: { reason: string }) => {
  const map: Record<string, string> = {
    "تالف":     "bg-red-100    text-red-800    border-red-200    dark:bg-red-900/30    dark:text-red-400",
    "مفقود":    "bg-gray-100   text-gray-600   border-gray-300   dark:bg-gray-800      dark:text-gray-400",
    "قديم":     "bg-amber-100  text-amber-800  border-amber-200  dark:bg-amber-900/30  dark:text-amber-400",
    "مكرر":     "bg-blue-100   text-blue-800   border-blue-200   dark:bg-blue-900/30   dark:text-blue-400",
    "غير صالح": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return (
    <Badge variant="outline" className={`${map[reason] ?? "bg-muted text-muted-foreground"} font-medium text-xs px-2.5 py-0.5`}>
      {reason || "—"}
    </Badge>
  );
};

const StatusCellRenderer       = (p: ICellRendererParams) => <StatusBadge       status={p.value ?? ""} />;
const MaterialTypeCellRenderer = (p: ICellRendererParams) => <MaterialTypeBadge type={p.value   ?? ""} />;
const SupplyMethodCellRenderer = (p: ICellRendererParams) => <SupplyMethodBadge method={p.value ?? ""} />;
const DiscardReasonCellRenderer= (p: ICellRendererParams) => <DiscardReasonBadge reason={p.value ?? ""}/>;



const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
    <Inbox className="w-16 h-16 mb-4 opacity-30" />
    <p className="text-lg font-medium">لا توجد نتائج</p>
    <p className="text-sm mt-1">يرجى تعديل معايير البحث والمحاولة مرة أخرى</p>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-destructive">
    <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
    <p className="text-lg font-medium">حدث خطأ أثناء جلب البيانات</p>
    <p className="text-sm mt-1 text-muted-foreground">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 ml-1" /> إعادة المحاولة
      </Button>
    )}
  </div>
);



const ReportPagination = ({
  currentPage, totalPages, onPageChange,
}: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  
  // عرض الأزرار من 1 إلى totalPages فقط (بدون أرقام إضافية)
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
    return currentPage - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-4" dir="ltr">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      {pages[0] > 1 && (
        <>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)}>1</Button>
          {pages[0] > 2 && <span className="px-1 text-muted-foreground text-sm">...</span>}
        </>
      )}
      
      {pages.map(p => (
        <Button 
          key={p} 
          variant={currentPage === p ? "default" : "outline"} 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-muted-foreground text-sm">...</span>}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}
      
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8" 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// ═══════════════════════════════════════════════
// ── Print helper
// ═══════════════════════════════════════════════

const buildPrintHTML = (title: string, headers: string[], rows: string[][], totalCount: number) => {
  const today = new Date();
  const date  = today.toLocaleDateString("ar-EG");
  const day   = today.toLocaleDateString("ar-EG", { weekday: "long" });
  return `<html dir="rtl"><head><meta charset="UTF-8"><title>${title}</title>
  <style>
    @page{size:A4;margin:0}
    body{margin:20mm;font-family:"Cairo",Arial,sans-serif;direction:rtl;color:#2c3e50}
    .header{text-align:center;margin-bottom:20px;position:relative}
    .top-info{position:absolute;top:0;right:0;text-align:right;font-size:13px;color:#555}
    .logos{display:flex;justify-content:center;align-items:center;gap:15px;margin-bottom:10px}
    .logos img{width:75px;height:75px;object-fit:contain}
    .divider{width:2px;height:55px;background-color:#999}
    .header-title h1{margin:0;font-size:26px;font-weight:bold}
    .header-title h2{margin:5px 0;font-size:17px;color:#555}
    .total{font-size:13px;color:#555;margin-top:5px}
    table{width:100%;border-collapse:collapse;margin-top:25px;font-size:13px}
    th{background-color:#000;color:white;padding:10px;font-weight:bold}
    td{padding:8px 10px;border:1px solid #ddd}
    tr:nth-child(even){background-color:#f9fafb}
    tr{page-break-inside:avoid}
    .footer{margin-top:40px;border-top:1px solid #ccc;padding-top:10px;font-size:12px;text-align:center;color:#777}
  </style></head><body>
<div class="header">
  <div class="top-info"><div>اليوم: ${day}</div><div>التاريخ: ${date}</div></div>
  <div class="logos"><img src="/Logo.webp"/><div class="divider"></div><img src="/logo2.webp"/></div>
  <div class="header-title">
    <h1>📚 مكتبة بلدية طولكرم</h1>
    <h2>${title}</h2>
    <div class="total">إجمالي النتائج: ${totalCount} سجل</div>
  </div>
</div>
<table>
  <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
  </thead>
  <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table>
<div class="footer">${COPYRIGHT_FOOTER}</div>
</body></html>`;
};



const Reports = () => {
  const [activeTab, setActiveTab]       = useState<ReportTab>("classification");
  const [isLoading, setIsLoading]       = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [error, setError]               = useState<string | null>(null);

  const [reportData, setReportData]     = useState<BookRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages]     = useState(0);

  const [materialTypes, setMaterialTypes]               = useState<MaterialTypeItem[]>([]);
  const [materialTypesLoading, setMaterialTypesLoading] = useState(false);

  const [supplyMethods, setSupplyMethods]               = useState<SupplyMethodItem[]>([]);
  const [supplyMethodsLoading, setSupplyMethodsLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    setMaterialTypesLoading(true);
    (async () => {
      try {
        const res  = await fetch("/api/MaterialType", { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const data: any[] = await res.json();
        setMaterialTypes(data.map(m => ({ id: m.materialTypeId ?? m.id, name: m.materialName ?? m.name })));
      } catch {
        setMaterialTypes([
          { id:1,name:"كتاب" },{ id:2,name:"مرجع" },{ id:3,name:"كتاب اطفال" },
          { id:4,name:"قصة" },{ id:5,name:"مجموعة" },{ id:6,name:"دورية" },
          { id:7,name:"رسالة جامعية" },{ id:8,name:"سمعيات بصريات" },
        ]);
      } finally { setMaterialTypesLoading(false); }
    })();
  }, []);

  // ── Supply Methods
  useEffect(() => {
    setSupplyMethodsLoading(true);
    (async () => {
      try {
      const res  = await fetch("/api/BookReport/supply", { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const data: any[] = await res.json();
        setSupplyMethods(data.map(s => ({ id: s.supplyMethodId ?? s.id, name: s.supplyMethodName ?? s.methodName ?? s.name })));
      } catch {
        setSupplyMethods([{ id:1,name:"شراء" },{ id:2,name:"إهداء" },{ id:3,name:"تبادل" }]);
      } finally { setSupplyMethodsLoading(false); }
    })();
  }, []);

  // ── Build URLSearchParams (shared by fetch / export / print)
  const buildParams = useCallback((page: number): URLSearchParams => {
    const p = new URLSearchParams({ page: String(page) });
    switch (activeTab) {
      case "material-type":
        if (filters.materialType && filters.materialType !== "الكل") p.set("materialType", filters.materialType);
        if (filters.fromDate) p.set("from", filters.fromDate + "T00:00:00Z");
        if (filters.toDate)   p.set("to",   filters.toDate   + "T23:59:59Z");
        break;
      case "entry-date":
        if (filters.fromDate) p.set("from", filters.fromDate + "T00:00:00Z");
        if (filters.toDate)   p.set("to",   filters.toDate   + "T23:59:59Z");
        break;
      case "discarded":
        if (filters.fromDate) p.set("from", filters.fromDate + "T00:00:00Z");
        if (filters.toDate)   p.set("to",   filters.toDate   + "T23:59:59Z");
        break;
      case "classification":
        if (filters.fromClassification) p.set("fromClassification", filters.fromClassification);
        if (filters.toClassification)   p.set("toClassification",   filters.toClassification);
        break;
      case "supply-method":
        if (filters.supplyMethod && filters.supplyMethod !== "الكل") p.set("supplyMethod", filters.supplyMethod);
        if (filters.fromDate) p.set("from", filters.fromDate + "T00:00:00Z");
        if (filters.toDate)   p.set("to",   filters.toDate   + "T23:59:59Z");
        break;
    }
    return p;
  }, [activeTab, filters]);

  const tabEndpoint = useCallback((params: URLSearchParams): string => ({
    "material-type":  `/api/BookReport/material-type?${params}`,
    "entry-date":     `/api/BookReport/entry-date?${params}`,
    "discarded":      `/api/BookReport/issued?${params}`,
    "classification": `/api/BookReport/classification?${params}`,
    "supply-method":  `/api/BookReport/supply?${params}`,
  }[activeTab]), [activeTab]);

  // ── MAIN FETCH (محسّن)
  const fetchReport = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(tabEndpoint(buildParams(page)), { headers: authHeaders() });
      if (res.status === 401) {
        setError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");
        setReportData([]); setTotalRecords(0); setTotalPages(0);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      const { records, total, totalPages: pages } = extractData(json);
      setReportData(records);
      setTotalRecords(total);
      setTotalPages(pages);
    } catch (err) {
      setError((err as Error).message);
      setReportData([]); setTotalRecords(0); setTotalPages(0);
    } finally { setIsLoading(false); }
  }, [tabEndpoint, buildParams]);

  const handleSearch     = useCallback(() => { setHasSearched(true); setCurrentPage(1); fetchReport(1); }, [fetchReport]);
  const handlePageChange = useCallback((p: number) => { setCurrentPage(p); fetchReport(p); }, [fetchReport]);
  const handleTabChange  = useCallback((tab: ReportTab) => {
    setActiveTab(tab);
    setHasSearched(false); setCurrentPage(1);
    setReportData([]); setTotalRecords(0); setTotalPages(0);
    setError(null); setFilters(DEFAULT_FILTERS);
  }, []);

const handleExport = useCallback(async () => {
  try {
    const typeMap: Record<ReportTab, string> = {
      "material-type": "material",
      "entry-date": "entry",
      "discarded": "issued",
      "classification": "classification",
      "supply-method": "supply",
    };

    const params = buildParams(1);
    params.set("type", typeMap[activeTab]);

    const res = await fetch(`/api/BookReportExport/export?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const disposition = res.headers.get("Content-Disposition");

    let filename = "تقرير.xlsx";

    if (disposition) {
      const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);

      if (utf8Match?.[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else {
        const normalMatch = disposition.match(/filename\s*=\s*"?([^"]+)"?/i);
        if (normalMatch?.[1]) {
          filename = normalMatch[1];
        }
      }
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (err) {
    alert(`فشل التصدير: ${(err as Error).message}`);
  }
}, [activeTab, buildParams]);

  // ── Print (fetch all pages then open print window)
  const handlePrint = useCallback(async () => {
    try {
      const tabLabel = REPORT_TABS.find(t => t.id === activeTab)?.label ?? "تقرير";
      let allData: BookRecord[] = [];
      let page = 1;
      let keepGoing = true;

      while (keepGoing) {
        const params = buildParams(page);
        const res    = await fetch(tabEndpoint(params), { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { records, total } = extractData(await res.json());
        allData = [...allData, ...records];
        if (page >= Math.ceil(total / PAGE_SIZE) || records.length === 0) keepGoing = false;
        else page++;
      }

      let headers: string[] = [];
      let rows:    string[][] = [];
      switch (activeTab) {
        case "classification":
        case "material-type":
          headers = ["رقم التسلسلي","عنوان الكتاب","المؤلف","رقم التصنيف","نوع المادة","الحالة"];
          rows = allData.map(b => [String(b.serialNo),b.title,b.author,b.classification,b.materialType,getArabicStatus(b.status)]);
          break;
        case "entry-date":
          headers = ["رقم التسلسلي","عنوان الكتاب","المؤلف","تاريخ الإدخال","رقم التصنيف","نوع المادة","الحالة"];
          rows = allData.map(b => [String(b.serialNo),b.title,b.author,b.entryDate??"",b.classification,b.materialType,getArabicStatus(b.status)]);
          break;
        case "supply-method":
          headers = ["رقم التسلسلي ","عنوان الكتاب","المؤلف","رقم التصنيف","اسم المزود","طريقة التزويد","تاريخ الإدخال","الحالة"];
          rows = allData.map(b => [String(b.serialNo),b.title,b.author,b.classification,b.supplierName??"",b.supplyMethod??"",b.entryDate??"",getArabicStatus(b.status)]);
          break;
        case "discarded":
          headers = ["رقم التسلسلي","عنوان الكتاب","المؤلف","رقم التصنيف","سبب الإخراج","تاريخ الإخراج"];
          rows = allData.map(b => [String(b.serialNo),b.title,b.author,b.classification,b.removeReason??"",b.discardDate??""]);
          break;
      }

      const html = buildPrintHTML(tabLabel, headers, rows, allData.length);
      const win  = window.open("", "", "width=1200,height=800");
      if (!win) return;
      win.document.write(html);
      win.document.close();
      const imgs = win.document.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map(img =>
        img.complete ? Promise.resolve()
          : new Promise<void>(resolve => { img.onload = img.onerror = () => resolve(); })
      ));
      win.focus(); win.print();
    } catch (err) { alert(`فشل الطباعة: ${(err as Error).message}`); }
  }, [activeTab, buildParams, tabEndpoint]);

  const columnDefs = useMemo<ColDef<BookRecord>[]>(() => {
    // ── Reusable column objects
    const serial: ColDef<BookRecord> = {
      headerName: "رقم التسلسلي", field: "serialNo", width: 180, sortable: false,
      cellClass: "font-mono text-xs text-muted-foreground",
    };
    const title: ColDef<BookRecord> = {
      headerName: "عنوان الكتاب", field: "title", flex: 2, minWidth: 100,
      cellClass: "font-medium text-sm",
    };
    const author: ColDef<BookRecord> = {
      headerName: "المؤلف", field: "author", flex: 1, minWidth: 130,
    };
    const classification: ColDef<BookRecord> = {
      headerName: "رقم التصنيف", field: "classification", width: 130,
      cellClass: "font-mono text-sm",
    };
    const materialType: ColDef<BookRecord> = {
      headerName: "نوع المادة", field: "materialType", width: 140,
      cellRenderer: MaterialTypeCellRenderer,
      cellStyle: { display: "flex", alignItems: "center" },
    };
    const status: ColDef<BookRecord> = {
      headerName: "حالة الكتاب", field: "status", width: 120,
      cellRenderer: StatusCellRenderer,
      cellStyle: { display: "flex", alignItems: "center" },
    };
    const entryDate: ColDef<BookRecord> = {
      headerName: "تاريخ الإدخال", field: "entryDate", width: 145,
      cellClass: "font-mono text-sm",
      valueFormatter: p => p.value ?? "—",
    };
    const supplierName: ColDef<BookRecord> = {
      headerName: "اسم المزود", field: "supplierName", flex: 1, minWidth: 120,
      valueFormatter: p => p.value ?? "—",
    };
    const supplyMethod: ColDef<BookRecord> = {
      headerName: "طريقة التزويد", field: "supplyMethod", width: 140,
      cellRenderer: SupplyMethodCellRenderer,
      cellStyle: { display: "flex", alignItems: "center" },
    };
    const removeReason: ColDef<BookRecord> = {
      headerName: "سبب الإخراج", field: "removeReason", width: 140,
      cellRenderer: DiscardReasonCellRenderer,
      cellStyle: { display: "flex", alignItems: "center" },
    };
    const discardDate: ColDef<BookRecord> = {
      headerName: "تاريخ الإخراج", field: "discardDate", width: 145,
      cellClass: "font-mono text-sm",
      valueFormatter: p => p.value ?? "—",
    };

    switch (activeTab) {
      case "material-type":
      case "classification":
        return [serial, title, author, classification, materialType, status];
      case "entry-date":
        return [serial, title, author, entryDate, classification, materialType, status];
      case "supply-method":
        return [serial, title, author, classification, supplierName, supplyMethod, entryDate, status];
      case "discarded":
        return [serial, title, author, classification, removeReason, discardDate];
      default:
        return [serial, title, author, classification, materialType, status];
    }
  }, [activeTab]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable:        true,
    resizable:       true,
    suppressMovable: false,
    filter: true,       
    headerClass:     "font-bold text-sm",
  }), []);


  const summaryStats = useMemo(() => ({
    available:   reportData.filter(b => b.status === "متاح"  || b.status === "Available").length,
    borrowed:    reportData.filter(b => b.status === "معار"  || b.status === "Borrowed" ).length,
    reserved:    reportData.filter(b => b.status === "محجوز" || b.status === "Reserved" ).length,
    unavailable: reportData.filter(b => ["تالف","مخرج","مفقود","Removed"].includes(b.status)).length,
  }), [reportData]);

  const todayFormatted = new Date().toLocaleDateString("ar-PS", { year:"numeric", month:"long", day:"numeric" });

  const renderFilterPanel = () => {
    const dateFields = (
      <>
        <div className="flex-1 w-full sm:w-auto">
          <Label className="mb-1.5 text-sm font-medium text-foreground/80">من تاريخ</Label>
          <Input type="date" value={filters.fromDate} max={new Date().toISOString().slice(0,10)}
            onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <Label className="mb-1.5 text-sm font-medium text-foreground/80">إلى تاريخ</Label>
          <Input type="date" value={filters.toDate} max={new Date().toISOString().slice(0,10)}
            onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))} />
        </div>
      </>
    );

    switch (activeTab) {
      case "material-type":
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Label className="mb-1.5 text-sm font-medium text-foreground/80">نوع المادة</Label>
              <Select value={filters.materialType} onValueChange={val => setFilters(f => ({ ...f, materialType: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={materialTypesLoading ? "جاري التحميل..." : "اختر نوع المادة"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">الكل</SelectItem>
                  {materialTypes.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {dateFields}
            <Button onClick={handleSearch} className="min-w-[120px]"><Search className="w-4 h-4 ml-1.5"/>بحث</Button>
          </div>
        );

      case "entry-date":
      case "discarded":
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            {dateFields}
            <Button onClick={handleSearch} className="min-w-[120px]"><Search className="w-4 h-4 ml-1.5"/>بحث</Button>
          </div>
        );

      case "classification":
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Label className="mb-1.5 text-sm font-medium text-foreground/80">من رقم التصنيف</Label>
              <Input type="text" placeholder="مثال: 000" value={filters.fromClassification}
                onChange={e => setFilters(f => ({ ...f, fromClassification: e.target.value }))} />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <Label className="mb-1.5 text-sm font-medium text-foreground/80">إلى رقم التصنيف</Label>
              <Input type="text" placeholder="مثال: 999" value={filters.toClassification}
                onChange={e => setFilters(f => ({ ...f, toClassification: e.target.value }))} />
            </div>
            <Button onClick={handleSearch} className="min-w-[120px]"><Search className="w-4 h-4 ml-1.5"/>بحث</Button>
          </div>
        );

      case "supply-method":
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Label className="mb-1.5 text-sm font-medium text-foreground/80">طريقة التزويد</Label>
              <Select value={filters.supplyMethod} onValueChange={val => setFilters(f => ({ ...f, supplyMethod: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={supplyMethodsLoading ? "جاري التحميل..." : "اختر طريقة التزويد"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">الكل</SelectItem>
                  {supplyMethods.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {dateFields}
            <Button onClick={handleSearch} className="min-w-[120px]"><Search className="w-4 h-4 ml-1.5"/>بحث</Button>
          </div>
        );

      default: return null;
    }
  };

  const renderGrid = () => {
    if (!hasSearched) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">اختر نوع التقرير واضغط على بحث</p>
          <p className="text-sm mt-1">سيتم عرض النتائج في الجدول بعد البحث</p>
        </div>
      );
    }
    if (error) return <ErrorState message={error} onRetry={() => fetchReport(currentPage)} />;
    if (!isLoading && reportData.length === 0) return <EmptyState />;

    return (
      <div>
        <div style={{ height: 420 }} className="w-full rounded-lg overflow-hidden border border-border">
          <AgGridReact<BookRecord>
            theme={gridTheme}
            rowData={isLoading ? [] : reportData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            enableRtl={true}
            loading={isLoading}
            animateRows={true}
            suppressPaginationPanel={true}
            suppressCellFocus={true}
            rowHeight={44}
            headerHeight={42}
            getRowStyle={params =>
              params.node.rowIndex != null && params.node.rowIndex % 2 !== 0
                ? { background: "hsl(var(--muted) / 0.3)" }
                : undefined
            }
          />
        </div>
        <ReportPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>
    );
  };

  return (
    <div dir="rtl" className="space-y-6">

      {/* ── Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <FileText className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">التقارير</h1>
          <p className="text-muted-foreground text-sm mt-0.5">إدارة وعرض تقارير المكتبة الشاملة</p>
        </div>
        <div className="mr-auto text-left hidden sm:block">
          <p className="text-xs text-muted-foreground">تاريخ التقرير</p>
          <p className="text-sm font-medium text-foreground">{todayFormatted}</p>
        </div>
      </div>

      {/* ── Tab Navigation */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">نوع التقرير</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {REPORT_TABS.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange(tab.id)}
                className={activeTab === tab.id ? "shadow-sm" : ""}
              >
                {tab.icon}
                <span className="hidden sm:inline mr-1.5">{tab.label}</span>
                <span className="sm:hidden mr-1.5 text-xs">{tab.label.split(" ").slice(0,2).join(" ")}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Filters + AG Grid */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-lg">
              <FileText className="w-5 h-5 text-primary" />
              {REPORT_TABS.find(t => t.id === activeTab)?.label}
            </CardTitle>
            {hasSearched && !isLoading && !error && totalRecords > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 ml-1" />تصدير
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 ml-1" />طباعة
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/40 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">معايير البحث</span>
            </div>
            {renderFilterPanel()}
          </div>

          <Separator />

          {renderGrid()}

          {hasSearched && !isLoading && !error && totalRecords > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-sm text-muted-foreground border-t border-border">
              <p>إجمالي السجلات: <span className="font-semibold text-foreground">{totalRecords.toLocaleString("ar-EG")}</span></p>
              <p>تاريخ التقرير: {todayFormatted}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Summary Stats */}
      {hasSearched && !isLoading && !error && reportData.length > 0 && activeTab !== "discarded" && (
        <Card className="shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-foreground text-lg">
              <PackageOpen className="w-5 h-5 text-primary" />
              ملخص الصفحة الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50  dark:bg-green-900/20  rounded-lg border border-green-200  dark:border-green-800">
                <p className="text-2xl font-bold text-green-700  dark:text-green-400">{summaryStats.available}</p>
                <p className="text-xs text-green-600   dark:text-green-500  mt-1">متاح</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{summaryStats.borrowed}</p>
                <p className="text-xs text-yellow-600  dark:text-yellow-500 mt-1">معار</p>
              </div>
              <div className="text-center p-3 bg-blue-50   dark:bg-blue-900/20   rounded-lg border border-blue-200   dark:border-blue-800">
                <p className="text-2xl font-bold text-blue-700   dark:text-blue-400">{summaryStats.reserved}</p>
                <p className="text-xs text-blue-600    dark:text-blue-500   mt-1">محجوز</p>
              </div>
              <div className="text-center p-3 bg-red-50    dark:bg-red-900/20    rounded-lg border border-red-200    dark:border-red-800">
                <p className="text-2xl font-bold text-red-700    dark:text-red-400">{summaryStats.unavailable}</p>
                <p className="text-xs text-red-600     dark:text-red-500    mt-1">غير متاح</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default Reports;