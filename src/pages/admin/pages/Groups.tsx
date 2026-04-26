import { useState, useEffect } from "react";
import { groupApi, permissionApi, Group, Permission } from "../lib/api";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { useToast } from "@/ui/use-toast";
import { Plus, Shield, Trash2, Loader2, Lock, AlertTriangle } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox";
import { motion } from "framer-motion";

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, groupId: 0, groupName: "" });
  const [form, setForm] = useState({ groupName: "", groupLevel: "0", permissionIds: [] as string[] });

  const { toast } = useToast();

  const showToast = (res: any, fallbackSuccess = "تمت العملية", fallbackError = "فشل العملية") => {
    toast({
      title: res?.message || (res?.success === false ? fallbackError : fallbackSuccess),
      variant: res?.success === false ? "destructive" : "default",
      duration: 1000
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [g, p] = await Promise.all([groupApi.getAll(), permissionApi.getAll()]);
      setGroups(Array.isArray(g) ? g : []);
      setPermissions(Array.isArray(p) ? p : []);
    } catch (err: any) {
      showToast(err, "تم", "فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (group: Group) => {
    setEditing(group);
    // جلب الـ IDs الحالية بناءً على الصلاحيات المسندة للمجموعة
    let currentIds: string[] = group.permissionIds
        ? group.permissionIds.map(String)
        : permissions
            .filter(p => group.permissions?.includes(p.permissionName))
            .map(p => String(p.permissionId));

    setForm({
      groupName: group.groupName,
      groupLevel: String(group.groupLevel || "0"),
      permissionIds: currentIds
    });

    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.groupName.trim()) {
      toast({ title: "يرجى إدخال اسم المجموعة", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, groupLevel: String(form.groupLevel) };
      let result;
      if (editing) {
        result = await groupApi.update({ ...payload, groupId: editing.groupId });
      } else {
        result = await groupApi.create(payload);
      }
      showToast(result, "تمت العملية بنجاح");
      fetchData();
      setDialogOpen(false);
    } catch (err: any) {
      showToast(err, "تم", "فشل الإجراء");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await groupApi.delete(deleteDialog.groupId);
      showToast(result, "تم الحذف بنجاح");
      fetchData();
    } catch (err: any) {
      showToast(err, "تم", "فشل الحذف");
    } finally {
      setDeleteDialog({ open: false, groupId: 0, groupName: "" });
    }
  };

  const getCategoryName = (permName: string) => {
    const name = permName.toLowerCase();
    if (name.includes('admin') || name.includes('user')) return 'إدارة النظام والمدراء';
    if (name.includes('book')) return 'إدارة الكتب والمخزون';
    if (name.includes('borrow')) return 'عمليات الإعارة والإرجاع';
    if (name.includes('sub')) return 'إدارة الاشتراكات والمشتركين';
    return 'صلاحيات عامة';
  };

  return (
      <div className="p-6 space-y-8" dir="rtl">
        {/* Header */}
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border">          <div>
            <h1 className="text-2xl font-black text-slate-800">إدارة المجموعات</h1>
            <p className="text-sm text-slate-400 font-bold">تنظيم الصلاحيات والأدوار</p>
          </div>
          <Button
              onClick={() => {
                setEditing(null);
                setForm({ groupName: "", groupLevel: "0", permissionIds: [] });
                setDialogOpen(true);
              }}
className="w-full sm:w-auto rounded-2xl bg-indigo-600 font-black h-12 px-6 shadow-lg shadow-indigo-100">  
            <Plus className="ml-2 w-5 h-5" /> إضافة مجموعة
          </Button>
        </div>

        {/* Grid List */}
        {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                  <motion.div
                      layout
                      key={group.groupId}
                      className="bg-white border rounded-[2.5rem] p-7 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between mb-5">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Shield size={24} />
                      </div>
                      <Badge variant="outline" className="rounded-xl px-4 py-1 border-slate-100 text-slate-500 font-black">
                        Lvl {group.groupLevel}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">{group.groupName}</h3>
                    <p className="text-xs text-slate-400 font-bold mb-6">
                      {group.permissions?.length || 0} صلاحية مفعلة
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => openEdit(group)} className="flex-1 rounded-xl bg-slate-50 text-indigo-600 hover:bg-indigo-50 font-black">
                        تعديل
                      </Button>
                      {group.groupName !== "SuperAdmin" && (
                          <Button
                              onClick={() => setDeleteDialog({ open: true, groupId: group.groupId, groupName: group.groupName })}
                              variant="ghost"
                              className="rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100"
                          >
                            <Trash2 size={18} />
                          </Button>
                      )}
                    </div>
                  </motion.div>
              ))}
            </div>
        )}

        {/* Main Dialog (Add/Edit) */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl h-[85vh] flex flex-col rounded-3xl p-0 border-none shadow-2xl bg-white overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
              <DialogTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Lock className="text-indigo-600" size={20} />
                {editing ? `تعديل مجموعة: ${editing.groupName}` : "إنشاء مجموعة جديدة"}
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8" dir="rtl">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3 space-y-2">
                  <Label className="font-bold text-slate-600 mr-1">اسم المجموعة</Label>
                  <Input
                      value={form.groupName}
                      onChange={e => setForm({ ...form, groupName: e.target.value })}
                      className="h-12 rounded-xl font-bold border-slate-200 focus:ring-2 focus:ring-indigo-500"
                      placeholder="مثال: مشرفين الكتب"
                  />
                </div>
                <div className="space-y-2">
  <Label className="font-bold text-slate-600 mr-1">المستوى</Label>
  <Input
    type="number"
    min={0}
    max={99}
    value={form.groupLevel}
    onChange={e => setForm({ ...form, groupLevel: e.target.value })}
    onKeyDown={e => {
      // منع كتابة رمز - فقط
      if (e.key === '-') {
        e.preventDefault();
      }
    }}
    className="h-12 text-center rounded-xl font-bold border-slate-200"
  />
</div>
              </div>

              <hr className="border-slate-100" />

              {/* Permissions Selection Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">توزيع الصلاحيات</h3>
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none rounded-lg px-3">
                    تم اختيار {form.permissionIds.length}
                  </Badge>
                </div>

                {/* Categorized Permissions */}
                {Array.from(new Set(permissions.map(p => getCategoryName(p.permissionName)))).map(category => (
                    <div key={category} className="space-y-4">
                      <h4 className="font-black text-sm text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissions
                            .filter(p => getCategoryName(p.permissionName) === category)
                            .map(permission => (
                                <div
                                    key={permission.permissionId}
                                    className={`flex items-center space-x-reverse space-x-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                                        form.permissionIds.includes(String(permission.permissionId))
                                            ? 'border-indigo-500 bg-indigo-50/30'
                                            : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                                    }`}
                                    onClick={() => {
                                      const id = String(permission.permissionId);
                                      const isSelected = form.permissionIds.includes(id);
                                      setForm(prev => ({
                                        ...prev,
                                        permissionIds: isSelected
                                            ? prev.permissionIds.filter(i => i !== id)
                                            : [...prev.permissionIds, id]
                                      }));
                                    }}
                                >
                                  <Checkbox
                                      id={`p-${permission.permissionId}`}
                                      checked={form.permissionIds.includes(String(permission.permissionId))}
                                      className="w-5 h-5 rounded-md border-slate-300 data-[state=checked]:bg-indigo-600"
                                  />
                                  <label className="text-sm font-bold text-slate-700 cursor-pointer flex-1">
                                    {permission.displayName || permission.permissionName}
                                  </label>
                                </div>
                            ))}
                      </div>
                    </div>
                ))}
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-slate-50 flex gap-3">
              <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-12 text-base rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : (editing ? "تحديث البيانات" : "إنشاء المجموعة")}
              </Button>
              <Button
                  onClick={() => setDialogOpen(false)}
                  variant="ghost"
                  className="h-12 rounded-xl font-bold text-slate-500"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
          <DialogContent className="max-w-md rounded-[2rem] text-right" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600 font-black">
                <AlertTriangle />
                تأكيد الحذف النهائي
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-slate-600 font-bold">
              هل أنت متأكد من حذف مجموعة <span className="text-rose-600 font-black underline">{deleteDialog.groupName}</span>؟
              <br />
              <small className="text-slate-400 font-medium text-xs mt-2 block">سيتم سحب جميع صلاحيات الموظفين التابعين لهذه المجموعة.</small>
            </div>
            <DialogFooter className="flex gap-3">
              <Button variant="destructive" onClick={handleDelete} className="flex-1 h-11 rounded-xl font-black">
                نعم، احذف المجموعة
              </Button>
              <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, groupId: 0, groupName: "" })} className="h-11 rounded-xl font-bold">
                تراجع
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}