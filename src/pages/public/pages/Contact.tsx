import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import HeroSection from "@/pages/public/components/HeroSection";
import { Card, CardContent } from "@/ui/card";
import { MapPin, Phone, Clock, MessageCircle, Mail, Facebook, Loader2 } from "lucide-react";
import { useContact } from "@/pages/public/lib/use-api";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";




const getImageUrl = (url) => {
  if (!url) return "/placeholder-image.jpg";
  let path = url;
  if (url.startsWith("~")) path = url.substring(1);
  if (url.startsWith("/")) path = url;
  return `/media${path.startsWith('/') ? path : '/' + path}`;
};

const Contact = () => {
  const { data: contact, isLoading } = useContact();

  if (isLoading) {
    return (
        /* أضفنا home-theme عشان يقرأ متغيرات الألوان والأنميشن من الـ CSS */
        <div className="home-theme flex min-h-screen flex-col bg-white" dir="rtl">
          <Header />
          <div className="flex-1 flex items-center justify-center bg-slate-50/30">
            {/* شيلنا الشفافية /40 عشان الـ CSS الجديد هو اللي يتحكم باللون والتوهج */}
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <Footer />
        </div>
    );
  }

  return (

      <HomeLayout>
        <div className="flex min-h-screen flex-col bg-white" dir="rtl">
          <Header />

          <HeroSection
              title={contact?.heading}
              subtitle={contact?.description}
              backgroundImage={contact?.primeImage ? getImageUrl(contact.primeImage) : undefined}
              minHeight="45vh"
          />

          <main className="flex-1 py-12 md:py-16 bg-slate-50/50">
            <div className="container max-w-2xl px-4 mx-auto">

              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6 md:p-8 space-y-1">

                  {/* العنوان */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group">
                    <MapPin className="shrink-0 text-secondary transition-transform group-hover:scale-110" size={18} />
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <strong className="font-extrabold text-slate-900 whitespace-nowrap">العنوان:</strong>
                      <span className="font-bold text-slate-600">{contact?.address}</span>
                    </div>
                  </div>

                  {/* الهاتف */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group">
                    <Phone className="shrink-0 text-secondary transition-transform group-hover:scale-110" size={18} />
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <strong className="font-extrabold text-slate-900 whitespace-nowrap">الهاتف:</strong>
                      <span className="font-bold text-slate-600" dir="ltr">{contact?.phone}</span>
                    </div>
                  </div>

                  {/* ساعات العمل */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group">
                    <Clock className="shrink-0 text-secondary transition-transform group-hover:scale-110" size={18} />
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <strong className="font-extrabold text-slate-900 whitespace-nowrap">ساعات العمل:</strong>
                      <span className="font-bold text-slate-600">{contact?.workingHours}</span>
                    </div>
                  </div>

                  {/* البريد الإلكتروني */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group">
                    <Mail className="shrink-0 text-secondary transition-transform group-hover:scale-110" size={18} />
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <strong className="font-extrabold text-slate-900 whitespace-nowrap">البريد الإلكتروني:</strong>
                      <a href={`mailto:${contact?.email}`} className="font-bold text-primary hover:underline transition-colors">
                        {contact?.email}
                      </a>
                    </div>
                  </div>

                  {/* واتساب */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0 group">
                    <MessageCircle className="shrink-0 text-secondary transition-transform group-hover:scale-110" size={18} />
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <strong className="font-extrabold text-slate-900 whitespace-nowrap">واتساب:</strong>
                      <a
                          href={`https://wa.me/${contact?.whatsApp?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-primary hover:underline transition-colors"
                      >
                        {contact?.whatsApp}
                      </a>
                    </div>
                  </div>

                  {/* فيسبوك */}
                  {contact?.facebookUrl && (
                      <div className="flex items-center gap-4 py-4 last:border-0 group">
                        <Facebook className="shrink-0 text-secondary transition-transform group-hover:scale-110" size={18} />
                        <div className="flex items-center gap-2 text-sm md:text-base">
                          <strong className="font-extrabold text-slate-900 whitespace-nowrap">فيسبوك:</strong>
                          <a
                              href={contact.facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-primary hover:underline transition-colors"
                          >
                            صفحة المكتبة الرسمية
                          </a>
                        </div>
                      </div>
                  )}

                </CardContent>
              </Card>
            </div>
          </main>

          <Footer />
        </div>
      </HomeLayout>
  );
};

export default Contact;