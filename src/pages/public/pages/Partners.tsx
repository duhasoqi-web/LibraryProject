import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import HeroSection from "@/pages/public/components/HeroSection";
import SectionTitle from "@/pages/public/components/SectionTitle";
import { Card, CardContent } from "@/ui/card";
import heroImage from "@/assets/hero-library.webp";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";





const teamMembers = [
  { name: "عمر جهاد عبد المعطي خنفر", phone: "0569491027" },
  { name: "معاذ مصطفى محمود الدويري", phone: "0594324983" },
  { name: "محمد عماد واصف عبدالفتاح", phone: "0598935271" },
  { name: "صبا حسام جابر الناجي", phone: "0592403435" },
  { name: "رغد طارق عيد جبيهي", phone: "0592515717" },
  { name: "ضحى يحيى راضي سوقي", phone: "0594954420" },
  { name: "رغد ايمن مصطفى هنطش", phone: "0595965046" },
];

const Partners = () => (

    <HomeLayout>
  <div className="flex min-h-screen flex-col">

    <Header />

    <HeroSection
      title="حول الموقع"
      subtitle="نظام مكتبة بلدية طولكرم – شراكة أكاديمية تطبيقية"
      backgroundImage={heroImage}
      minHeight="50vh"
    />

    <main className="flex-1 py-12">
      <div className="container space-y-12">
        {/* About */}
        <section className="animate-slide-in-right">
          <SectionTitle>نبذة عن الموقع</SectionTitle>
          <Card className="border-none shadow-md">
            <CardContent className="p-6 leading-relaxed text-foreground">
              تم تطوير هذا النظام ضمن مبادرة البرنامج التدريبي التطبيقي لمشاريع التخرج والتدريب الميداني التي أُطلقت من قبل{" "}
              <strong>د. شرين حجازي</strong> — قسم علم الحاسوب، كلية تكنولوجيا المعلومات والذكاء الاصطناعي، جامعة فلسطين التقنية – خضوري للعام الأكاديمي 2025–2026.
            </CardContent>
          </Card>
        </section>

        {/* Supervision */}
        <section>
          <SectionTitle>الإشراف والتنسيق</SectionTitle>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <ul className="space-y-2 text-foreground">
                <li>
                  <strong className="text-primary">المؤسس الأكاديمي ومنسق البرنامج (الجامعة):</strong> د. شرين حجازي
                </li>
                <li>
                  <strong className="text-primary">المنسق الميداني (بلدية طولكرم):</strong> أ. ريم جيوسي
                </li>
                <li>
                  <strong className="text-primary">مشرف مشروع التخرج:</strong> د. محمد ضرار سفاريني
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Team */}
        <section>
          <SectionTitle>الطلبة المبرمجون</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamMembers.map((member, i) => (
              <Card key={i} className="border-none shadow-md transition-transform hover:-translate-y-1">
                <CardContent className="py-5 text-center">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.phone}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Partners */}
        <section>
          <SectionTitle>الشركاء</SectionTitle>
          <Card className="border-none shadow-md text-center">
            <CardContent className="p-6">
              <p className="text-lg font-bold">جامعة فلسطين التقنية – خضوري × بلدية طولكرم</p>
              <p className="mt-2 font-bold text-secondary">العام الأكاديمي: 2025–2026</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>

    <Footer />
  </div>
    </HomeLayout>
      );

export default Partners;
