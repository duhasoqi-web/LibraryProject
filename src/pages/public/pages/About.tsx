import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import HeroSection from "@/pages/public/components/HeroSection";
import { useAbout } from "@/pages/public/lib/use-api.ts";
import { Loader2 } from "lucide-react";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";



const About = () => {
    const { data: about, isLoading } = useAbout();

    const getImageUrl = (url) => {
        if (!url) return "/placeholder-image.jpg";
        let path = url;
        if (path.startsWith("~")) path = path.substring(1);
        if (path.startsWith("/")) path = path.substring(1);
        return `/media/${path}`;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-white" dir="rtl">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
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
                title={about?.heading}
                subtitle={about?.description}
                backgroundImage={getImageUrl(about?.mainImage)}
                minHeight="45vh"
            />

            <main className="flex-1 py-12 md:py-16 bg-slate-50/30">
                <div className="container max-w-5xl px-4 mx-auto">

                    <article className="mx-auto max-w-4xl bg-white p-6 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-50">
                        <div className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-700 text-justify leading-[1.8]">
                            {/* استخدام body بحرف صغير */}
                            {about?.body ? (
                                <div
                                    className="content-area prose-p:mb-6 prose-headings:text-primary prose-headings:font-black"
                                    dangerouslySetInnerHTML={{ __html: about.body }}
                                />
                            ) : (
                                <p className="text-center text-slate-400 italic">لا يوجد محتوى متاح حالياً.</p>
                            )}
                        </div>

                        {/* استخدام gallery بحرف صغير */}
                        {about?.gallery && about.gallery.length > 0 && (
                            <div className="mt-16 border-t border-slate-100 pt-12">
                                <div className="mb-10 text-center">
                                    <h3 className="text-2xl font-black text-primary tracking-tight">معرض الصور</h3>
                                    <div className="mt-2 h-1 w-12 bg-secondary mx-auto rounded-full" />
                                </div>

                                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {about.gallery.map((src, i) => (
                                        <div key={i} className="group relative overflow-hidden rounded-2xl bg-slate-50 aspect-square shadow-sm transition-all duration-500 hover:shadow-md hover:-translate-y-1">
                                            <img
                                                src={getImageUrl(src)}
                                                alt={`صورة من المعرض ${i + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>
                </div>
            </main>

            <Footer />
        </div>
        </HomeLayout>
    );
};

export default About;