import { useEffect, useState } from "react";
import { Card } from "@/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Payment {
  currency: string;
  amount: number;
}

interface Supplier {
  supplierName: string;
  totalBooks: number;
  payments: Payment[];
}

const COLORS = [
  "hsl(225, 80%, 60%)",
  "hsl(260, 70%, 60%)",
  "hsl(200, 75%, 55%)",
  "hsl(180, 65%, 50%)",
  "hsl(240, 60%, 65%)",
];

const TopSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/Admin/top-suppliers",{
            headers: {
      "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("auth_token") ?? localStorage.getItem("token") ?? ""}`,
            }
      });
    
        const data = await res.json();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const chartData = {
    labels: suppliers.map(s => s.supplierName),
    datasets: [
      {
        label: "عدد الكتب",
        data: suppliers.map(s => s.totalBooks),
        backgroundColor: suppliers.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 8,
        barThickness: 18,
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
        bodyFont: { family: "Cairo" },
        titleFont: { family: "Cairo" },
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.x} كتاب`,
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

  const maxBooks = Math.max(...suppliers.map(s => s.totalBooks), 1);

  return (
    <Card className="p-5 shadow-sm" dir="rtl">
      <h3 className="text-base font-bold text-foreground mb-4">أفضل الموردين</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="h-8 bg-muted rounded-lg flex-1" />
              <div className="h-8 w-16 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">لا يوجد بيانات</div>
      ) : (
        <div className="space-y-5">
          <div style={{ height: `${Math.max(suppliers.length * 48, 120)}px` }}>
            <Bar data={chartData} options={options} />
          </div>

          <div className="space-y-2">
            {suppliers.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">{s.supplierName}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      {s.totalBooks} كتاب
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(s.totalBooks / maxBooks) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  {s.payments.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.payments.map(p => `${p.amount.toLocaleString("ar-EG")} ${p.currency}`).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TopSuppliers;