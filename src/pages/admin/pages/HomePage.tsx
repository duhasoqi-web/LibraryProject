import { ExternalLink, Globe, Pencil, Info } from "lucide-react";

export default function CmsPage() {
  const CMS_URL = "http://librarytest.runasp.net/manager/login?ReturnUrl=%2Fmanager"; 

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">إدارة محتوى الموقع</h2>
            <p className="text-muted-foreground text-sm mt-0.5">تعديل محتوى الصفحة الرئيسية</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">

          {/* معلومات */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-200">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              من خلال هذه الصفحة يمكنك الوصول إلى لوحة تحرير محتوى الموقع وتعديل النصوص والصور والمحتوى الظاهر للزوار.
            </div>
          </div>

          {/* الرابط */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">رابط لوحة التحرير</label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
              <code className="flex-1 text-xs text-muted-foreground truncate" dir="ltr">
                {CMS_URL}
              </code>
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* زر الدخول */}
          <a
            href={CMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            <Pencil className="w-4 h-4" />
            فتح لوحة التحرير
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

      </div>
    </div>
  );
}