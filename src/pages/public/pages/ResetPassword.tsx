import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // الأنميشن هان
import axios from "axios";
import logo from "@/assets/main-logo.webp";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";




const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        code: searchParams.get("code") || "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return setError("كلمات المرور غير متطابقة");
        }

        setLoading(true);
        setError("");

        try {
            await axios.put("/api/Auth/change-password", {
                code: formData.code,
                newPassword: formData.newPassword
            });

            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "الكود غير صحيح أو انتهت صلاحيته");
        } finally {
            setLoading(false);
        }
    };

    return (
        <HomeLayout>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/20 py-6 overflow-hidden">

            {/* أنميشن ظهور الكارت الرئيسي */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-[390px] w-full bg-card p-6 md:p-8 rounded-2xl shadow-2xl border border-border relative"
            >

                <Link to="/login" className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-full transition-all">
                    <ArrowRight size={18} />
                </Link>

                <div className="text-center mb-6">
                    <motion.img
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        src={logo} alt="Logo" className="h-14 md:h-16 mx-auto mb-3 object-contain"
                    />
                    <h2 className="text-xl font-black text-foreground">تحديث كلمة المرور</h2>
                    <p className="text-muted-foreground mt-1 text-[12px] font-medium">أدخل الكود وكلمة المرور الجديدة</p>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        /* أنميشن حالة النجاح */
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-4 py-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.1 }}
                                className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle size={32} />
                            </motion.div>
                            <p className="font-bold text-green-700">تم تغيير كلمة المرور بنجاح!</p>
                            <p className="text-xs text-muted-foreground">سيتم تحويلك لصفحة الدخول تلقائياً...</p>
                        </motion.div>
                    ) : (
                        /* أنميشن الفورم عند التحميل */
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {error && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-3 bg-red-50 border-r-4 border-red-500 text-red-700 flex items-center gap-2 rounded-lg text-[12px] font-bold"
                                >
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <div className="space-y-1">
                                <label className="block text-[12px] font-black text-foreground/80 pr-1">كود التحقق </label>
                                <small>(اول 5 ارقام من رقم الهوية مع رقمك الاشتراكي)</small>
                                <div className="relative group">
                                    <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pr-10 pl-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none text-sm font-mono tracking-widest"
                                        placeholder="أدخل الكود"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[12px] font-black text-foreground/80 pr-1">كلمة المرور الجديدة</label>
                                <div className="relative group">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pr-10 pl-10 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none text-sm"
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[12px] font-black text-foreground/80 pr-1">تأكيد كلمة المرور</label>
                                <div className="relative group">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pr-10 pl-10 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none text-sm"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-secondary text-white rounded-xl font-bold text-sm shadow-lg hover:bg-secondary/90 transition-all disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : (
                                    "تحديث كلمة المرور"
                                )}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* أنميشن الفوتر */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 text-center max-w-xl px-4"
            >
                <p className="text-[11px] md:text-[12px] text-muted-foreground/70 leading-relaxed font-bold border-t border-muted/50 pt-6">
                    © 2026 جميع حقوق الملكية الفكرية محفوظة وفقًا لمذكرة التفاهم <br className="hidden md:block"/> الموقعة بين جامعة فلسطين التقنية – خضوري وبلدية طولكرم.
                </p>
            </motion.div>
        </div>
        </HomeLayout>
    );
};

export default ResetPassword;