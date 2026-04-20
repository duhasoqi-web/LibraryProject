import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card } from "@/ui/card";
import { adminApi } from "@/pages/admin/lib/api"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface BorrowData {
  monthNumber: number;
  month: string;
  count: number;
}

const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

const BorrowsActivityChart = () => {
  const [data, setData] = useState<BorrowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // التعديل المطلوب: استخدام adminApi بدلاً من fetch اليدوي
        const result = await adminApi.getBorrowsActivity();
        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching borrows activity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const countsByMonth = months.map((_, index) => {
    const found = data.find(d => d.monthNumber === index + 1);
    return found ? found.count : 0;
  });

  const totalBorrows = countsByMonth.reduce((a, b) => a + b, 0);
  const maxMonth = months[countsByMonth.indexOf(Math.max(...countsByMonth))];
  const avgBorrows = totalBorrows > 0 ? Math.round(totalBorrows / countsByMonth.filter(c => c > 0).length) : 0;

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "عدد الإعارات",
        data: countsByMonth,
        borderColor: "hsl(225, 80%, 60%)",
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const {ctx: canvasCtx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "hsla(225, 80%, 60%, 0.35)");
          gradient.addColorStop(1, "hsla(225, 80%, 60%, 0.0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "hsl(225, 80%, 60%)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 2.5,
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: "Cairo", size: 13 },
        titleFont: { family: "Cairo", size: 13 },
        backgroundColor: "hsl(225, 80%, 20%)",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y} إعارة`,
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { family: "Cairo", size: 11 }, color: "#888" },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { font: { family: "Cairo", size: 11 }, color: "#888", precision: 0 },
        grid: { color: "#f0f0f0" },
        border: { display: false },
      }
    }
  };

  return (
    <Card className="p-5 shadow-sm" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">نشاط الإعارات الشهري</h3>
        {!loading && totalBorrows > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {new Date().getFullYear()}
          </span>
        )}
      </div>

      {/* Stats */}
      {!loading && totalBorrows > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "إجمالي الإعارات", value: totalBorrows.toLocaleString("ar-EG") },
            { label: "متوسط شهري", value: avgBorrows.toLocaleString("ar-EG") },
            { label: "أعلى شهر", value: maxMonth },
          ].map((stat, i) => (
            <div key={i} className="bg-muted/40 border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="h-[220px]">
        {loading ? (
          <div className="h-full flex flex-col justify-end gap-2 pb-2">
            {[60, 80, 50, 90, 70].map((h, i) => (
              <div key={i} className="flex items-end gap-1 h-full">
                <div className="animate-pulse bg-muted rounded-lg w-full" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>

    </Card>
  );
};

export default BorrowsActivityChart;