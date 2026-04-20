import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import HeroSection from "@/pages/public/components/HeroSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
import { useServices } from "@/pages/public/lib/use-api";
import { Loader2 } from "lucide-react";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";



const getImageUrl = (url) => {
    if (!url) return "/placeholder-image.jpg";
    let path = url;
    if (url.startsWith("~")) path = url.substring(1);
    if (url.startsWith("/")) path = url;
    return `/media${path.startsWith('/') ? path : '/' + path}`;
};

const Services = () => {
    const { data: servicesData, isLoading, isError } = useServices();

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

    if (isError || !servicesData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white" dir="rtl">
                <p className="text-destructive font-bold">حدث خطأ أثناء تحميل البيانات.</p>
            </div>
        );
    }

    const { header, servicesList } = servicesData;

    return (

        <HomeLayout>
        <div className="flex min-h-screen flex-col bg-white" dir="rtl">
            <Header />

            <HeroSection
                title={header?.heading}
                subtitle={header?.subtitle}
                backgroundImage={header?.primeImage ? getImageUrl(header.primeImage) : undefined}
                minHeight="45vh"
            />

            <main className="flex-1 py-12 bg-slate-50/40">
                <div className="container max-w-4xl px-4 mx-auto">

                    <div className="mt-2">
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {servicesList.map((service, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`service-${index}`}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md border-none"
                                >
                                    <AccordionTrigger className="px-6 py-4 text-base md:text-lg font-bold hover:no-underline text-right text-slate-800 hover:text-primary transition-colors">
                                        {service.title}
                                    </AccordionTrigger>

                                    <AccordionContent className="px-6 pb-5 text-right border-t border-slate-50 pt-4">
                                        <div
                                            className="text-slate-600 leading-relaxed text-sm md:text-base
                                           [&_p]:mb-3
                                           [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:my-3 [&_ul]:space-y-1
                                           [&_li]:text-slate-500
                                           [&_strong]:text-slate-900 [&_strong]:font-bold
                                           [&_a]:text-primary [&_a]:font-semibold"
                                            dangerouslySetInnerHTML={{ __html: service.description }}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
        </HomeLayout>
    );
};

export default Services;