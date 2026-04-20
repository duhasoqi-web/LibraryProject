import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext"; // تأكد من المسار الصحيح للـ Context
import logo from "@/assets/main-logo.png";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    role: "Member", // القيمة الافتراضية
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // مسح الخطأ عند البدء بالكتابة
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // استدعاء دالة login من الـ Context
      // لاحظ: الـ Context سيقوم بتخزين كل شيء في localStorage تلقائياً
      await login(formData.userName, formData.password, formData.role);

      // التوجيه بناءً على الدور (الدور يأتي من الفورم أو من نتيجة الـ API)
      if (formData.role === "Employee" || formData.role === "Admin") {
        navigate("/admin/dash");
      } else {
        navigate("/member-profile");
      }
    } catch (err) {
      // التعامل مع الخطأ سواء كان من السيرفر أو الشبكة
      setError(err.response?.data?.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
      <HomeLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/20 py-6 overflow-hidden" dir="rtl">
        {/* الكارت الرئيسي */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-[390px] w-full bg-card p-6 md:p-8 rounded-2xl shadow-2xl border border-border relative"
        >
          {/* زر الرجوع للرئيسية */}
          <Link
              to="/"
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-full transition-all"
              title="الرجوع للرئيسية"
          >
            <ArrowRight size={18} />
          </Link>

          {/* اللوجو والعنوان */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-6"
          >
            <img src={logo} alt="Logo" className="h-14 md:h-16 mx-auto mb-3 object-contain" />
            <h2 className="text-xl font-black text-foreground">تسجيل الدخول</h2>
            <p className="text-muted-foreground mt-1 text-[12px] font-medium">مكتبة بلدية طولكرم</p>
          </motion.div>

          {/* رسالة الخطأ */}
          {error && (
              <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-4 p-3 bg-red-50 border-r-4 border-red-500 text-red-700 flex items-center gap-2 rounded-lg"
              >
                <AlertCircle size={16} />
                <span className="text-[12px] font-bold">{error}</span>
              </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* حقل اسم المستخدم */}
            <div className="space-y-1">
              <label className="block text-[12px] font-black text-foreground/80 pr-1">اسم المستخدم</label>
              <div className="relative group">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={16} />
                <input
                    type="text"
                    name="userName"
                    required
                    className="w-full pr-10 pl-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm"
                    placeholder="اسم المستخدم"
                    value={formData.userName}
                    onChange={handleChange}
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div className="space-y-1">
              <label className="block text-[12px] font-black text-foreground/80 pr-1">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={16} />
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="w-full pr-10 pl-10 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm"
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" className="text-[11px] font-bold text-secondary hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            {/* اختيار الدور (Switcher) */}
            <div className="p-1 bg-muted/50 rounded-xl border border-border/50 flex gap-1">
              <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "Member" })}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                      formData.role === "Member" ? "bg-card shadow text-secondary scale-[1.02]" : "text-muted-foreground"
                  }`}
              >
                عضو
              </button>
              <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "Employee" })}
                  className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                      formData.role === "Employee" ? "bg-card shadow text-secondary scale-[1.02]" : "text-muted-foreground"
                  }`}
              >
                موظف
              </button>
            </div>

            {/* زر تسجيل الدخول */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-secondary text-white rounded-xl font-bold text-sm shadow-lg hover:bg-secondary/90 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                  "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* رابط إنشاء الحساب */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
          >
            <p className="text-[12px] text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link to="/signup" className="text-secondary font-black hover:underline">
                أنشئ حساباً الآن
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* تذييل الصفحة (Copyrights) */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-10 text-center max-w-xl px-4"
        >
          <p className="text-[11px] md:text-[12px] text-muted-foreground leading-relaxed font-bold border-t border-muted/50 pt-6">
            © 2026 جميع حقوق الملكية الفكرية محفوظة لجامعة خضوري وبلدية طولكرم.
          </p>
        </motion.div>
      </div>
      </HomeLayout>
        );
};

export default Login;