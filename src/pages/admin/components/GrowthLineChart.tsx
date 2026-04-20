import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Card } from "@/ui/card";
import { adminApi } from "@/pages/admin/lib/api"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ScriptableContext
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const GrowthLineChart = () => {
  const [data, setData] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrowth = async () => {
      try {
        // استخدام الـ API المركزي
        const result = await adminApi.getNewMembersGrowth();
        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching growth:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrowth();
  }, []);

  const total = data.reduce((a, b) => a + b.count, 0);
  const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
  const maxMonth = data.find(d => d.count === maxCount)?.month ?? "غير متوفر";
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: "المشتركين الجدد",
        data: data.map(item => item.count),
        borderColor: "#6366f1",
        // إنشاء التدرج اللوني برمجياً عبر Chart.js مباشرة لضمان الدقة
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.35)");
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 2.5,
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500, easing: "easeInOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: "Cairo", size: 13 },
        titleFont: { family: "Cairo", size: 13 },
        backgroundColor: "#312e81",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y} مشترك جديد`,
        }
      }
    },
    scales: {
      x: {
        // ملاحظة: reverse: true تجعل المخطط يبدأ من اليمين لليسار ليناسب الـ RTL
        reverse: true,
        ticks: {
          font: { family: "Cairo", size: 11 },
          color: "#888",
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        position: 'right', // نقل المحور لليمين ليناسب العربية
        ticks: {
          font: { family: "Cairo", size: 11 },
          color: "#888",
          precision: 0,
        },
        grid: { color: "#f3f4f6" },
        border: { display: false },
      }
    }
  };

  return (
    <Card className="p-5 shadow-sm" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">نمو المشتركين الجدد</h3>
        {!loading && (
          <div className="flex gap-2">
            <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              نمو شهري
            </span>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {new Date().getFullYear()}
            </span>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "إجمالي السنة", value: total.toLocaleString("ar-EG") },
            { label: "متوسط النمو", value: avg.toLocaleString("ar-EG") },
            { label: "ذروة النشاط", value: maxMonth },
          ].map((stat, i) => (
            <div key={i} className="bg-muted/30 border border-border/50 rounded-xl p-3 text-center transition-hover hover:bg-muted/50">
              <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart Container */}
      <div className="h-[220px] relative">
        {loading ? (
          <div className="h-full flex items-end gap-2 pb-4 px-2">
            {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-muted/60 animate-pulse rounded-t-md"
                style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
            لا توجد بيانات نمو مسجلة
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </Card>
  );
};

export default GrowthLineChart;