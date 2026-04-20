import { useState, useEffect } from "react";
import { lookupApi } from "../lib/api"; 
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/ui/dialog";
import {
  Loader2, Plus, Trash2, Edit2, ArrowRight,
  MapPin, Banknote, BookOpen, CreditCard, Layers, Tag, UserCheck, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



const CATEGORIES = [
  { id: "MemberClassification", title: "فئة المشترك", endpoint: "/MemberClassification", idField: "memberClassificationID", nameField: "memberClassificationName", icon: UserCheck },
  { id: "AuthorRole", title: "دور المؤلف", endpoint: "/AuthorRole", idField: "authorRoleID", nameField: "roleName", apiNameField: "AuthorRoleName", icon: Tag },
  { id: "AuthorType", title: "صفة المؤلف", endpoint: "/AuthorType", idField: "authorTypeID", nameField: "authorTypeName", icon: ShieldCheck },
  { id: "MaterialType", title: "نوع المادة", endpoint: "/MaterialType", idField: "materialTypeId", nameField: "materialName", apiNameField: "MaterialTypeName", icon: Layers },
  { id: "RemoveReason", title: "أسباب الإخراج", endpoint: "/RemoveReason", idField: "removeReasonID", nameField: "removeReasonName", icon: BookOpen },
  { id: "City", title: "المحافظة", endpoint: "/City", idField: "cityID", nameField: "cityName", icon: MapPin },
  { id: "FineType", title: "نوع الغرامة", endpoint: "/FineType", idField: "fineTypeID", nameField: "fineTypeName", icon: Banknote },
  { id: "BookCondition", title: "حالة الكتاب", endpoint: "/BookCondition", idField: "bookConditionID", nameField: "bookConditionName", icon: Tag },
  { id: "PaymentMethod", title: "طريقة الدفع", endpoint: "/PaymentMethod", idField: "paymentMethodID", nameField: "paymentMethodName", icon: CreditCard },
  { id: "SubTitleType", title: "نوع العنوان", endpoint: "/SubTitleType", idField: "subTitleTypeId", nameField: "subTitleTypeName", icon: Tag },
];

export default function SelectManager() {
  const [selectedCat, setSelectedCat] = useState<typeof CATEGORIES[0] | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newValue, setNewValue] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (selectedCat) fetchItems();
  }, [selectedCat]);

  const fetchItems = async () => {
    if (!selectedCat) return;
    setLoading(true);
    try {
      const data = await lookupApi.getAll(selectedCat.endpoint);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "خطأ", description: "تعذر جلب البيانات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedCat || !newValue.trim()) return;
    try {
      const field = selectedCat.apiNameField || selectedCat.nameField;
      const result = await lookupApi.create(selectedCat.endpoint, field, newValue);
      setNewValue("");
      fetchItems();
      toast({ title: result?.message || "تمت الإضافة بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "فشل في الإضافة", variant: "destructive" });
    }
  };

  const openEdit = (item: any) => {
    if (!selectedCat) return;
    setEditingItem(item);
    setEditValue(item[selectedCat.nameField]);
    setEditDialogOpen(true);
  };

  const openDelete = (item: any) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCat || !editingItem || !editValue.trim()) return;
    const idValue = Number(editingItem[selectedCat.idField]);
    const field = selectedCat.apiNameField || selectedCat.nameField;
    setIsSaving(true);
    try {
      const result = await lookupApi.update(selectedCat.endpoint, selectedCat.idField, idValue, field, editValue);
      setEditDialogOpen(false);
      fetchItems();
      toast({ title: result?.message || "تم التعديل بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "تأكد من صحة البيانات", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCat || !deletingItem) return;
    const idValue = deletingItem[selectedCat.idField];
    setIsDeleting(true);
    try {
      const result = await lookupApi.delete(selectedCat.endpoint, idValue);
      fetchItems();
      toast({ title: result?.message || "تم الحذف بنجاح" });
      setDeleteDialogOpen(false);
    } catch {
      toast({ title: "خطأ", description: "لا يمكن حذف عنصر مرتبط ببيانات أخرى", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto text-right pb-20" dir="rtl">
      <AnimatePresence mode="wait">
        {!selectedCat ? (
          <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">

            {/* Header */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600 rounded-l-full" />
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Layers size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">إدارة قوائم النظام</h1>
                <p className="text-slate-400 font-bold text-sm mt-0.5">تحكم في خيارات القوائم المنسدلة والتصنيفات الأساسية</p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {CATEGORIES.map((cat) => (
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  key={cat.id}
                  onClick={() => setSelectedCat(cat)}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col items-center text-center gap-4 shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <cat.icon size={26} />
                  </div>
                  <span className="font-black text-slate-700 text-sm group-hover:text-indigo-600 leading-tight">{cat.title}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

        ) : (
          <motion.div key="details" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-md">
                  <selectedCat.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{selectedCat.title}</h2>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black">{items.length} خيار</span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCat(null)} className="rounded-2xl gap-2 font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                العودة <ArrowRight size={18} />
              </Button>
            </div>

            {/* Add Input */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-sm font-black text-slate-500 mb-3">إضافة خيار جديد</p>
              <div className="flex gap-3">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder={`اكتب اسم جديد لـ ${selectedCat.title}...`}
                  className="h-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-300 font-bold text-right px-5 flex-1 transition-all"
                />
                <Button
                  onClick={handleAdd}
                  disabled={!newValue.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 font-black h-12 shadow-md disabled:opacity-40"
                >
                  <Plus size={20} className="ml-1.5" /> إضافة
                </Button>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 min-h-[300px]">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-3">
                  <Layers size={40} />
                  <p className="font-black text-sm">لا توجد خيارات بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <motion.div
                      layout
                      key={item[selectedCat.idField]}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDelete(item)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                      <span className="font-black text-slate-700">{item[selectedCat.nameField]}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ديالوج التعديل ===== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">تعديل البيانات</DialogTitle>
          </DialogHeader>
          <div className="py-5">
            <label className="block text-sm font-black text-slate-500 mb-2">الاسم الجديد لـ {selectedCat?.title}</label>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              className="h-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-300 text-right font-bold transition-all"
            />
          </div>
          <DialogFooter className="gap-3 sm:justify-start">
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} className="font-black text-slate-400 rounded-2xl flex-1">إلغاء</Button>
            <Button onClick={handleUpdate} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 font-black px-8 rounded-2xl flex-[2]">
              {isSaving ? <Loader2 className="animate-spin" /> : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== ديالوج الحذف ===== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-[2rem] p-8 text-right border-none shadow-2xl" dir="rtl">
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
              <Trash2 size={28} className="text-rose-500" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-slate-800">تأكيد الحذف</h3>
              <p className="text-slate-400 font-bold text-sm">
                هل تريد حذف
                <span className="text-slate-700 mx-1">
                  "{deletingItem && selectedCat ? deletingItem[selectedCat.nameField] : ""}"
                </span>
                ؟
              </p>
              <p className="text-xs text-rose-400 font-bold">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 h-12 rounded-2xl font-black text-slate-500 hover:bg-slate-100"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-[2] h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 font-black text-white shadow-lg shadow-rose-100"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : "نعم، احذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}