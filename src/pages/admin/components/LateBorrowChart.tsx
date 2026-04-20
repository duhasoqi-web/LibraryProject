import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card } from "@/ui/card";
import { adminApi } from "@/pages/admin/lib/api"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LateBorrowsChart = () => {
  const [percentage, setPercentage] = useState<{ late: number; onTime: number }>({ late: 0, onTime: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPercentage = async () => {
      try {
        const data = await adminApi.getLateBorrowsPercentage();
        const late = typeof data === "number" ? data : data?.latePercentage ?? 0;
        setPercentage({ late, onTime: 100 - late });
      } catch (error) {
        console.error("Error fetching late borrows percentage:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPercentage();
  }, []);

  const lateColor = percentage.late >= 50 ? "#f50000" : percentage.late >= 25 ? "#ffc35c" : "#bbc941";
  const lateLabel = percentage.late >= 50 ? "نسبة عالية" : percentage.late >= 25 ? "نسبة متوسطة" : "نسبة منخفضة";

  const chartData = {
    labels: ["متأخرة", "في الوقت"],
    datasets: [
      {
        data: [percentage.late, percentage.onTime],
        backgroundColor: [lateColor, "#069c06"],
        borderWidth: 0,
        hoverOffset: 5,
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: "Cairo", size: 13 },
        titleFont: { family: "Cairo", size: 13 },
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.toFixed(2)}%`,
        }
      }
    }
  };

  return (
    <Card className="p-5 shadow-sm" dir="rtl">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">نسبة الإعارات المتأخرة</h3>
        {!loading && (
          <span
            className="text-xs font-medium px-2 py-1 rounded-lg"
            style={{ backgroundColor: `${lateColor}20`, color: lateColor }}
          >
            {lateLabel}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-[160px] h-[200px] rounded-full bg-muted animate-pulse" />
          <div className="w-32 h-4 bg-muted animate-pulse rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">

          <div className="relative" style={{ width: 180, height: 300 }}>
            <Doughnut data={chartData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black" style={{ color: lateColor }}>
                {percentage.late.toFixed(2)}%
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">متأخرة</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lateColor }} />
              <div>
                <p className="text-xs text-muted-foreground">متأخرة</p>
                <p className="text-base font-bold text-foreground">{percentage.late.toFixed(2)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="w-3 h-3 rounded-full bg-green-600 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">في الوقت</p>
                <p className="text-base font-bold text-foreground">{percentage.onTime.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-1 mt-2">
            <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${percentage.late}%`, backgroundColor: lateColor }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

        </div>
      )}
    </Card>
  );
};

export default LateBorrowsChart;