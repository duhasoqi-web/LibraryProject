import React, { useState } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { BookOpen, UserPlus, CheckCircle, RefreshCw } from "lucide-react";
import { cn } from "@/pages/Borrow/lib/utils"
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog"
import "@/Index.css"

const inputClass = cn(
  "w-full px-4 py-3 rounded-xl border-2 border-border text-base transition-all duration-200",
  "bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-sm"
);

export default function LoanPage() {
  const [subscriberNumber, setSubscriberNumber] = useState("");
  const [bookBarcode, setBookBarcode] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // --- جلب بيانات المشتركين ---
  const loadMemberOptions = (inputValue: string) => {
    if (inputValue.length < 2) return Promise.resolve([]);
    return axios.get(`/api/Subscription/member-names?MemberName=${inputValue}`, {
      headers: getAuthHeaders(),
    }).then(res => res.data.map((m: any) => ({
      label: m.memberName || m.fullName, 
      value: m.memberId || m.memberNumber, // المعرف الأساسي
      displayNumber: m.memberNumber        // الرقم للعرض في الحقل اليدوي
    }))).catch(() => []);
  };

  // --- جلب بيانات الكتب ---
  const loadBookOptions = (inputValue: string) => {
    if (inputValue.length < 2) return Promise.resolve([]);
    return axios.get(`/api/Book/books/titles?BookTitle=${inputValue}`, {
      headers: getAuthHeaders(),
    })
    .then(res => res.data.map((b: any) => ({
      label: b.bookTitle || b.title,
      value: b.bookID || b.id,  // المعرف الأساسي (BookID)
      barcode: b.barcode        // الباركود للعرض في الحقل اليدوي
    })))
    .catch(() => []);
  };

  const handleFinalLoan = async () => {
    // التحقق من أن المستخدم اختار فعلياً من القائمة
    if (!selectedMember || !selectedBook) {
      toast.error("بيانات ناقصة", { 
        description: "يرجى اختيار العضو والكتاب من القائمة المنسدلة لضمان الحصول على المعرفات الصحيحة" 
      });
      return;
    }

    setSaving(true);
    try {
      // تجهيز البيانات بناءً على مواصفات السواجر (Swagger)
      const payload = {
        memberID: parseInt(selectedMember.value), // تحويل صريح لرقم
        bookID: parseInt(selectedBook.value),     // تحويل صريح لرقم
        memberNumber: subscriberNumber || null,    // إرسال نل إذا كان فارغاً
        barcode: bookBarcode || null               // إرسال نل إذا كان فارغاً
      };

      await axios.post("/api/Borrow/borrow", payload, { 
        headers: getAuthHeaders() 
      });

      toast.success("تمت عملية الإعارة بنجاح!");
      setConfirmOpen(false);
      
      // إعادة ضبط النموذج
      setBookBarcode("");
      setSubscriberNumber("");
      setSelectedMember(null);
      setSelectedBook(null);

    } catch (error: any) {
      console.error("Loan Error:", error.response?.data);
      const errorMsg = error.response?.data?.message || "فشلت العملية، تأكد من صحة البيانات أو أن الكتاب متاح";
      toast.error("خطأ في الإعارة", { description: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: '#e2e8f0',
      minHeight: '48px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#3b82f6' }
    }),
    placeholder: (base: any) => ({ ...base, fontSize: '14px' }),
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-primary">إعارة كتاب</h1>
        <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* قسم المستعير */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4 border-t-4 border-t-primary">
          <div className="flex items-center gap-2 text-primary font-bold">
            <UserPlus className="w-5 h-5" /> المستعير
          </div>
          
          <AsyncSelect
            cacheOptions
            isClearable
            loadOptions={loadMemberOptions}
            value={selectedMember}
            onChange={(opt: any) => {
              setSelectedMember(opt);
              setSubscriberNumber(opt ? opt.displayNumber : "");
            }}
            placeholder="ابحث عن العضو بالاسم..."
            loadingMessage={() => "جاري البحث..."}
            noOptionsMessage={() => "لا يوجد نتائج"}
            styles={customSelectStyles}
          />

          <input 
            type="text" 
            className={inputClass}
            value={subscriberNumber}
            readOnly // جعل الحقل للقراءة فقط لأنه يعتمد على الاختيار
            placeholder="رقم المشترك (يظهر تلقائياً)"
          />
        </div>

        {/* قسم الكتاب */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4 border-t-4 border-t-orange-500">
          <div className="flex items-center gap-2 text-orange-500 font-bold">
            <BookOpen className="w-5 h-5" /> الكتاب
          </div>
          
          <AsyncSelect
            cacheOptions
            isClearable
            loadOptions={loadBookOptions}
            value={selectedBook}
            onChange={(opt: any) => {
              setSelectedBook(opt);
              setBookBarcode(opt ? opt.barcode : "");
            }}
            placeholder="ابحث عن الكتاب بالعنوان..."
            loadingMessage={() => "جاري البحث..."}
            noOptionsMessage={() => "لا يوجد نتائج"}
            styles={customSelectStyles}
          />

          <input 
            type="text" 
            className={inputClass}
            value={bookBarcode}
            readOnly // جعل الحقل للقراءة فقط
            placeholder="باركود الكتاب (يظهر تلقائياً)"
          />
        </div>
      </div>

      <button 
        onClick={() => setConfirmOpen(true)} 
        disabled={!selectedMember || !selectedBook}
        className={cn(
          "w-full py-5 text-white rounded-2xl font-black shadow-xl text-xl transition-all active:scale-[0.98]",
          (!selectedMember || !selectedBook) ? "bg-slate-300 cursor-not-allowed" : "bg-primary hover:opacity-90"
        )}
      >
        <CheckCircle className="inline-block ml-2 w-6 h-6" /> تأكيد الإعارة 
      </button>

      {/* مودال التأكيد */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-3xl max-w-md text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد بيانات الإعارة</DialogTitle>
          </DialogHeader>
          
          <div className="bg-slate-50 p-5 rounded-2xl border space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">اسم المستعير:</span>
              <b className="text-primary">{selectedMember?.label}</b>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">رقم المشترك:</span>
              <b className="text-slate-700">{subscriberNumber}</b>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">عنوان الكتاب:</span>
              <b className="text-orange-600">{selectedBook?.label}</b>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">الباركود:</span>
              <b className="text-slate-700">{bookBarcode}</b>
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-row gap-3">
            <button 
              onClick={() => setConfirmOpen(false)} 
              className="flex-1 py-3 rounded-xl border-2 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button 
              onClick={handleFinalLoan} 
              disabled={saving} 
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
            >
              {saving ? "جاري المعالجة..." : "إتمام ✅"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}