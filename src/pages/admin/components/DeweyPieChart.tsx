import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card } from "@/ui/card";
import { adminApi } from "@/pages/admin/lib/api"; 
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#0ea5e9", "#a855f7", "#14b8a6", "#f43f5e",
  "#fb923c", "#84cc16",
];

const DeweyPieChart = () => {
  const [data, setData] = useState<{ classification: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // استخدام الـ API الموحد
        const result = await adminApi.getBooksByClass();
        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching chart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  const total = data.reduce((a, b) => a + b.count, 0);

  const chartData = {
    labels: data.map(item => item.classification),
    datasets: [
      {
        label: "عدد الكتب",
        data: data.map(item => item.count),
        backgroundColor: COLORS.slice(0, data.length),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 8,
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: "Cairo", size: 12 },
        titleFont: { family: "Cairo", size: 12, weight: 'bold' },
        backgroundColor: "#1e293b",
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${val} كتاب (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <Card className="p-5 shadow-sm" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-foreground">توزيع الكتب</h3>
          <p className="text-[10px] text-muted-foreground">حسب تصنيف ديوي العشري</p>
        </div>
        {!loading && total > 0 && (
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            {total.toLocaleString("ar-EG")} كتاب إجمالي
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <div className="w-32 h-32 rounded-full border-8 border-muted animate-pulse" />
          <div className="w-24 h-4 bg-muted animate-pulse rounded" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-muted-foreground text-center py-16 text-sm italic">
          لا توجد بيانات تصنيف حالياً
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row items-center gap-8">
          
          {/* Doughnut Chart Container */}
          <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
            <Doughnut data={chartData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-foreground">
                {total > 1000 ? (total/1000).toFixed(1) + 'k' : total.toLocaleString("ar-EG")}
              </span>
              <span className="text-[10px] text-muted-foreground">كتاب</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-2.5">
            {data.map((item, i) => {
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
              return (
                <div key={i} className="flex items-center gap-3 group">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-[11px] text-foreground font-medium flex-1 truncate">
                    {item.classification}
                  </span>
                  
                  {/* Progress Bar & Percentage */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full transition-all duration-1000"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground w-8 text-left">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </Card>
  );
};

export default DeweyPieChart;