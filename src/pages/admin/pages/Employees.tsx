import { useState, useEffect, useMemo } from "react";
import { employeeApi, groupApi, authApi, Employee, Group } from "../lib/api";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, Edit3, Loader2, LayoutGrid, Phone, CreditCard, Calendar, UserCheck, UserX, KeyRound, Hash, ShieldAlert, Lock, Eye, Copy, CheckCheck, Users } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// ===== مودال البروفايل =====
function ProfileModal({ emp, open, onClose }: { emp: Employee | null; open: boolean; onClose: () => void }) {
  if (!emp) return null;
  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className={`h-28 w-full relative ${emp.userStatus === "Active" ? "bg-gradient-to-l from-indigo-600 to-indigo-400" : "bg-gradient-to-l from-rose-600 to-rose-400"}`}>
            <div className="absolute -bottom-10 right-8">
              <Avatar className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl">
                <AvatarFallback className="bg-indigo-50 text-indigo-600 text-3xl font-black">{emp.firstName[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute top-4 left-4">
              <Badge className={`font-bold px-3 py-1 ${emp.userStatus === "Active" ? "bg-white/20 text-white" : "bg-white/20 text-white"}`}>
                {emp.userStatus === "Active" ? "● نشط" : "● معطل"}
              </Badge>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 space-y-6" dir="rtl">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {emp.firstName} {emp.fatherName} {emp.grandfatherName} {emp.familyName}
              </h2>
              <p className="text-slate-400 font-bold text-sm mt-0.5 tracking-widest uppercase">
                {emp.firstNameEn} {emp.familyNameEn}
              </p>
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 mt-2 text-xs px-3 py-1 rounded-full">
                {emp.groupName}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "الرقم الوظيفي", value: emp.empNumber, icon: <Hash size={15} className="text-indigo-400" /> },
                { label: "رقم الهوية", value: emp.idnumber, icon: <CreditCard size={15} className="text-indigo-400" /> },
                { label: "رقم الهاتف", value: emp.phoneNumber || "—", icon: <Phone size={15} className="text-indigo-400" /> },
                { label: "تاريخ الميلاد", value: new Date(emp.birthDate).toLocaleDateString("ar-EG"), icon: <Calendar size={15} className="text-indigo-400" /> },
              ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">{label}</p>
                    <div className="flex items-center justify-end gap-2 font-black text-slate-700 text-sm">
                      {value} {icon}
                    </div>
                  </div>
              ))}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 md:col-span-3">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">حالة الحساب</p>
                <div className="flex items-center gap-2 font-black text-slate-700 text-sm justify-end">
                  {emp.userStatus === "Active" ? "نشط — لديه صلاحية الدخول" : "معطل — الوصول محجوب"}
                  <div className={`w-2.5 h-2.5 rounded-full ${emp.userStatus === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                </div>
              </div>
            </div>

            <Button onClick={onClose} className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-white">
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}

// ===== مودال بيانات الدخول بعد الإنشاء =====
function CredentialModal({
                           open,
                           onClose,
                           credentials,
                         }: {
  open: boolean;
  onClose: () => void;
  credentials: { username: string; password: string } | null;
}) {
  const { toast } = useToast();
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const copy = (value: string, type: "user" | "pass") => {
    navigator.clipboard.writeText(value);
    if (type === "user") {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
    toast({ title: "تم النسخ ✓" });
  };

  if (!credentials) return null;

  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-gradient-to-l from-emerald-600 to-emerald-400 p-8 text-white text-right">
            <div className="flex items-center justify-end gap-3">
              <div>
                <h2 className="text-2xl font-black">بيانات الدخول</h2>
                <p className="text-emerald-100 text-sm font-bold mt-1">تم إنشاء الحساب بنجاح</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <UserCheck size={28} />
              </div>
            </div>
          </div>

          <div className="p-8 space-y-5" dir="rtl">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-bold leading-relaxed">
                احتفظ بهذه البيانات الآن — لن تظهر مرة أخرى بعد إغلاق هذه النافذة
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-slate-600 text-xs uppercase tracking-wider">اسم المستخدم</Label>
              <div className="flex gap-2">
                <Input
                    readOnly
                    value={credentials.username}
                    className="h-13 rounded-2xl bg-slate-50 border-2 border-slate-100 font-mono font-bold text-slate-800 text-left text-base"
                />
                <Button
                    variant="outline"
                    onClick={() => copy(credentials.username, "user")}
                    className="h-13 rounded-2xl px-4 border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                >
                  {copiedUser ? <CheckCheck size={18} className="text-emerald-600" /> : <Copy size={18} className="text-slate-500" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-slate-600 text-xs uppercase tracking-wider">كلمة المرور</Label>
              <div className="flex gap-2">
                <Input
                    readOnly
                    value={credentials.password}
                    className="h-13 rounded-2xl bg-slate-50 border-2 border-slate-100 font-mono font-bold text-slate-800 text-left text-base"
                />
                <Button
                    variant="outline"
                    onClick={() => copy(credentials.password, "pass")}
                    className="h-13 rounded-2xl px-4 border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                >
                  {copiedPass ? <CheckCheck size={18} className="text-emerald-600" /> : <Copy size={18} className="text-slate-500" />}
                </Button>
              </div>
            </div>

            <Button
                onClick={onClose}
                className="w-full h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-white mt-2"
            >
              فهمت، إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}

// ===== Validation Helpers =====
const arabicOnly = (val: string) => val.replace(/[^\u0600-\u06FF\s]/g, "");
const englishOnly = (val: string) => val.replace(/[^a-zA-Z\s]/g, "");
const numbersOnly = (val: string, maxLen?: number) => {
  const num = val.replace(/\D/g, "");
  return maxLen ? num.slice(0, maxLen) : num;
};
const today = new Date().toISOString().split("T")[0];

export default function Employees() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const hasPermission = (perm: string) =>
      currentUser?.permissions?.includes(perm) ||
      currentUser?.groupName === "SuperAdmin";

  const canToggle      = hasPermission("toggle-User_Admin");
  const canUpdate      = hasPermission("Update-Employee_Admin");
  const canCreate      = hasPermission("Create-Employee_Admin");
  const canChangeGroup = hasPermission("Change-Group_Admin");

  const iAmSuperAdmin = currentUser?.groupName === "SuperAdmin";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  // هل نجح جلب المجموعات من الـ API؟
  const [groupsAvailable, setGroupsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passDialogOpen, setPassDialogOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ username: string; password: string } | null>(null);

  // ===== state ديالوج تغيير المجموعة المستقل =====
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupEmp, setGroupEmp] = useState<Employee | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState(0);
  const [savingGroup, setSavingGroup] = useState(false);

  const [editing, setEditing] = useState<Employee | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [transferForm, setTransferForm] = useState({ newAdminId: "", currentPassword: "" });
  const [Code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    firstName: "", familyName: "", fatherName: "", grandfatherName: "",
    firstNameEn: "", familyNameEn: "", empNumber: "", phoneNumber: "",
    idnumber: "", birthDate: "", groupId: 0,
    userStatus: "Active" as "Active" | "Inactive",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (result: any) => {
    if (result?.message) {
      toast({
        title: result.message,
        variant: result?.success === false ? "destructive" : "default",
        duration:1000
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName) newErrors.firstName = "مطلوب";
    if (!form.familyName) newErrors.familyName = "مطلوب";
    if (!form.fatherName) newErrors.fatherName = "مطلوب";
    if (!form.grandfatherName) newErrors.grandfatherName = "مطلوب";
    if (!form.firstNameEn) newErrors.firstNameEn = "مطلوب";
    if (!form.familyNameEn) newErrors.familyNameEn = "مطلوب";
    if (!form.empNumber) newErrors.empNumber = "مطلوب";
    if (!form.idnumber || form.idnumber.length < 9) newErrors.idnumber = "9 أرقام على الأقل";
    if (!form.phoneNumber || form.phoneNumber.length < 10) newErrors.phoneNumber = "10 أرقام على الأقل";
    if (!form.birthDate) newErrors.birthDate = "مطلوب";
    // عند الإضافة فقط نتحقق من المجموعة
    if (!editing) {
      if (!form.groupId) newErrors.groupId = "اختر مجموعة";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== fetchData — كل API بشكل مستقل =====
  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب الموظفين — الأساس، لو فشل يعرض خطأ
      const empData = await employeeApi.getAll();
      setEmployees(Array.isArray(empData) ? empData : []);

      // جلب المجموعات بشكل مستقل — فشل صامت لو ما عنده صلاحية
      try {
        const groupData = await groupApi.lookup();
        if (Array.isArray(groupData) && groupData.length > 0) {
          setGroups(groupData);
          setGroupsAvailable(true);
        } else {
          setGroups([]);
          setGroupsAvailable(false);
        }
      } catch {
        // ما عنده صلاحية أو فشل الـ API — نكمل بدون مجموعات
        setGroups([]);
        setGroupsAvailable(false);
      }

    } catch {
      toast({ description: "فشل في جلب بيانات الموظفين", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!validateForm()) return toast({ description: "يرجى تعبئة جميع الحقول بشكل صحيح", variant: "destructive" });
    setSaving(true);
    try {
      if (editing) {
        // تعديل البيانات فقط — المجموعة لها ديالوج مستقل
        const result = await employeeApi.update({ ...form, employeeId: editing.employeeId } as Employee);
        showToast(result);
      } else {
        const result = await employeeApi.create(form);
        showToast(result);

        const username =
            result?.usserName || result?.userName || result?.username ||
            result?.data?.usserName || result?.data?.userName || result?.data?.username;
        const password = result?.password || result?.data?.password;

        if (result?.success !== false && username && password) {
          setNewCredentials({ username, password });
          setCredentialOpen(true);
        }
      }
      await fetchData();
      setDialogOpen(false);
      setErrors({});
    } catch (err: any) {
      toast({ description: err.message || "حدث خطأ ما", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ===== تغيير المجموعة المستقل =====
  const handleChangeGroup = async () => {
    if (!groupEmp || !selectedGroupId) return;
    setSavingGroup(true);
    try {
      const result = await employeeApi.changeGroup(groupEmp.employeeId, selectedGroupId);
      showToast(result);
      if (result?.success !== false) {
        await fetchData();
        setGroupDialogOpen(false);
        setGroupEmp(null);
      }
    } catch (err: any) {
      toast({ description: err.message || "فشل تغيير المجموعة", variant: "destructive" });
    } finally {
      setSavingGroup(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    if (!canToggle) return;
    try {
      const result = await authApi.toggleStatus(emp.userId ?? emp.employeeId);
      showToast(result);
      if (result?.success !== false) {
        setEmployees(prev =>
            prev.map(item =>
                item.employeeId === emp.employeeId
                    ? { ...item, userStatus: item.userStatus === "Active" ? "Inactive" : "Active" }
                    : item
            )
        );
      }
    } catch (err: any) {
      toast({ description: err.message || "فشل التحديث", variant: "destructive" });
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedEmp || !newPassword || !Code) return;
    setSaving(true);
    try {
      const result = await authApi.changePassword({ code: Code, newPassword });
      showToast(result);
      if (result?.success !== false) {
        setPassDialogOpen(false);
        setNewPassword("");
        setCode("");
      }
    } catch (err: any) {
      toast({ description: err.message || "فشل تغيير كلمة المرور", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.newAdminId || !transferForm.currentPassword)
      return toast({ description: "يرجى ملء جميع الحقول", variant: "destructive" });
    setSaving(true);
    try {
      const result = await employeeApi.transferOwnership({
        newAdminId: Number(transferForm.newAdminId),
        Password: transferForm.currentPassword,
      });
      showToast(result);
      setTransferOpen(false);
      if (result?.success !== false) window.location.reload();
    } catch (err: any) {
      toast({ description: err.message || "فشل النقل", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const groupedEmployees = useMemo(() => {
    const filtered = employees.filter(e =>
        `${e.firstName} ${e.familyName} ${e.empNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.reduce((acc, emp) => {
      const gName = emp.groupName || "عام";
      if (!acc[gName]) acc[gName] = [];
      acc[gName].push(emp);
      return acc;
    }, {} as Record<string, Employee[]>);
  }, [employees, searchTerm]);

  if (loading) return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
  );

  return (
      <div className="space-y-10 text-right pb-20 p-6" dir="rtl">

        <ProfileModal emp={selectedEmp} open={profileOpen} onClose={() => setProfileOpen(false)} />

        <CredentialModal
            open={credentialOpen}
            onClose={() => { setCredentialOpen(false); setNewCredentials(null); }}
            credentials={newCredentials}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-800">إدارة الموظفين</h1>
            <div className="flex gap-3 mt-2">
              <p className="text-slate-400 font-bold">إجمالي الكادر: {employees.length}</p>
              {iAmSuperAdmin && (
                  <Badge onClick={() => setTransferOpen(true)} className="bg-rose-50 text-rose-600 border-rose-100 cursor-pointer hover:bg-rose-100">
                    نقل الملكية <ShieldAlert size={14} className="mr-1" />
                  </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                  placeholder="ابحث..."
                  className="rounded-2xl bg-white border-2 border-slate-100 h-14 pr-12 focus:border-indigo-500 transition-all"
                  onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* زر إضافة موظف:
                - يظهر لو عنده صلاحية الإضافة
                - لو ما عنده صلاحية عرض المجموعات (groupsAvailable=false) → toast تحذيري بدل ما يفتح الديالوج */}
            {canCreate && (
                <Button
                    onClick={() => {
                      if (!groupsAvailable) {
                        toast({
                          title: "لا يمكن إضافة موظف",
                          description: "ليس لديك صلاحية عرض المجموعات الوظيفية — تواصل مع المدير",
                          variant: "destructive",
                        });
                        return;
                      }
                      setEditing(null);
                      setErrors({});
                      setForm({
                        firstName: "", familyName: "", fatherName: "", grandfatherName: "",
                        firstNameEn: "", familyNameEn: "", empNumber: "", phoneNumber: "",
                        idnumber: "", birthDate: "", groupId: groups[0]?.groupId || 0,
                        userStatus: "Active",
                      });
                      setDialogOpen(true);
                    }}
                    className="h-14 rounded-2xl bg-indigo-600 px-8 font-black"
                >
                  <UserPlus size={20} className="ml-2" /> موظف جديد
                </Button>
            )}
          </div>
        </div>

        {/* قائمة الموظفين */}
        <AnimatePresence>
          {Object.entries(groupedEmployees).map(([groupName, staff]) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={groupName} className="space-y-6">
                <div className="flex items-center gap-4 mr-4">
                  <div className="h-8 w-1.5 bg-indigo-500 rounded-full" />
                  <h2 className="text-xl font-black text-slate-700 flex items-center gap-2">
                    <LayoutGrid size={20} className="text-indigo-500" /> {groupName}
                    <Badge className="mr-2 bg-indigo-50 text-indigo-600 rounded-lg">{staff.length}</Badge>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {staff.map(emp => (
                      <motion.div key={emp.employeeId} whileHover={{ y: -4 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full rounded-r-full ${emp.userStatus === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />

                        <div className="flex justify-between items-start mb-5">
                          <div className="flex gap-4 cursor-pointer" onClick={() => { setSelectedEmp(emp); setProfileOpen(true); }}>
                            <Avatar className="w-14 h-14 rounded-2xl border-2 border-slate-50">
                              <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-xl">{emp.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-black text-slate-800">{emp.firstName} {emp.familyName}</h3>
                              <Badge className={`mt-1 text-xs font-bold ${emp.userStatus === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                {emp.userStatus === "Active" ? "نشط" : "معطل"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedEmp(emp); setProfileOpen(true); }} className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl w-9 h-9">
                              <Eye size={17} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedEmp(emp); setPassDialogOpen(true); }} className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl w-9 h-9">
                              <KeyRound size={17} />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-5">
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <Hash size={14} className="text-indigo-400" /> {emp.empNumber}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <Phone size={14} className="text-indigo-400" /> {emp.phoneNumber || "—"}
                          </div>
                        </div>

                        {/* ===== أزرار الكارت ===== */}
                        <div className="flex gap-2">

                          {/* زر تفعيل/تعطيل */}
                          <Button
                              disabled={!canToggle}
                              onClick={() => handleToggleStatus(emp)}
                              variant="outline"
                              className="flex-1 h-11 rounded-2xl font-bold border-2 text-sm"
                          >
                            {!canToggle
                                ? <Lock size={15} className="ml-1" />
                                : emp.userStatus === "Active"
                                    ? <UserX size={16} className="ml-1" />
                                    : <UserCheck size={16} className="ml-1" />
                            }
                            {!canToggle ? "مقيّد" : emp.userStatus === "Active" ? "تعطيل" : "تفعيل"}
                          </Button>

                          {/* زر تغيير المجموعة:
                              - عنده صلاحية + المجموعات متاحة → يفتح الديالوج
                              - عنده صلاحية + المجموعات مش متاحة → toast تحذيري
                              - ما عنده صلاحية → ما يظهر أصلاً */}
                          {canChangeGroup && (
                              <Button
                                  onClick={() => {
                                    if (!groupsAvailable) {
                                      toast({
                                        title: "لا يمكن تغيير المجموعة",
                                        description: "ليس لديك صلاحية عرض المجموعات الوظيفية — تواصل مع المدير",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    setGroupEmp(emp);
                                    setSelectedGroupId(emp.groupId);
                                    setGroupDialogOpen(true);
                                  }}
                                  className={`h-11 w-11 rounded-2xl transition-all ${
                                      groupsAvailable
                                          ? "bg-violet-100 hover:bg-violet-200 text-violet-600"
                                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  }`}
                                  title={groupsAvailable ? "تغيير المجموعة" : "غير متاح — لا توجد صلاحية عرض المجموعات"}
                              >
                                <Users size={16} />
                              </Button>
                          )}

                          {/* زر التعديل — يظهر فقط لو عنده صلاحية تعديل البيانات */}
                          {canUpdate && (
                              <Button
                                  onClick={() => {
                                    setEditing(emp);
                                    setErrors({});
                                    setForm({
                                      firstName: emp.firstName,
                                      familyName: emp.familyName,
                                      fatherName: emp.fatherName,
                                      grandfatherName: emp.grandfatherName,
                                      firstNameEn: emp.firstNameEn,
                                      familyNameEn: emp.familyNameEn,
                                      empNumber: emp.empNumber,
                                      phoneNumber: emp.phoneNumber,
                                      idnumber: emp.idnumber,
                                      birthDate: emp.birthDate.split("T")[0],
                                      groupId: emp.groupId,
                                      userStatus: emp.userStatus === "Active" ? "Active" : "Inactive",
                                    });
                                    setDialogOpen(true);
                                  }}
                                  className="h-11 w-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                                  title="تعديل البيانات"
                              >
                                <Edit3 size={16} />
                              </Button>
                          )}

                          {/* لو ما عنده لا تعديل ولا تغيير جروب → زر مقفل */}
                          {!canUpdate && !canChangeGroup && (
                              <Button disabled className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-400">
                                <Lock size={15} />
                              </Button>
                          )}

                        </div>
                      </motion.div>
                  ))}
                </div>
              </motion.div>
          ))}
        </AnimatePresence>

        {/* ===== ديالوج إضافة/تعديل موظف ===== */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-5xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] bg-white shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-black text-3xl text-right text-slate-900">
                {editing ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 mt-8 text-right" dir="rtl">

              {/* الصف الأول: الحقول العربية */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "الاسم الأول", key: "firstName" },
                  { label: "اسم الأب", key: "fatherName" },
                  { label: "اسم الجد", key: "grandfatherName" },
                  { label: "اسم العائلة", key: "familyName" },
                ].map(({ label, key }) => (
                    <div key={key} className="space-y-2">
                      <Label className="font-black text-slate-800 text-sm">{label} <span className="text-rose-500">*</span></Label>
                      <Input
                          value={(form as any)[key]}
                          onChange={e => setForm({ ...form, [key]: arabicOnly(e.target.value) })}
                          placeholder="الاسم بالعربي"
                          className={`h-14 rounded-2xl bg-indigo-50 border-2 font-bold transition-all shadow-inner px-4 focus:ring-2 focus:ring-indigo-300 ${errors[key] ? "border-rose-400 bg-rose-50" : "border-transparent"}`}
                      />
                      {errors[key] && <p className="text-[11px] text-rose-500 font-bold">{errors[key]}</p>}
                    </div>
                ))}
              </div>

              {/* الصف الثاني: الحقول الإنجليزية */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {[
                  { label: "Family Name (EN)", key: "familyNameEn" },
                  { label: "First Name (EN)", key: "firstNameEn" },
                ].map(({ label, key }) => (
                    <div key={key} className="space-y-2">
                      <Label className="font-black text-slate-800 text-sm">{label} <span className="text-rose-500">*</span></Label>
                      <Input
                          value={(form as any)[key]}
                          onChange={e => setForm({ ...form, [key]: englishOnly(e.target.value) })}
                          placeholder="English only"
                          className={`h-14 rounded-2xl bg-indigo-50 border-2 font-bold transition-all px-4 text-left shadow-inner focus:ring-2 focus:ring-indigo-300 ${errors[key] ? "border-rose-400 bg-rose-50" : "border-transparent"}`}
                      />
                      {errors[key] && <p className="text-[11px] text-rose-500 font-bold">{errors[key]}</p>}
                    </div>
                ))}
              </div>

              {/* الصف الثالث: الحقول الرقمية */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="font-black text-slate-800 text-sm">رقم الهوية <span className="text-rose-500">*</span></Label>
                  <Input
                      value={form.idnumber}
                      onChange={e => setForm({ ...form, idnumber: numbersOnly(e.target.value, 9) })}
                      maxLength={9}
                      className={`h-14 rounded-2xl bg-indigo-50 border-2 font-bold text-left px-4 shadow-inner transition-all focus:ring-2 focus:ring-indigo-300 ${errors.idnumber ? "border-rose-400 bg-rose-50" : "border-transparent"}`}
                  />
                  <p className="text-[11px] text-slate-500">{form.idnumber.length}/9</p>
                  {errors.idnumber && <p className="text-[11px] text-rose-500 font-bold">{errors.idnumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-slate-800 text-sm">رقم الهاتف <span className="text-rose-500">*</span></Label>
                  <Input
                      value={form.phoneNumber}
                      onChange={e => setForm({ ...form, phoneNumber: numbersOnly(e.target.value, 10) })}
                      maxLength={10}
                      className={`h-14 rounded-2xl bg-indigo-50 border-2 font-bold text-left px-4 shadow-inner transition-all focus:ring-2 focus:ring-indigo-300 ${errors.phoneNumber ? "border-rose-400 bg-rose-50" : "border-transparent"}`}
                  />
                  <p className="text-[11px] text-slate-500">{form.phoneNumber.length}/10</p>
                  {errors.phoneNumber && <p className="text-[11px] text-rose-500 font-bold">{errors.phoneNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-slate-800 text-sm">الرقم الوظيفي <span className="text-rose-500">*</span></Label>
                  <Input
                      value={form.empNumber}
                      onChange={e => setForm({ ...form, empNumber: numbersOnly(e.target.value) })}
                      className={`h-14 rounded-2xl bg-indigo-50 border-2 font-bold text-left px-4 shadow-inner transition-all focus:ring-2 focus:ring-indigo-300 ${errors.empNumber ? "border-rose-400 bg-rose-50" : "border-transparent"}`}
                  />
                  {errors.empNumber && <p className="text-[11px] text-rose-500 font-bold">{errors.empNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-slate-800 text-sm">تاريخ الميلاد <span className="text-rose-500">*</span></Label>
                  <Input
                      type="date"
                      value={form.birthDate}
                      max={today}
                      onChange={e => setForm({ ...form, birthDate: e.target.value })}
                      className={`h-14 rounded-2xl bg-indigo-50 border-2 font-bold px-4 shadow-inner transition-all focus:ring-2 focus:ring-indigo-300 ${errors.birthDate ? "border-rose-400 bg-rose-50" : "border-transparent"}`}
                  />
                  {errors.birthDate && <p className="text-[11px] text-rose-500 font-bold">{errors.birthDate}</p>}
                </div>
              </div>

              {/* حقل المجموعة — يظهر فقط عند الإضافة الجديدة */}
              {!editing && (
                  <div className="col-span-full space-y-3 bg-indigo-50 p-6 rounded-3xl border-2 border-dashed border-indigo-200 mt-4">
                    <Label className="font-black text-indigo-700 block mb-2">المجموعة الوظيفية <span className="text-rose-500">*</span></Label>
                    <Select value={String(form.groupId)} onValueChange={v => setForm({ ...form, groupId: Number(v) })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white border-none font-bold text-indigo-600 shadow-md">
                        <SelectValue placeholder="اختر المجموعة" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {groups.map(g => (
                            <SelectItem key={g.groupId} value={String(g.groupId)} className="font-bold py-2">{g.groupName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.groupId && <p className="text-[11px] text-rose-500 font-bold">{errors.groupId}</p>}
                  </div>
              )}
            </div>

            <DialogFooter className="mt-10 gap-4 flex justify-end">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-2xl h-14 px-8 font-bold text-slate-500 hover:bg-slate-100">إلغاء</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl h-14 px-12 font-black shadow-lg shadow-indigo-200 flex-1 text-white">
                {saving ? <Loader2 className="animate-spin ml-2" /> : editing ? "حفظ التعديلات" : "إضافة الموظف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== ديالوج تغيير المجموعة المستقل ===== */}
        <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
          <DialogContent className="rounded-[2.5rem] p-10 text-right max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl text-slate-800 flex items-center gap-2 justify-end">
                تغيير المجموعة الوظيفية <Users className="text-violet-600" />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4" dir="rtl">
              <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex items-start gap-3">
                <Users className="text-violet-600 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-violet-800 font-bold leading-relaxed">
                  تغيير مجموعة: <span className="text-indigo-600 font-black">{groupEmp?.firstName} {groupEmp?.familyName}</span>
                  <br />
                  <span className="text-violet-500 text-xs">المجموعة الحالية: {groupEmp?.groupName}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">اختر المجموعة الجديدة</Label>
                <Select
                    value={String(selectedGroupId)}
                    onValueChange={v => setSelectedGroupId(Number(v))}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 font-bold text-slate-700">
                    <SelectValue placeholder="اختر المجموعة" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {groups.map(g => (
                        <SelectItem key={g.groupId} value={String(g.groupId)} className="font-bold py-2">
                          {g.groupName}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setGroupDialogOpen(false)} className="h-12 rounded-2xl font-bold flex-1">إلغاء</Button>
              <Button
                  onClick={handleChangeGroup}
                  disabled={savingGroup || !selectedGroupId || selectedGroupId === groupEmp?.groupId}
                  className="h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black flex-[2] shadow-lg shadow-violet-100 text-white"
              >
                {savingGroup ? <Loader2 className="animate-spin" /> : "تأكيد التغيير"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== ديالوج تغيير كلمة المرور ===== */}
        <Dialog open={passDialogOpen} onOpenChange={setPassDialogOpen}>
          <DialogContent className="rounded-[2.5rem] p-10 text-right max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl text-slate-800 flex items-center gap-2 justify-end">
                تغيير كلمة المرور <KeyRound className="text-indigo-600" />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4" dir="rtl">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-800 font-bold leading-relaxed">
                  تغيير كلمة مرور: <span className="text-indigo-600">{selectedEmp?.firstName} {selectedEmp?.familyName}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">كلمة المرور الحالية</Label>
                <Input
                    type="password"
                    value={Code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    className="h-12 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">كلمة المرور الجديدة</Label>
                <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور قوية"
                    className="h-12 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setPassDialogOpen(false)} className="h-12 rounded-2xl font-bold flex-1">إلغاء</Button>
              <Button
                  onClick={handlePasswordChange}
                  disabled={saving || !newPassword || !Code}
                  className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black flex-[2] shadow-lg shadow-indigo-100"
              >
                {saving ? <Loader2 className="animate-spin" /> : "تحديث كلمة المرور"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== ديالوج نقل الملكية ===== */}
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogContent className="rounded-[2.5rem] p-8 text-right max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-rose-600 text-xl">نقل ملكية النظام</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm font-bold text-slate-500">تحذير: سيتم تحويل حسابك إلى موظف عادي ونقل الصلاحيات الكاملة للشخص المختار.</p>
              <Select onValueChange={v => setTransferForm({ ...transferForm, newAdminId: v })}>
                <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue placeholder="اختر المدير الجديد" /></SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.employeeId !== currentUser?.employeeId).map(e => (
                      <SelectItem key={e.employeeId} value={String(e.employeeId)}>{e.firstName} {e.familyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                  type="password"
                  placeholder="كلمة مرورك الحالية للتأكيد"
                  className="h-12 rounded-xl border-2"
                  onChange={e => setTransferForm({ ...transferForm, currentPassword: e.target.value })}
              />
            </div>
            <Button onClick={handleTransfer} disabled={saving} className="w-full h-12 bg-rose-600 hover:bg-rose-700 rounded-xl font-black">
              {saving ? <Loader2 className="animate-spin" /> : "تأكيد النقل النهائي"}
            </Button>
          </DialogContent>
        </Dialog>

      </div>
  );
}