import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { ChevronRight, Loader2, Plus, Trash2, UserPlus, ShieldCheck, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import logo from "@/assets/upscalemedia.png";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";




// --- دوال التنظيف ---
const cleanArabic = (val: string) => val.replace(/[^\u0600-\u06FF\s]/g, "");
const cleanEnglish = (val: string) => val.replace(/[^a-zA-Z\s]/g, "");
const cleanNumbers = (val: string, max: number) => val.replace(/\D/g, "").slice(0, max);

// --- حقل الإدخال ---
const Field = ({ label, value, onChange, type = "text", required = false, dir = "rtl", error, min, max }: any) => (
    <div className="flex flex-col gap-1.5 group">
      <Label className={`text-[10px] font-black uppercase tracking-widest pr-0.5 transition-colors duration-200 ${error ? "text-rose-500" : "text-slate-400 group-focus-within:text-secondary"}`}>
        {label} {required && <span className="text-rose-400">*</span>}
      </Label>
      <Input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className={`h-10 bg-slate-50/60 focus-visible:bg-white rounded-xl text-sm transition-all duration-200 shadow-none ${
              error
                  ? "border-rose-300 focus-visible:ring-rose-300 bg-rose-50/40"
                  : "border-slate-200 focus-visible:ring-secondary hover:border-slate-300"
          }`}
          dir={dir}
      />
      {error && (
          <p className="text-[10px] text-rose-500 font-bold pr-0.5 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
      )}
    </div>

);
// --- عنوان القسم ---
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-6">
      <div className="w-1 h-5 bg-secondary rounded-full" />
      <h3 className="text-sm font-black text-slate-700 tracking-tight uppercase">{children}</h3>
    </div>
);

// تاريخ اليوم كحد أقصى (لا يمكن اختيار تاريخ مستقبلي)
const today = new Date().toISOString().split("T")[0];

// حساب تاريخ الميلاد الذي يضمن أن عمر المشترك 10 سنوات على الأقل
const maxBirthDate = new Date();
maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 10);
const dynamicMaxDate = maxBirthDate.toISOString().split("T")[0];

// حد أدنى منطقي (مثلاً سنة 1920)
const dynamicMinDate = "1920-01-01";

