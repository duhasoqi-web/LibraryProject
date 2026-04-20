import { useEffect, useState } from "react";
import { BookOpen, Users, BookMarked, AlertTriangle, DollarSign } from "lucide-react";
import StatCard from "@/pages/admin/components/StatCard";
import RevenueCard from "@/pages/admin/components/RevenueCard";
import DeweyPieChart from "@/pages/admin/components/DeweyPieChart";
import TopSuppliers from "@/pages/admin/components/TopSuppliers";
import BooksLineChart from "@/pages/admin/components/BooksLineChart";
import SubscribersCategoryChart from "@/pages/admin/components/SubscribersCategoryChart";
import SubscribersRegionChart from "@/pages/admin/components/SubscribersRegionChart";
import GrowthLineChart from "@/pages/admin/components/GrowthLineChart";
import LateBorrowsChart from "@/pages/admin/components/LateBorrowChart";
import TopBorrowersChart from "@/pages/admin/components/TopBorrowChart";
import BorrowsActivityChart from "@/pages/admin/components/BorrowsActivityChart";
import { adminApi } from "../lib/api";

const Index = () => {
  const [stats, setStats] = useState({
    totalbooks: 0,
    activeMembers: 0,
    activeBorrows: 0,
    lateBorrows: 0
  });

  const [income, setIncome] = useState({
    subscriptionIncome: 0,
    fineIncome: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const fetchData = async () => {
      if (!isMounted) return;
      setLoading(true);

      try {
        const statsData = await adminApi.getCards();
        await delay(500);
        const incomeData = await adminApi.getIncomeCards();

        if (isMounted) {
          setStats(statsData ?? {
            totalbooks: 0,
            activeMembers: 0,
            activeBorrows: 0,
            lateBorrows: 0
          });

          setIncome(incomeData ?? {
            subscriptionIncome: 0,
            fineIncome: 0
          });
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 md:px-8 py-6 space-y-10" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center shadow-inner">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  لوحة تحكم المكتبة 📚
                </h1>
                <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-wider">
                  Municipality Library Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="إجمالي الكتب"
                value={loading ? "..." : stats.totalbooks.toLocaleString("ar-EG")}
                change="—"
                changeType="positive"
                icon={BookOpen}
                iconBg="bg-primary/10 text-primary"
            />
            <StatCard
                title="المشتركون النشطون"
                value={loading ? "..." : stats.activeMembers.toLocaleString("ar-EG")}
                change="—"
                changeType="positive"
                icon={Users}
                iconBg="bg-green-500/10 text-green-500"
            />
            <StatCard
                title="الإعارات الحالية"
                value={loading ? "..." : stats.activeBorrows.toLocaleString("ar-EG")}
                change="—"
                changeType="positive"
                icon={BookMarked}
                iconBg="bg-yellow-500/10 text-yellow-500"
            />
            <StatCard
                title="كتب متأخرة الإرجاع"
                value={loading ? "..." : stats.lateBorrows.toLocaleString("ar-EG")}
                change="—"
                changeType="negative"
                icon={AlertTriangle}
                iconBg="bg-red-500/10 text-red-500"
            />
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <h2 className="text-lg font-bold text-foreground">الإيرادات والمخالفات</h2>
              <div className="w-1 h-6 bg-primary rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <RevenueCard
                  title="إيرادات الاشتراكات"
                  subtitle="إجمالي إيرادات هذا الشهر"
                  value={loading ? "..." : `₪ ${income.subscriptionIncome.toLocaleString("ar-EG")}`}
                  change="—"
                  icon={DollarSign}
                  iconBg="bg-green-500/10 text-green-500"
              />
              <RevenueCard
                  title="إيرادات المخالفات"
                  subtitle="غرامات التأخير"
                  value={loading ? "..." : `₪ ${income.fineIncome.toLocaleString("ar-EG")}`}
                  change="—"
                  icon={AlertTriangle}
                  iconBg="bg-yellow-500/10 text-yellow-500"
              />
            </div>
          </section>


          <section className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <h2 className="text-lg font-bold text-foreground">تحليل الكتب</h2>
              <div className="w-1 h-6 bg-primary rounded-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
                <DeweyPieChart />
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
                <BooksLineChart />
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
              <TopSuppliers />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <h2 className="text-lg font-bold text-foreground">تحليل المشتركين والنمو</h2>
              <div className="w-1 h-6 bg-primary rounded-full" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
              <SubscribersRegionChart />
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
              <SubscribersCategoryChart />
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
              <GrowthLineChart />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <h2 className="text-lg font-bold text-foreground">تحليل الإعارات</h2>
              <div className="w-1 h-6 bg-primary rounded-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
                <LateBorrowsChart />
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
                <TopBorrowersChart />
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
              <BorrowsActivityChart />
            </div>
          </section>

        </div>
      </div>
  );
};

export default Index;