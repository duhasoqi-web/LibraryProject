import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Card } from "@/ui/card";
import { adminApi } from "@/pages/admin/lib/api"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLORS = [
  "hsl(240,80%,60%)", "#6366f1", "#0ea5e9", "#a855f7",
  "#22c55e", "#f59e0b", "#ef4444", "#14b8a6",
];

interface Borrower {
  memberName: string;
  count: number;
}

const TopBorrowersChart = () => {
  const [data, setData] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // استدعاء الـ API المركزي بدلاً من fetch اليدوي
        const result = await adminApi.getTopBorrowers();
        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching top borrowers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const total = sortedData.reduce((a, b) => a + b.count, 0);
  const topBorrower = sortedData[0]?.memberName ?? "غير متوفر";
  const avg = sortedData.length > 0 ? Math.round(total / sortedData.length) : 0;

  const chartData = {
    labels: sortedData.map(item => item.memberName),
    datasets: [
      {
        label: "عدد الإعارات",
        data: sortedData.map(item => item.count),
        backgroundColor: sortedData.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 8,
        barThickness: 20,
      }
    ]
  };

  const options: any = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: "Cairo", size: 13 },
        titleFont: { family: "Cairo", size: 13 },
        backgroundColor: "#1e1b4b",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.x} إعارة`,
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { family: "Cairo", size: 11 }, color: "#888" },
        grid: { color: "#f0f0f0" },
        border: { display: false },
      },
      y: {
        ticks: { font: { family: "Cairo", size: 12 }, color: "#444" },
        grid: { display: false },
        border: { display: false },
      }
    }
  };

  return (
    <Card className="p-5 shadow-sm" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">أكثر المشتركين استعارة للكتب</h3>
        {!loading && sortedData.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            Top {sortedData.length}
          </span>
        )}
      </div>

      {/* Stats */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "إجمالي الإعارات", value: total.toLocaleString("ar-EG") },
            { label: "متوسط لكل مشترك", value: avg.toLocaleString("ar-EG") },
            { label: "الأكثر استعارة", value: topBorrower },
          ].map((stat, i) => (
            <div key={i} className="bg-muted/40 border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-foreground truncate">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div style={{ height: `${Math.max(sortedData.length * 44, 120)}px` }}>
        {loading ? (
          <div className="h-full flex flex-col justify-center gap-2">
            {[80, 60, 90, 50, 70].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-20 h-3 bg-muted animate-pulse rounded" />
                <div className="h-5 bg-muted animate-pulse rounded-md" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        ) : sortedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            لا يوجد بيانات
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>

      {/* Legend with Progress Bars */}
      {!loading && sortedData.length > 0 && (
        <div className="mt-4 space-y-2 border-t pt-4">
          {sortedData.map((item, i) => {
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs text-foreground flex-1 truncate">{item.memberName}</span>
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-left shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default TopBorrowersChart;