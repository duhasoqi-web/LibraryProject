import { useEffect, useState } from "react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { UserCircle, Phone, CreditCard, Calendar, Hash, ShieldCheck, UserCheck } from "lucide-react";

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // جلب التوكن (تأكد من المسمى الذي تستخدمه في مشروعك، غالباً 'token')
        const token = localStorage.getItem("token");

        const res = await fetch("/api/Employee/employee-profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });

        // معالجة حالة عدم المصداقية
        if (res.status === 401) {
          throw new Error("جلسة العمل انتهت، يرجى تسجيل الدخول مجدداً.");
        }

        if (!res.ok) throw new Error("حدث خطأ أثناء جلب البيانات.");

        const data = await res.json();
        setEmployee(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  if (loading) return <div className="p-10 text-center font-black animate-pulse">جاري تحميل الملف الشخصي...</div>;

  if (error) return (
    <div className="p-10 text-center space-y-4">
      <div className="text-rose-500 font-black text-xl">{error}</div>
      <Button 
        variant="outline" 
        className="rounded-xl border-indigo-200"
        onClick={() => window.location.href = "/login"}
      >
        الذهاب لصفحة الدخول
      </Button>
    </div>
  );

  if (!employee) return null;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" dir="rtl">
      <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-white">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-l from-indigo-700 via-indigo-500 to-indigo-400 p-10 text-white relative">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/30 shadow-inner">
              <UserCircle size={54} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black">
                {employee.firstName} {employee.familyName}
              </h2>
              <div className="flex gap-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4">
                  {employee.groupName}
                </Badge>
                <Badge variant="outline" className="border-white/40 text-white">
                  Lvl {employee.groupLevel}
                </Badge>
              </div>
            </div>
          </div>
          {/* خلفية جمالية خفيفة */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <ShieldCheck size={200} className="-ml-10 -mt-10 rotate-12" />
          </div>
        </div>

        <CardContent className="p-10 space-y-8">
          {/* شبكة المعلومات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem icon={<Hash size={22} />} label="الرقم الوظيفي" value={employee.empNumber} />
            <InfoItem icon={<CreditCard size={22} />} label="رقم الهوية" value={employee.idnumber} />
            <InfoItem icon={<Phone size={22} />} label="رقم التواصل" value={employee.phoneNumber} />
            <InfoItem icon={<Calendar size={22} />} label="تاريخ الميلاد" value={employee.birthDate} />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
              <ShieldCheck className="text-indigo-500" size={20} /> صلاحيات النظام الممنوحة
            </h3>

            <div className="flex flex-wrap gap-2">
              {employee.permissions?.length > 0 ? (
                  employee.permissions.map((perm, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-indigo-100/50">
                    {perm.replace('_Admin', '').replace('_books', '').replace('_borrows', '')}
                  </span>
                  ))
              ) : (
                  <span className="text-slate-400 text-sm italic">لا توجد صلاحيات معينة لهذا الحساب</span>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                <UserCheck size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">المسؤول عن الإنشاء</p>
                <p className="text-sm font-black text-slate-700">{employee.createdBy || "النظام التلقائي"}</p>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 font-bold">
              {employee.userStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors text-right flex flex-col justify-between min-h-[90px]">
      <p className="text-[11px] text-slate-400 font-bold mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-indigo-500/50">{icon}</span>
        <span className="font-black text-slate-700 text-lg leading-none">{value || "غير مسجل"}</span>
      </div>
    </div>
  );
}