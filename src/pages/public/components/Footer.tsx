import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { useFooter } from "@/pages/public/lib/use-api";



const Footer = () => {
  const { data: footerData, isLoading } = useFooter();

  return (
    <footer className="w-full bg-slate-900 text-slate-200 border-t mt-auto" dir="rtl">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-right">
          
          {/* قسم عن المكتبة */}
          <div className="space-y-4">
            <h6 className="text-xl font-bold text-secondary">عن المكتبة</h6>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin opacity-50 mx-auto md:mx-0" />
            ) : (
              <p className="leading-relaxed text-sm opacity-80 max-w-sm mx-auto md:mx-0">
                {footerData?.about || "مكتبة بلدية طولكرم صرح ثقافي عريق يخدم الباحثين والقراء."}
              </p>
            )}
          </div>

          {/* قسم تواصل معنا */}
          <div className="space-y-4">
            <h6 className="text-xl font-bold text-secondary">تواصل معنا</h6>
            <ul className="space-y-3 text-sm opacity-80">
              {footerData?.location && (
                <li className="flex items-center justify-center gap-3 md:justify-start">
                  <MapPin size={18} className="text-secondary shrink-0" />
                  <span>{footerData.location}</span>
                </li>
              )}
              {footerData?.phone && (
                <li className="flex items-center justify-center gap-3 md:justify-start">
                  <Phone size={18} className="text-secondary shrink-0" />
                  <span dir="ltr">{footerData.phone}</span>
                </li>
              )}
              {footerData?.email && (
                <li className="flex items-center justify-center gap-3 md:justify-start">
                  <Mail size={18} className="text-secondary shrink-0" />
                  <span>{footerData.email}</span>
                </li>
              )}
              {isLoading && <Loader2 className="h-5 w-5 animate-spin opacity-50 mx-auto md:mx-0" />}
            </ul>
          </div>

          {/* روابط سريعة */}
          <div className="space-y-4">
            <h6 className="text-xl font-bold text-secondary">روابط سريعة</h6>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-1">
              {[
                { to: "/", label: "الرئيسية" },
                { to: "/about", label: "عن المكتبة" },
                { to: "/search", label: "بحث عن كتاب" },
                { to: "/posts", label: "الأخبار" },
                { to: "/contact", label: "تواصل معنا" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="opacity-70 transition-all hover:text-secondary hover:opacity-100 hover:mr-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* حقوق الملكية */}
      <div className="bg-slate-950/50 py-6 text-center text-[12px] opacity-60 border-t border-white/5">
        <div className="container mx-auto px-4">
          <p className="leading-loose">
            © {new Date().getFullYear()} جميع حقوق الملكية الفكرية محفوظة وفقًا لمذكرة التفاهم
            <br className="md:hidden" />
            <span className="hidden md:inline"> | </span>
            الموقعة بين جامعة فلسطين التقنية – خضوري وبلدية طولكرم.
          </p>
        </div>
      </div>
    </footer>

  );
};

export default Footer;