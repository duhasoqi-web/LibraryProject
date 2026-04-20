import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Download, User, AlertCircle, BookOpen, Clock, CreditCard, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AgGridTable from "@/pages/Borrow/components/library/AgGridTable";

const API_BASE = "/api";

export default function PersonalReportPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriber, setSubscriber] = useState(null);
  const [tab, setTab] = useState("current");
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [searched, setSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const abortControllerRef = useRef(null);

  const endpoints = {
    current: `${API_BASE}/PersonalReport/current-borrows`,
    history: `${API_BASE}/PersonalReport/borrow-history`,
    subscriptions: `${API_BASE}/PersonalReport/subscriptions`,
    fines: `${API_BASE}/PersonalReport/fines`,
  };

  const fetchData = useCallback(async ({ searchKey, currentTab, currentPage }) => {
    if (!searchKey?.trim()) return;
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        searchKey: searchKey.trim(),
        pageNumber: currentPage.toString(),
        pageSize: pageSize.toString(),
      }).toString();

      const res = await fetch(`${endpoints[currentTab]}?${queryParams}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("فشل جلب البيانات");
      
      const response = await res.json();
      setRowData(response.data || []);
      setTotalRows(response.totalCount || 0);

      // تحديث المشترك فقط إذا وُجدت بيانات، وإلا نحتفظ بالمشترك الحالي
      if (response.data && response.data.length > 0) {
        setSubscriber({
          id: response.data[0].memberIdNumber,
          name: response.data[0].memberName,
          memberNumber: response.data[0].memberIdNumber,
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast({ title: "خطأ في التحميل", variant: "destructive" });
        setRowData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize, toast]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearched(true);
    setSubscriber(null); // نصفر المشترك فقط عند بدء بحث جديد تماماً
    setRowData([]);
    setPage(1);
    fetchData({ searchKey: searchQuery.trim(), currentTab: tab, currentPage: 1 });
  };

  useEffect(() => {
    if (searched && searchQuery.trim()) {
      fetchData({ searchKey: searchQuery.trim(), currentTab: tab, currentPage: page });
    }
    return () => abortControllerRef.current?.abort();
  }, [tab, page, fetchData, searched]);

  const handleExport = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const exportParams = new URLSearchParams({ type: tab, memberId: searchQuery.trim() }).toString();
      
      const res = await fetch(`${API_BASE}/PersonalReportExport/export?${exportParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Report_${subscriber?.name || 'User'}_${tab}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "تم التصدير بنجاح" });
    } catch (error) {
      toast({ title: "فشل التصدير", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    const d = (p) => p.value ? new Date(p.value).toLocaleDateString('ar-EG') : "-";
    const cols = {
      current: [
        { field: "bookTitle", headerName: "عنوان الكتاب", flex: 1.5 },
        { field: "serialNumber", headerName: " باركود الكتاب" },
        { field: "startDate", headerName: "تاريخ الإعارة", valueFormatter: d },
        { field: "expectedReturnDate", headerName: "موعد الإرجاع", valueFormatter: d },
      ],
      subscriptions: [
        { field: "subscriptionStartDate", headerName: "تاريخ البدء", valueFormatter: d },
        { field: "subscriptionEndDate", headerName: "تاريخ الانتهاء", valueFormatter: d },
        { field: "amount", headerName: "المبلغ" },
        { field: "paymentMethod", headerName: "طريقة الدفع" },
      ],
      history: [
        { field: "bookTitle", headerName: "الكتاب", flex: 1.5 },
        { field: "serialNumber", headerName: " باركود الكتاب" },
        { field: "startDate", headerName: "تاريخ الإعارة", valueFormatter: d },
        { field: "endDate", headerName: "تاريخ الإرجاع", valueFormatter: d },
      ],
      fines: [
        { field: "fineTypeName", headerName: "نوع المخالفة" },
        { field: "amount", headerName: "المبلغ" },
        { field: "date", headerName: "التاريخ", valueFormatter: d },
        { field: "bookTitle", headerName: "الكتاب" },
      ]
    };
    return cols[tab] || [];
  };

  const totalPages = Math.ceil(totalRows / pageSize) || 1;

  return (
    <div className="max-w-6xl mx-auto p-4" dir="rtl">
      {/* Search Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-500" /> بحث عن مشترك
        </h3>
        <div className="flex gap-2">
          <input
            className="flex-1 border-2 p-3 rounded-xl focus:border-blue-500 outline-none"
            placeholder="رقم الهوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white px-8 rounded-xl font-bold">
            {loading ? "جاري..." : "بحث"}
          </button>
        </div>
      </div>

      {subscriber && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <User className="w-10 h-10 text-blue-600 bg-blue-50 p-2 rounded-full" />
              <div>
                <h2 className="text-xl font-bold">{subscriber.name}</h2>
                <p className="text-sm text-gray-500 italic">ID: {subscriber.memberNumber}</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={loading || rowData.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> تصدير Excel
            </button>
            
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-50 p-1 rounded-2xl">
            {[
              { id: "current", label: " الاعارات الحالية", icon: BookOpen },
              { id: "subscriptions", label: "الاشتراكات", icon: CreditCard },
              { id: "history", label: "سجل الاعارات", icon: Clock },
              { id: "fines", label: "المخالفات", icon: AlertTriangle },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setPage(1); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                  tab === t.id ? "bg-white shadow text-blue-600" : "text-gray-500"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Table Area */}
{/* استبدل قطعة الكود السابقة بهذا التنسيق لضمان عدم حدوث Error */}
<div className="h-[500px] border rounded-xl overflow-hidden relative ag-theme-alpine">
{/* داخل صفحة PersonalReportPage.jsx */}
<div className="h-[500px] border rounded-xl overflow-hidden relative ag-theme-alpine">
  <AgGridTable 
    columnDefs={getColumns()} 
    rowData={rowData}
    showExport={false} // أضف هذا السطر هنا ليتم تمريره للمكون
    {...{
      suppressPaginationPanel: true,
      pagination: false,
      enableRtl: true
    }}
  />
</div>
</div>
          {/* Custom Pagination */}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-30 font-bold"
            >
              السابق
            </button>
            <span className="text-gray-600 font-bold">صفحة {page} من {totalPages}</span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-30 font-bold"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {searched && !subscriber && !loading && (
        <div className="text-center p-10 bg-gray-50 rounded-xl border-2 border-dashed mt-4">
           <p className="text-gray-500">لا توجد بيانات لهذا الرقم.</p>
        </div>
      )}
    </div>
  );
}