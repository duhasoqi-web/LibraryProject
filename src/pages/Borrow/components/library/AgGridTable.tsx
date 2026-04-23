import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import libraryLogo from "@/assets/upscalemedia-transformed.webp";
import municipalityLogo from "@/assets/slogan.webp"; 
import { toast } from "sonner";

ModuleRegistry.registerModules([AllCommunityModule]);

interface AgGridTableProps {
  columnDefs: any[];
  rowData: any[];
  title?: string;
  showExport?: boolean;
  showPrint?: boolean;
  pageSize?: number;
  enableRtl?: boolean;
  pagination?: boolean; 
  printValueFormatter?: (field: string, value: any) => string;
  onFetchAll?: () => Promise<any[]>; // ✅ الخاصية المطلوبة للجلب الشامل
}

export default function AgGridTable({
  columnDefs,
  rowData,
  title,
  showExport = true,
  showPrint = true,
  pageSize = 10,
  pagination = true, 
  printValueFormatter,
  onFetchAll, // ✅ استلام الخاصية
}: AgGridTableProps) {
  const gridRef = useRef<AgGridReact>(null);

  // --- جزء مراقبة الثيم لضمان التحديث اللحظي ---
  const [isDarkMode, setIsDarkMode] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const myTheme = useMemo(() => themeQuartz.withParams({
    fontFamily: "Cairo, sans-serif",
    headerFontSize: 14,
    fontSize: 13,
    borderRadius: 0,
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    foregroundColor: isDarkMode ? "#f1f5f9" : "#1f2937",
    headerBackgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
  }), [isDarkMode]);
  // ------------------------------------------

  const defaultColDef = useMemo(() => ({
    flex: 1,
    filter: true,
    editable: false,
    resizable: true,
    suppressMovable: true,
    wrapText: true,
    cellStyle: { whiteSpace: 'normal' as const },
    tooltipValueGetter: (p: any) => p.value,
  }), []);

  // دالة المعالجة الموحدة (نفس منطقك تماماً)
  const getProcessedData = useCallback((dataToProcess: any[]) => {
    return dataToProcess.map(item => {
      const row: any = {};
      columnDefs.forEach((col: any) => {
        if (col.field === "actions") return;
        let value = item[col.field];

        if (printValueFormatter) {
          value = printValueFormatter(col.field, value);
        }

        if (col.field?.toLowerCase().includes("date") && value) {
          if (typeof value === "string" && value.includes("T")) {
            value = value.split("T")[0];
          } else if (!(value instanceof Date) && !isNaN(Date.parse(value))) {
            const d = new Date(value);
            value = d.toLocaleDateString('en-CA');
          }
        }

        if (typeof value === "string") {
          value = value.replace(/<[^>]*>?/gm, "");
        }
        row[col.headerName] = value ?? "-";
      });
      return row;
    });
  }, [columnDefs, printValueFormatter]);

  const exportExcel = useCallback(async () => {
    if (!rowData || rowData.length === 0) {
      toast.error("لا توجد بيانات لتصديرها"); // تأكد من استيراد toast إذا كنت تستخدمه هنا
      return;
    }
    let rawData = [];

    if (onFetchAll) {
      rawData = await onFetchAll();
    } else {
      gridRef.current?.api.forEachNodeAfterFilterAndSort((node) => {
        if (node.data) rawData.push(node.data);
      });
    }

    const processedData = getProcessedData(rawData);
    if (processedData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(processedData, { origin: "A3" } as any);
    XLSX.utils.sheet_add_aoa(worksheet, [[title || "تقرير"]], { origin: "A1" });

    const colWidths = Object.keys(processedData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...processedData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2
    }));

    worksheet["!cols"] = colWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${title || "data"}.xlsx`);
  }, [onFetchAll, getProcessedData, title]);

 const printTable = useCallback(async () => {

  if (!rowData || rowData.length === 0) {
      toast.error("لا توجد بيانات للطباعة"); // أو استخدم toast.error
      return;
    }
  
    let rawData = [];
    
    if (onFetchAll) {
      rawData = await onFetchAll();
    } else {
      const api = gridRef.current?.api;
      if (!api) return;
      api.forEachNodeAfterFilterAndSort((node) => {
        if (node.data) rawData.push(node.data);
      });
    }

    const cols = columnDefs.filter(c => c.field !== "actions");
    const now = new Date();
    const currentYear = now.getFullYear();
    const dateStr = now.toLocaleDateString('ar-EG');
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dayName = now.toLocaleDateString('ar-EG', { weekday: 'long' });

    const tableRows = rawData.map(row => {
      const cells = cols.map(c => {
        let val = row[c.field];
        if (printValueFormatter) val = printValueFormatter(c.field, val);

        if ((!val || val === row[c.field]) && c.field?.toLowerCase().includes("date") && val) {
          if (typeof val === "string") {
             val = val.split("T")[0];
          } else {
             const d = new Date(val);
             val = isNaN(d.getTime()) ? val : d.toLocaleDateString("ar-EG");
          }
        }
        if (typeof val === "string") val = val.replace(/<[^>]*>?/gm, "");
        return `<td>${String(val ?? "-")}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    const printWindow = window.open("", "TulkarmLibraryReport");
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
      <head>
        <title>${title || "تقرير"}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
          
          /* هوامش طبيعية تضمن عدم تداخل العناصر */
          @page { margin: 20mm 15mm; size: auto; }
          
          body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 0; color: #333; margin: 0; }
          
          .logo-container { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 5px; }
          .logo-img { width: 75px; height: auto; object-fit: contain; }
          
          .header-table { width: 100%; border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; border-collapse: collapse; }
          .header-table td { border: none !important; vertical-align: middle; }
          .info-side { width: 25%; font-size: 11px; line-height: 1.6; text-align: right; }
          .logo-center { width: 50%; text-align: center; }
          .left-side { width: 25%; text-align: left; font-size: 11px; color: #555; }
          
          .report-title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
          
          table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; }
          table.data-table th, table.data-table td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 12px; }
          table.data-table th { background: #f0f0f0; }
          
          /* التعديل المهم: الفوتر الآن ينزل بشكل طبيعي تحت الجدول */
          .footer { 
            text-align: center; 
            font-size: 11px; 
            color: #444; 
            margin-top: 40px; 
            padding-top: 10px; 
            border-top: 1px solid #ddd;
            width: 100%;
          }
          
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td class="info-side">
              <div>اليوم: ${dayName}</div>
              <div>التاريخ: ${dateStr}</div>
              <div>الوقت: ${timeStr}</div>
            </td>
            <td class="logo-center">
              <div class="logo-container">
                <img src="${municipalityLogo}" class="logo-img" /> 
                <img src="${libraryLogo}" class="logo-img" style="mix-blend-mode: multiply;" />
              </div>
              <div style="font-weight:bold; font-size: 18px; margin-top: 5px;">بلدية طولكرم</div>
              <div style="font-size: 14px; font-weight: bold; color: #444;">المكتبة العامة</div>
            </td>
            <td class="left-side">
              <div style="font-weight: bold;">دولة فلسطين</div>
              <div>تقرير نظام الإعارات</div>
            </td>
          </tr>
        </table>

        <div class="report-title">${title || "تقرير سجل البيانات"}</div>

        <table class="data-table">
          <thead><tr>${cols.map(c => `<th>${c.headerName}</th>`).join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>

        <div class="footer">
          © ${currentYear} جميع حقوق الملكية والفكرية محفوظة وفقاً لمذكرة التفاهم الموقعة بين جامعة فلسطين التقنية - خضوري وبلدية طولكرم
        </div>

        <script>
          window.onload = () => { 
            setTimeout(() => { 
              window.print(); 
              window.close(); 
            }, 800); 
          };
        </script>
      </body>
      </html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  }, [onFetchAll, columnDefs, title, printValueFormatter, libraryLogo, municipalityLogo]);

  return (
    <div className="flex flex-col h-full">
      {(showExport || showPrint) && (
        <div className="flex gap-2 mb-3 shrink-0">
          {showExport && (
            <button onClick={exportExcel} className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all">
              <Download className="w-4 h-4" /> تصدير Excel
            </button>
          )}
          {showPrint && (
            <button 
              onClick={printTable} 
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> طباعة التقرير
            </button>
          )}
        </div>
      )}

      <div className={`rounded-xl overflow-hidden border border-border flex-1 transition-colors ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={myTheme}
          pagination={pagination}
          paginationPageSize={pageSize}
          enableRtl={true}
          animateRows={true}
          enableBrowserTooltips={true}
        />
      </div>
    </div>
  );
}