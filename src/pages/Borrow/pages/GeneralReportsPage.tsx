import { useState, useEffect, useCallback } from "react";
import AgGridTable from "@/pages/Borrow/components/library/AgGridTable";
import { toast } from "sonner";
import { BookOpen, Users, Clock, BarChart3, Loader2, Download } from "lucide-react";

type Tab = "loans" | "subscribers" | "late";

export default function GeneralReportsPage() {
  const [tab, setTab] = useState<Tab>("loans");
  const [loanData, setLoanData] = useState<any[]>([]);
  const [subData, setSubData] = useState<any[]>([]);
  const [lateData, setLateData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const getEndpoint = (activeTab: Tab) => {
    switch (activeTab) {
      case "loans": return "borrow";
      case "subscribers": return "members";
      case "late": return "late-borrows";
      default: return "borrow";
    }
  };

 const handleExportExcel = async () => {
    const currentData = tab === "loans" ? loanData : tab === "subscribers" ? subData : lateData;

    if (!currentData || currentData.length === 0) {
      toast.error("لا توجد بيانات لتصديرها حالياً");
      return;
    }

    setExportLoading(true);
    const token = localStorage.getItem("token");
    let exportType = tab === "loans" ? "borrows" : tab === "subscribers" ? "Members" : "Late";

    try {
      const response = await fetch(`/api/GeneralReportExport/export?Type=${exportType}`, {
        method: 'GET',
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // --- الجزء المستبدل لجلب الاسم من الباك إند بدعم العربي ---
      const disposition = response.headers.get("Content-Disposition");
      let fileName = `تقرير_${exportType}.xlsx`; // اسم احتياطي في حال فشل الجلب

      if (disposition) {
        // البحث عن الاسم المشفر UTF-8 (يدعم العربي)
        const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
        if (utf8Match?.[1]) {
          fileName = decodeURIComponent(utf8Match[1]);
        } else {
          const normalMatch = disposition.match(/filename\s*=\s*"?([^";]+)"?/i);
          if (normalMatch?.[1]) {
            fileName = normalMatch[1];
          }
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      a.download = fileName; 
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("تم تصدير ملف Excel بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تصدير الملف");
    } finally {
      setExportLoading(false);
    }
  };

  const fetchAllForReport = useCallback(async () => {
    const token = localStorage.getItem("token");
    const endpoint = getEndpoint(tab);
    try {
      const response = await fetch(`/api/GeneralReports/${endpoint}?page=1&pageSize=${totalRows || 1000}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await response.json();
      return json.data || [];
    } catch (error) { return []; }
  }, [tab, totalRows]);

  const fetchData = async (activeTab: Tab, pageNum: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const endpoint = getEndpoint(activeTab);
    try {
      const response = await fetch(`/api/GeneralReports/${endpoint}?page=${pageNum}&pageSize=${pageSize}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      const json = await response.json();
      const fetchedData = json.data || [];
      setTotalRows(json.totalCount || fetchedData.length);
      if (activeTab === "loans") setLoanData(fetchedData);
      else if (activeTab === "subscribers") setSubData(fetchedData);
      else if (activeTab === "late") setLateData(fetchedData);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [tab]);
  useEffect(() => { fetchData(tab, currentPage); }, [tab, currentPage]);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const dateValueFormatter = (params: any) => params.value ? new Date(params.value).toLocaleDateString('en-CA') : "—";

  const tabs = [
    { id: "loans" as Tab, label: "تقارير الإعارة", icon: <BookOpen className="w-5 h-5" /> },
    { id: "subscribers" as Tab, label: "تقارير المشتركين", icon: <Users className="w-5 h-5" /> },
    { id: "late" as Tab, label: "تقارير المتأخرين", icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-[98%] mx-auto py-8 animate-fade-in print:p-0" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end print:hidden">
        <div className="flex gap-4 text-right">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary flex items-center justify-center">
            <BarChart3 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2 leading-tight">التقارير العامة</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">عرض وتحليل بيانات الإعارات والمشتركين والكتب المتأخرة.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 print:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`group relative flex-1 py-4 rounded-[2rem] font-black text-lg transition-all duration-500 shadow-sm flex items-center justify-center gap-3 border-2 ${
              tab === t.id
                ? "bg-gradient-to-r from-primary to-primary/80 border-primary text-white scale-[1.03] shadow-xl shadow-primary/20"
                : "bg-card border-transparent text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h3 className="text-2xl font-bold text-foreground mt-4">جاري تحميل التقارير...</h3>
        </div>
      ) : (
        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden p-6 print:p-0">
          <div className="flex justify-end items-center gap-3 mb-4 print:hidden">
            <button
              onClick={handleExportExcel}
              disabled={exportLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-green-900/20 active:scale-95"
            >
              {exportLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              تصدير إكسل
            </button>
          </div>

          <div className="h-[700px]">
            <AgGridTable
              key={tab}
              columnDefs={
                tab === "loans" ? [
                  { field: "memberIdNumber", headerName: "رقم الهوية", flex: 1, minWidth: 120 },
                  { field: "memberName", headerName: "اسم المشترك", flex: 1.2, minWidth: 150 },
                  { field: "bookTitle", headerName: "عنوان الكتاب", flex: 1.5, minWidth: 200 },
                  { field: "serialNumber", headerName: "رقم التسلسل", flex: 1, minWidth: 130 },
                  { field: "authors", headerName: "المؤلفون", flex: 1.2, minWidth: 150 },
                  { field: "startDate", headerName: "تاريخ الإعارة", flex: 1, valueFormatter: dateValueFormatter },
                  { field: "endDate", headerName: "تاريخ الإرجاع", flex: 1, valueFormatter: dateValueFormatter },
                ] : tab === "subscribers" ? [
                  { field: "memberIdNumber", headerName: "رقم الهوية", flex: 1, minWidth: 120 },
                  { field: "memberName", headerName: "اسم المشترك", flex: 2, minWidth: 200 },
                  { field: "subscriptionDate", headerName: "تاريخ الاشتراك", flex: 1, valueFormatter: dateValueFormatter },
                  { field: "subscriptionDuration", headerName: "المدة", flex: 1, valueFormatter: (p: any) => `${p.value || 0} يوم` },
                ] :  [

          { field: "memberIdNumber", headerName: "رقم الهوية", flex: 1, minWidth: 120 },
          { field: "memberName", headerName: "اسم المشترك", flex: 1.2, minWidth: 150 },
          { field: "bookTitle", headerName: "عنوان الكتاب", flex: 1.2, minWidth: 180 },
          { field: "serialNumber", headerName: "رقم التسلسل", flex: 1, minWidth: 130 },
          { field: "authors", headerName: "المؤلفون", flex: 1.2, minWidth: 150 },
          { field: "startDate", headerName: "تاريخ البداية", flex: 1, valueFormatter: dateValueFormatter },
          { field: "endDate", headerName: "تاريخ النهاية", flex: 1, valueFormatter: dateValueFormatter },
          { field: "lateDays", headerName: "أيام التأخير", flex: 0.8, minWidth: 100, cellClass: "text-red-500 font-bold", valueFormatter: (params: any) => params.value ? `${params.value} يوم` : "0 يوم" },

        ]
              }
              rowData={tab === "loans" ? loanData : tab === "subscribers" ? subData : lateData}
              title={tabs.find(t => t.id === tab)?.label}
              onFetchAll={fetchAllForReport}
              pagination={false}
              showExport={false} 
            />
          </div>

          {/* --- تم دمج تصميم الباجنيشن المطور هنا --- */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t print:hidden">
            <div className="text-sm text-muted-foreground font-medium">
              عرض <span className="text-primary font-bold">{(currentPage - 1) * pageSize + 1}</span> إلى <span className="text-primary font-bold">{Math.min(totalRows, currentPage * pageSize)}</span> من أصل {totalRows} سجل
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 border rounded-xl hover:bg-secondary disabled:opacity-30 font-bold transition-all"
              >
                السابق
              </button>
              
              <div className="flex gap-1">
                {getPageNumbers().map((p, i) => (
                  <button
                    key={i}
                    disabled={p === "..."}
                    onClick={() => typeof p === 'number' && setCurrentPage(p)}
                    className={`w-10 h-10 rounded-lg border font-bold transition-all ${
                      currentPage === p 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                    } ${p === "..." ? "cursor-default border-none" : ""}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 border rounded-xl hover:bg-secondary disabled:opacity-30 font-bold transition-all"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}