const Signup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("subscriber");
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    memberInfo: {
      firstName: "", familyName: "", fatherName: "", grandfatherName: "",
      firstNameEn: "", familyNameEn: "",
      gender: "", birthDate: "", idnumber: "", job: "",
      cityId: undefined as number | undefined,
      neighborhood: "", street: "", village: "",
      phoneNumbers: [""]
    },
    guarantorInfo: {
      firstName: "", familyName: "", fatherName: "", grandfatherName: "",
      idnumber: "", job: "",
      neighborhood: "", street: "", village: "",
      phoneNumbers: [""]
    }
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("/api/City");
        if (Array.isArray(response.data)) setCities(response.data);
      } catch (error) { console.error("Cities fetch error", error); }
    };
    fetchCities();
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const m = formData.memberInfo;
    const g = formData.guarantorInfo;

    // --- المشترك ---
    if (!m.firstName.trim())       e["m_firstName"]       = "الاسم الأول مطلوب";
    if (!m.fatherName.trim())      e["m_fatherName"]      = "اسم الأب مطلوب";
    if (!m.grandfatherName.trim()) e["m_grandfatherName"] = "اسم الجد مطلوب";
    if (!m.familyName.trim())      e["m_familyName"]      = "اسم العائلة مطلوب";
    if (!m.firstNameEn.trim())     e["m_firstNameEn"]     = "الاسم بالإنجليزية مطلوب";
    if (!m.familyNameEn.trim())    e["m_familyNameEn"]    = "العائلة بالإنجليزية مطلوبة";
    if (!m.gender)                 e["m_gender"]          = "الجنس مطلوب";
    if (!m.birthDate)              e["m_birthDate"]       = "تاريخ الميلاد مطلوب";
    if (!m.idnumber || m.idnumber.length < 9) e["m_idnumber"] = "رقم الهوية يجب أن يكون 9 أرقام";
    if (!m.job.trim())             e["m_job"]             = "الوظيفة مطلوبة";
    if (!m.cityId)                 e["m_cityId"]          = "المدينة مطلوبة";
    m.phoneNumbers.forEach((p, i) => {
      if (!p || p.length < 10) e[`m_phone_${i}`] = "رقم غير مكتمل";
    });

    // --- الكفيل ---
    if (!g.firstName.trim())       e["g_firstName"]       = "الاسم الأول مطلوب";
    if (!g.fatherName.trim())      e["g_fatherName"]      = "اسم الأب مطلوب";
    if (!g.grandfatherName.trim()) e["g_grandfatherName"] = "اسم الجد مطلوب";
    if (!g.familyName.trim())      e["g_familyName"]      = "اسم العائلة مطلوب";
    if (!g.idnumber || g.idnumber.length < 9) e["g_idnumber"] = "رقم الهوية يجب أن يكون 9 أرقام";
    if (!g.job.trim())             e["g_job"]             = "الوظيفة مطلوبة";
    g.phoneNumbers.forEach((p, i) => {
      if (!p || p.length < 10) e[`g_phone_${i}`] = "رقم غير مكتمل";
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (section: 'memberInfo' | 'guarantorInfo', field: string, value: any) => {
    let cleanedValue = value;
    if (['firstName', 'familyName', 'fatherName', 'grandfatherName'].includes(field)) cleanedValue = cleanArabic(value);
    else if (['firstNameEn', 'familyNameEn'].includes(field)) cleanedValue = cleanEnglish(value);
    else if (field === 'idnumber') cleanedValue = cleanNumbers(value, 9);
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: cleanedValue } }));
  };

  const handlePhoneChange = (section: 'memberInfo' | 'guarantorInfo', index: number, value: string) => {
    const newPhones = [...formData[section].phoneNumbers];
    newPhones[index] = cleanNumbers(value, 10);
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], phoneNumbers: newPhones } }));
  };

  const handleSubmit = async () => {
    const valid = validate();
    if (!valid) {
      // إذا في أخطاء في بيانات المشترك، انتقل لتبويبه
      const memberErrorKeys = ["m_firstName","m_fatherName","m_grandfatherName","m_familyName","m_firstNameEn","m_familyNameEn","m_gender","m_birthDate","m_idnumber","m_job","m_cityId"];
      const hasMemberErrors = memberErrorKeys.some(k => {
        const e: Record<string, string> = {};
        const m = formData.memberInfo;
        if (!m.firstName.trim()) e["m_firstName"] = "x";
        if (!m.fatherName.trim()) e["m_fatherName"] = "x";
        if (!m.grandfatherName.trim()) e["m_grandfatherName"] = "x";
        if (!m.familyName.trim()) e["m_familyName"] = "x";
        if (!m.firstNameEn.trim()) e["m_firstNameEn"] = "x";
        if (!m.familyNameEn.trim()) e["m_familyNameEn"] = "x";
        if (!m.gender) e["m_gender"] = "x";
        if (!m.birthDate) e["m_birthDate"] = "x";
        if (!m.idnumber || m.idnumber.length < 9) e["m_idnumber"] = "x";
        if (!m.job.trim()) e["m_job"] = "x";
        if (!m.cityId) e["m_cityId"] = "x";
        return e[k];
      });
      if (hasMemberErrors) setActiveTab("subscriber");
      toast({ variant: "destructive", title: "يرجى تصحيح الأخطاء", description: "بعض الحقول المطلوبة فارغة أو غير صحيحة." });
      return;
    }
    setIsLoading(true);
    try {
      await axios.post("/api/Subscription/online/request", formData);
      toast({ title: "تم بنجاح", description: "تم إرسال طلب الاشتراك بنجاح." });
      navigate("/login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: error.response?.data?.message || "تأكد من الاتصال بالسيرفر." });
    } finally { setIsLoading(false); }
  };

  const steps = [
    { label: "البيانات الشخصية", icon: <UserPlus size={14} />, tab: "subscriber" },
    { label: "بيانات الكفيل", icon: <ShieldCheck size={14} />, tab: "guarantor" },
  ];

  return (
      <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30 flex flex-col items-center justify-center p-3 md:p-6" dir="rtl">

        <div className="w-full max-w-5xl">
          {/* Main Card */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/80 flex flex-col md:flex-row overflow-hidden border border-slate-100">

            {/* ─── Sidebar ─── */}
            <div className="md:w-[32%] bg-primary relative flex flex-col overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-24 -translate-x-12" />
              <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-white/3 -translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10 flex flex-col h-full p-8">
                {/* Back button */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-white/50 hover:text-white mb-10 font-bold text-xs transition-colors duration-200 w-fit group"
                >
                  <ArrowRight size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  العودة للمكتبة
                </button>

                {/* Logo + Brand */}
                <div className="flex items-center gap-4 mb-10">
                  <img src={logo} alt="Logo" className="h-14 w-14 bg-white rounded-2xl p-1.5 shadow-xl shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">مكتبة</p>
                    <h1 className="text-xl font-black text-white leading-tight">التسجيل الإلكتروني</h1>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/55 text-xs leading-relaxed mb-10 font-medium">
                  أهلاً بك، يرجى تعبئة البيانات المطلوبة بدقة لإتمام طلب الاشتراك في المكتبة.
                </p>

                {/* Progress Steps */}
                <div className="space-y-3 mb-10">
                  {steps.map((step, i) => {
                    const isDone = activeTab === "guarantor" && step.tab === "subscriber";
                    const isActive = activeTab === step.tab;
                    return (
                        <button
                            key={step.tab}
                            onClick={() => setActiveTab(step.tab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-right ${
                                isActive
                                    ? "bg-white/15 text-white"
                                    : isDone
                                        ? "bg-white/8 text-white/60 hover:bg-white/12"
                                        : "text-white/40 hover:bg-white/8"
                            }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                              isDone ? "bg-emerald-400 text-white" : isActive ? "bg-white text-primary" : "bg-white/10 text-white/40"
                          }`}>
                            {isDone ? <CheckCircle2 size={14} /> : <span className="text-[11px] font-black">{i + 1}</span>}
                          </div>
                          <span className="text-xs font-black">{step.label}</span>
                          {isActive && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />}
                        </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
                  <p className="text-[10px] text-white/35 font-bold">لديك حساب بالفعل؟</p>
                  <Button
                      onClick={() => navigate("/login")}
                      variant="outline"
                      className="w-full h-10 border-white/20 bg-white/10 hover:bg-white hover:text-primary text-white transition-all duration-300 font-black text-xs rounded-xl"
                  >
                    تسجيل الدخول
                  </Button>
                </div>
              </div>
            </div>

            {/* ─── Form Area ─── */}
            <div className="md:w-[68%] flex flex-col">
              {/* Top bar */}
              <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    {activeTab === "subscriber" ? "بيانات المشترك" : "بيانات الكفيل الضامن"}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {activeTab === "subscriber" ? "الخطوة 1 من 2 — المعلومات الشخصية" : "الخطوة 2 من 2 — معلومات الكفيل"}
                  </p>
                </div>
                {/* Mini step indicators */}
                <div className="flex gap-2">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${activeTab === "subscriber" ? "w-8 bg-secondary" : "w-4 bg-slate-200"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${activeTab === "guarantor" ? "w-8 bg-secondary" : "w-4 bg-slate-200"}`} />
                </div>
              </div>

              {/* Scrollable form body */}
              <div className="flex-1 overflow-y-auto px-8 py-6 max-h-[75vh]">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <AnimatePresence mode="wait">
                    {activeTab === "subscriber" ? (
                        <motion.div
                            key="sub"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-10"
                        >
                          {/* القسم 1: الاسم */}
                          <div>
                            <SectionTitle>الاسم الرباعي</SectionTitle>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3"> 
                            <Field label="العائلة" value={formData.memberInfo.familyName} onChange={(v: any) => { handleInputChange('memberInfo', 'familyName', v); setErrors(e => ({...e, m_familyName: ""})); }} required error={errors["m_familyName"]} />
                              <Field label="اسم الجد" value={formData.memberInfo.grandfatherName} onChange={(v: any) => { handleInputChange('memberInfo', 'grandfatherName', v); setErrors(e => ({...e, m_grandfatherName: ""})); }} required error={errors["m_grandfatherName"]} />
                              <Field label="اسم الأب" value={formData.memberInfo.fatherName} onChange={(v: any) => { handleInputChange('memberInfo', 'fatherName', v); setErrors(e => ({...e, m_fatherName: ""})); }} required error={errors["m_fatherName"]} />
                              <Field label="الاسم الأول" value={formData.memberInfo.firstName} onChange={(v: any) => { handleInputChange('memberInfo', 'firstName', v); setErrors(e => ({...e, m_firstName: ""})); }} required error={errors["m_firstName"]} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <Field label="First Name (EN)" value={formData.memberInfo.firstNameEn} onChange={(v: any) => { handleInputChange('memberInfo', 'firstNameEn', v); setErrors(e => ({...e, m_firstNameEn: ""})); }} dir="ltr" required error={errors["m_firstNameEn"]} />
                              <Field label="Family Name (EN)" value={formData.memberInfo.familyNameEn} onChange={(v: any) => { handleInputChange('memberInfo', 'familyNameEn', v); setErrors(e => ({...e, m_familyNameEn: ""})); }} dir="ltr" required error={errors["m_familyNameEn"]} />
                            </div>
                          </div>

                          {/* القسم 2: المعلومات الشخصية */}
                          <div>
                            <SectionTitle>المعلومات الشخصية</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex flex-col gap-1.5 group">
                                <Label className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-200 ${errors["m_gender"] ? "text-rose-500" : "text-slate-400 group-focus-within:text-secondary"}`}>
                                  الجنس <span className="text-rose-400">*</span>
                                </Label>
                                <Select onValueChange={(v) => { handleInputChange('memberInfo', 'gender', v); setErrors(e => ({...e, m_gender: ""})); }} value={formData.memberInfo.gender}>
                                  <SelectTrigger className={`h-10 rounded-xl text-sm ${errors["m_gender"] ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-slate-50/60"}`}>
                                    <SelectValue placeholder="اختر..." />
                                  </SelectTrigger>
                                  <SelectContent className={"home-theme"}>
                                    <SelectItem value="ذكر">ذكر</SelectItem>
                                    <SelectItem value="أنثى">أنثى</SelectItem>
                                  </SelectContent>
                                </Select>
                                {errors["m_gender"] && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><span>⚠</span> {errors["m_gender"]}</p>}
                              </div>
                              <Field
                                  label="تاريخ الميلاد"
                                  type="date"
                                  value={formData.memberInfo.birthDate}
                                  onChange={(v: any) => {
                                    handleInputChange('memberInfo', 'birthDate', v);
                                    setErrors(e => ({...e, m_birthDate: ""}));
                                  }}
                                  required
                                  error={errors["m_birthDate"]}
                                  min={dynamicMinDate}
                                  max={dynamicMaxDate}
                              />
                              <Field label="رقم الهوية" value={formData.memberInfo.idnumber} onChange={(v: any) => { handleInputChange('memberInfo', 'idnumber', v); setErrors(e => ({...e, m_idnumber: ""})); }} required error={errors["m_idnumber"]} />
                            </div>
                          </div>

                          {/* القسم 3: العنوان والعمل */}
                          <div>
                            <SectionTitle>العنوان والعمل</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div className="flex flex-col gap-1.5 group">
                                <Label className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-200 ${errors["m_cityId"] ? "text-rose-500" : "text-slate-400 group-focus-within:text-secondary"}`}>
                                  المدينة <span className="text-rose-400">*</span>
                                </Label>
                                <Select onValueChange={(v) => { setFormData(p => ({...p, memberInfo: {...p.memberInfo, cityId: parseInt(v)}})); setErrors(e => ({...e, m_cityId: ""})); }} value={formData.memberInfo.cityId?.toString()}>
                                  <SelectTrigger className={`h-10 rounded-xl text-sm ${errors["m_cityId"] ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-slate-50/60"}`}>
                                    <SelectValue placeholder="اختر المدينة..." />
                                  </SelectTrigger>
                                  <SelectContent className={"home-theme"}>
                                    {cities.map(c => <SelectItem key={c.cityID} value={c.cityID.toString()}>{c.cityName}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                {errors["m_cityId"] && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><span>⚠</span> {errors["m_cityId"]}</p>}
                              </div>
                              <Field label="الوظيفة" value={formData.memberInfo.job} onChange={(v: any) => { handleInputChange('memberInfo', 'job', v); setErrors(e => ({...e, m_job: ""})); }} required error={errors["m_job"]} />
                            </div>
                            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <Field label="القرية" value={formData.memberInfo.village} onChange={(v: any) => handleInputChange('memberInfo', 'village', v)} />
                              <Field label="الحي" value={formData.memberInfo.neighborhood} onChange={(v: any) => handleInputChange('memberInfo', 'neighborhood', v)} />
                              <Field label="الشارع" value={formData.memberInfo.street} onChange={(v: any) => handleInputChange('memberInfo', 'street', v)} />
                            </div>
                          </div>

                          {/* القسم 4: الهواتف */}
                          <div>
                            <SectionTitle>أرقام التواصل</SectionTitle>
                            <div className="space-y-2 max-w-xs">
                              {formData.memberInfo.phoneNumbers.map((phone, idx) => (
                                  <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex gap-2 items-center">
                                      <Input
                                          value={phone}
                                          onChange={(e) => { handlePhoneChange('memberInfo', idx, e.target.value); setErrors(er => ({...er, [`m_phone_${idx}`]: ""})); }}
                                          placeholder="05XXXXXXXX"
                                          className={`h-10 rounded-xl text-sm ${errors[`m_phone_${idx}`] ? "border-rose-300 bg-rose-50/40 focus-visible:ring-rose-300" : "border-slate-200 bg-slate-50/60"}`}
                                      />
                                      {idx > 0 && (
                                          <Button variant="ghost" size="icon" onClick={() => setFormData(p => ({...p, memberInfo: {...p.memberInfo, phoneNumbers: p.memberInfo.phoneNumbers.filter((_, i) => i !== idx)}}))} className="text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl shrink-0">
                                            <Trash2 size={16} />
                                          </Button>
                                      )}
                                    </div>
                                    {errors[`m_phone_${idx}`] && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><span>⚠</span> {errors[`m_phone_${idx}`]}</p>}
                                  </div>
                              ))}
                              <button
                                  type="button"
                                  onClick={() => setFormData(p => ({...p, memberInfo: {...p.memberInfo, phoneNumbers: [...p.memberInfo.phoneNumbers, ""]}}))}
                                  className="flex items-center gap-2 text-xs font-bold text-slate-400 border border-dashed border-slate-300 hover:border-secondary hover:text-secondary hover:bg-secondary/5 rounded-xl px-4 py-2 mt-1 transition-all duration-200"
                              >
                                <Plus size={13} /> إضافة رقم
                              </button>
                            </div>
                          </div>

                          {/* Next */}
                          <div className="flex justify-end pt-2 border-t border-slate-100">
                            <Button onClick={() => setActiveTab("guarantor")} className="bg-secondary text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-secondary/20 hover:shadow-secondary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 gap-2">
                              بيانات الكفيل
                              <ChevronRight size={17} className="rotate-180" />
                            </Button>
                          </div>
                        </motion.div>

                    ) : (
                        <motion.div
                            key="gua"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-10"
                        >
                          {/* القسم 1: اسم الكفيل */}
                          <div>
                            <SectionTitle>الاسم الرباعي للكفيل</SectionTitle>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Field label="العائلة" value={formData.guarantorInfo.familyName} onChange={(v: any) => { handleInputChange('guarantorInfo', 'familyName', v); setErrors(e => ({...e, g_familyName: ""})); }} required error={errors["g_familyName"]} />
                              <Field label="اسم الجد" value={formData.guarantorInfo.grandfatherName} onChange={(v: any) => { handleInputChange('guarantorInfo', 'grandfatherName', v); setErrors(e => ({...e, g_grandfatherName: ""})); }} required error={errors["g_grandfatherName"]} />
                              <Field label="اسم الأب" value={formData.guarantorInfo.fatherName} onChange={(v: any) => { handleInputChange('guarantorInfo', 'fatherName', v); setErrors(e => ({...e, g_fatherName: ""})); }} required error={errors["g_fatherName"]} />
                              <Field label="الاسم الأول" value={formData.guarantorInfo.firstName} onChange={(v: any) => { handleInputChange('guarantorInfo', 'firstName', v); setErrors(e => ({...e, g_firstName: ""})); }} required error={errors["g_firstName"]} />
                            </div>
                          </div>

                          {/* القسم 2: معلومات الكفيل */}
                          <div>
                            <SectionTitle>المعلومات الشخصية للكفيل</SectionTitle>
                            <div className="grid md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <Field label="رقم الهوية" value={formData.guarantorInfo.idnumber} onChange={(v: any) => { handleInputChange('guarantorInfo', 'idnumber', v); setErrors(e => ({...e, g_idnumber: ""})); }} required error={errors["g_idnumber"]} />
                              <Field label="الوظيفة" value={formData.guarantorInfo.job} onChange={(v: any) => { handleInputChange('guarantorInfo', 'job', v); setErrors(e => ({...e, g_job: ""})); }} required error={errors["g_job"]} />
                            </div>
                          </div>

                          {/* القسم 3: عنوان الكفيل */}
                          <div>
                            <SectionTitle>عنوان سكن الكفيل</SectionTitle>
                            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <Field label="القرية" value={formData.guarantorInfo.village} onChange={(v: any) => handleInputChange('guarantorInfo', 'village', v)} />
                              <Field label="الحي" value={formData.guarantorInfo.neighborhood} onChange={(v: any) => handleInputChange('guarantorInfo', 'neighborhood', v)} />
                              <Field label="الشارع" value={formData.guarantorInfo.street} onChange={(v: any) => handleInputChange('guarantorInfo', 'street', v)} />
                            </div>
                          </div>

                          {/* القسم 4: هواتف الكفيل */}
                          <div>
                            <SectionTitle>أرقام تواصل الكفيل</SectionTitle>
                            <div className="space-y-2 max-w-xs">
                              {formData.guarantorInfo.phoneNumbers.map((phone, idx) => (
                                  <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex gap-2 items-center">
                                      <Input
                                          value={phone}
                                          onChange={(e) => { handlePhoneChange('guarantorInfo', idx, e.target.value); setErrors(er => ({...er, [`g_phone_${idx}`]: ""})); }}
                                          placeholder="05XXXXXXXX"
                                          className={`h-10 rounded-xl text-sm ${errors[`g_phone_${idx}`] ? "border-rose-300 bg-rose-50/40 focus-visible:ring-rose-300" : "border-slate-200 bg-slate-50/60"}`}
                                      />
                                      {idx > 0 && (
                                          <Button variant="ghost" size="icon" onClick={() => setFormData(p => ({...p, guarantorInfo: {...p.guarantorInfo, phoneNumbers: p.guarantorInfo.phoneNumbers.filter((_, i) => i !== idx)}}))} className="text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl shrink-0">
                                            <Trash2 size={16} />
                                          </Button>
                                      )}
                                    </div>
                                    {errors[`g_phone_${idx}`] && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><span>⚠</span> {errors[`g_phone_${idx}`]}</p>}
                                  </div>
                              ))}
                              <button
                                  type="button"
                                  onClick={() => setFormData(p => ({...p, guarantorInfo: {...p.guarantorInfo, phoneNumbers: [...p.guarantorInfo.phoneNumbers, ""]}}))}
                                  className="flex items-center gap-2 text-xs font-bold text-slate-400 border border-dashed border-slate-300 hover:border-secondary hover:text-secondary hover:bg-secondary/5 rounded-xl px-4 py-2 mt-1 transition-all duration-200"
                              >
                                <Plus size={13} /> إضافة رقم
                              </button>
                            </div>
                          </div>

                          {/* Submit */}
                          <div className="pt-2 border-t border-slate-100 space-y-3">
                            <Button
                                disabled={isLoading}
                                onClick={handleSubmit}
                                className="w-full h-12 bg-secondary text-base font-black rounded-xl shadow-xl shadow-secondary/20 hover:shadow-secondary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 gap-2"
                            >
                              {isLoading
                                  ? <><Loader2 className="animate-spin" size={18} /> جارٍ الإرسال...</>
                                  : "إرسال طلب الاشتراك"
                              }
                            </Button>
                            <button
                                onClick={() => setActiveTab("subscriber")}
                                className="w-full text-xs font-bold text-slate-400 hover:text-secondary transition-colors flex items-center justify-center gap-1.5"
                            >
                              <ChevronRight size={14} />
                              تعديل بيانات المشترك الشخصية
                            </button>
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </Tabs>
              </div>
            </div>
          </div>

          {/* ─── Footer ─── */}
          <div className="mt-6 px-2">
            <p className="text-[11px] md:text-[12px] text-slate-400 leading-relaxed font-bold border-t border-slate-200/60 pt-5 text-center">
              © {new Date().getFullYear()} جميع حقوق الملكية الفكرية محفوظة وفقًا لمذكرة التفاهم{" "}
              <br className="hidden md:block" />
              الموقعة بين جامعة فلسطين التقنية – خضوري وبلدية طولكرم.
            </p>
          </div>
        </div>
      </div>
      </HomeLayout>
        );
};

export default Signup;