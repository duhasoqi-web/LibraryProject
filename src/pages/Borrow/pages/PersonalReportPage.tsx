import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, Download, User, BookOpen, Clock, CreditCard, AlertTriangle } from "lucide-react";
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

  // مسميات التبويبات للعرض في اسم الملف
  const tabLabels = {
    current: "الإعارات الحالية",
    history: "سجل الإعارات",
    subscriptions: "الاشتراكات",
    fines: "المخالفات"
  };

  const endpoints = useMemo(() => ({
    current: `${API_BASE}/PersonalReport/current-borrows`,
    history: `${API_BASE}/PersonalReport/borrow-history`,
    subscriptions: `${API_BASE}/PersonalReport/subscriptions`,
    fines: `${API_BASE}/PersonalReport/fines`,
  }), []);

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
  }, [endpoints, pageSize, toast]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearched(true);
    setSubscriber(null);
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

  // --- دالة التصدير المحسنة ---
  const handleExport = async () => {
    if (!subscriber) {
      toast({ title: "يرجى البحث عن مشترك أولاً", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams({
        type: tab,
        searchKey: searchQuery.trim()
      }).toString();

      const res = await fetch(`${API_BASE}/PersonalReportExport/export?${queryParams}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`فشل التصدير: ${res.status}`);

      const blob = await res.blob();
      
      // إنشاء تاريخ اليوم بتنسيق مقروء (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      // بناء اسم الملف: تقرير_الاسم_النوع_التاريخ
      const safeName = subscriber.name.replace(/\s+/g, '_');
      const customFilename = `تقرير_${tabLabels[tab]}_${safeName}_${today}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = customFilename; 
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        a.remove();
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({ title: "تم تحميل ملف التصدير بنجاح" });
    } catch (error) {
      toast({
        title: "فشل التصدير",
        description: "حدث خطأ أثناء محاولة إنشاء الملف",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    const formatDate = (p) => p.value ? new Date(p.value).toLocaleDateString('ar-EG') : "-";
    
    const base = [
      { field: "memberIdNumber", headerName: "رقم الهوية", minWidth: 120 },
      { field: "memberName", headerName: "اسم المشترك", minWidth: 200, flex: 1 }
    ];

    const cols = {
      current: [
        ...base,
        { field: "bookTitle", headerName: "عنوان الكتاب", minWidth: 200, flex: 1.5 },
        { field: "serialNumber", headerName: "رقم التسلسل", width: 120 },
        { field: "startDate", headerName: "تاريخ البداية", valueFormatter: formatDate, width: 130 },
        { field: "expectedReturnDate", headerName: "موعد الإرجاع", valueFormatter: formatDate, width: 130 },
      ],
      subscriptions: [
        ...base,
        { field: "subscriptionStartDate", headerName: "بدء الإشتراك", valueFormatter: formatDate, width: 130 },
        { field: "subscriptionEndDate", headerName: "نهاية الإشتراك", valueFormatter: formatDate, width: 130 },
        { field: "amount", headerName: "المبلغ", width: 100, cellStyle: { fontWeight: 'bold' } },
        { field: "paymentMethod", headerName: "طريقة الدفع", width: 120 },
        { field: "employeeName", headerName: "الموظف ", minWidth: 150 },
      ],
      history: [
        ...base,
        { field: "bookTitle", headerName: "عنوان الكتاب", minWidth: 200, flex: 1.5 },
        { field: "startDate", headerName: "تاريخ الإعارة", valueFormatter: formatDate, width: 130 },
        { field: "endDate", headerName: "تاريخ الإرجاع", valueFormatter: formatDate, width: 130 },
        { field: "employeeName", headerName: "الموظف", minWidth: 150 },
      ],
      fines: [
        ...base,
        { field: "bookTitle", headerName: "الكتاب", minWidth: 200 },
        { field: "fineTypeName", headerName: "نوع المخالفة", width: 150 },
        { field: "amount", headerName: "المبلغ المستحق", width: 130, cellStyle: { color: 'red', fontWeight: 'bold' } },
        { field: "date", headerName: "التاريخ", valueFormatter: formatDate, width: 130 },
      ]
    };
    return cols[tab] || [];
  };
const gridOptions = {
  overlayLoadingTemplate: '<span class="ag-overlay-loading-center">جاري تحميل البيانات...</span>',
  overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">لا توجد بيانات لعرضها</span>'
};  return (
    <div className="max-w-6xl mx-auto p-4" dir="rtl">
      {/* قسم البحث */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
          <Search className="w-5 h-5 text-blue-500" /> تقارير المشتركين الشخصية
        </h3>
        <div className="flex gap-2">
          <input
            className="flex-1 border-2 p-3 rounded-xl focus:border-blue-500 outline-none text-right transition-all"
            placeholder="أدخل رقم الهوية أو رقم المشترك للبحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button 
            onClick={handleSearch} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-colors disabled:bg-blue-300"
          >
            {loading ? "جاري البحث..." : "بحث"}
          </button>
        </div>
      </div>

      {subscriber && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{subscriber.name}</h2>
                <p className="text-sm text-gray-500">رقم المشترك (ID): {subscriber.memberNumber}</p>
              </div>
            </div>
            
            <button
              onClick={handleExport}
              disabled={loading || rowData.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition-all disabled:opacity-50 w-full md:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              تصدير {tabLabels[tab]} (Excel)
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 p-1.5 rounded-2xl">
            {[
              { id: "current", label: "الاعارات الحالية", icon: BookOpen },
              { id: "subscriptions", label: "الاشتراكات", icon: CreditCard },
              { id: "history", label: "سجل الاعارات", icon: Clock },
              { id: "fines", label: "المخالفات", icon: AlertTriangle },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setPage(1); }}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  tab === t.id ? "bg-white shadow-md text-blue-600" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="h-[500px] border rounded-xl overflow-hidden ag-theme-alpine relative">

  <AgGridTable
  {...gridOptions} // تمرير الإعدادات دفعة واحدة
  columnDefs={getColumns()}
  rowData={rowData}
  showExport={false}
  enableRtl={true}
  pagination={false}
/>          </div>

          {/* الترقيم الخارجي */}
          <div className="flex justify-between items-center pt-6 border-t mt-4">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="px-5 py-2 border-2 rounded-xl disabled:opacity-30 font-bold hover:bg-gray-50 transition-colors"
            >
              السابق
            </button>

            <div className="flex flex-col items-center">
               <span className="text-gray-700 font-bold">
                صفحة {page} من {Math.ceil(totalRows / pageSize) || 1}
              </span>
              <span className="text-xs text-gray-400">إجمالي السجلات: {totalRows}</span>
            </div>

            <button
              disabled={loading || page >= (Math.ceil(totalRows / pageSize) || 1)}
              onClick={() => setPage(p => p + 1)}
              className="px-5 py-2 border-2 rounded-xl disabled:opacity-30 font-bold hover:bg-gray-50 transition-colors"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {searched && !subscriber && !loading && (
        <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed mt-6">
          <p className="text-gray-500 font-medium">لم يتم العثور على نتائج للرقم المدخل. يرجى التأكد من البيانات.</p>
        </div>
      )}
    </div>
  );
}