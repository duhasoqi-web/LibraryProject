import { useState } from "react";
import { Book, User, ArrowLeftRight } from "lucide-react";
import LoanRequestsTab from "@/pages/Borrow/components/tabs/LoanRequestsTab";
import SubscribersTab from "@/pages/Borrow/components/tabs/SubscribersTab";
import "@/Index.css";

export default function OnlineRequestsPage() {
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  const canManageLoans = permissions.includes("Handle-Online-Borrow_borrows");
  const canManageSubscriptions = permissions.includes("Handle-Online-Subscription_Subscriptions");

  const [tab, setTab] = useState<"loans" | "subscribers" | null>(() => {
    if (canManageLoans) return "loans";
    if (canManageSubscriptions) return "subscribers";
    return null;
  });

  if (!canManageLoans && !canManageSubscriptions) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500 font-bold">
        ليس لديك صلاحية للوصول إلى أي من خدمات مركز طلبات الأونلاين.
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-7xl space-y-6" dir="rtl">
      {/* 1. رأس الصفحة (Header) */}
      <div className="flex flex-col gap-1 border-b pb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                مركز طلبات الأونلاين
              </h1>
              <p className="text-slate-500 font-medium">
                إدارة طلبات الإعارة الخارجية واشتراكات الأعضاء الجدد
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm border border-slate-200 rounded-2xl w-full max-w-md shadow-sm">
        {canManageLoans && (
          <button
            onClick={() => setTab("loans")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              tab === "loans"
                ? "bg-white text-primary shadow-md ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <Book className={`w-4 h-4 ${tab === "loans" ? "animate-pulse" : ""}`} />
            طلبات الإعارة
          </button>
        )}

        {canManageSubscriptions && (
          <button
            onClick={() => setTab("subscribers")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              tab === "subscribers"
                ? "bg-white text-primary shadow-md ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <User className={`w-4 h-4 ${tab === "subscribers" ? "animate-pulse" : ""}`} />
            طلبات الاشتراك
          </button>
        )}
      </div>

      <div className="relative min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {tab === "loans" && canManageLoans && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
            <LoanRequestsTab />
          </div>
        )}

        {tab === "subscribers" && canManageSubscriptions && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
            <SubscribersTab />
          </div>
        )}
      </div>
    </div>
  );
}