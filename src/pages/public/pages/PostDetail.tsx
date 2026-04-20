import { useParams, Link } from "react-router-dom";
import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import { getCategoryColor } from "@/pages/public//lib/posts";
import { useNewsBySlug, useLatestNews } from "@/pages/public/lib/use-api";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";

const getImageUrl = (url) => {
    if (!url) return "/placeholder-image.jpg";
    let path = url;
    if (path.startsWith("~")) path = path.substring(1);
    if (path.startsWith("/")) path = path.substring(1);
    return `/media/${path}`;
};

const PostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { data: apiPost, isLoading } = useNewsBySlug(id || "");
    const { data: latestNews } = useLatestNews();

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-white" dir="rtl">
                <Header />
                <main className="flex flex-1 items-center justify-center">
                    <p className="text-slate-400 font-bold animate-pulse">جاري تحميل تفاصيل الخبر...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (!apiPost) {
        return (
            <HomeLayout>
            <div className="flex min-h-screen flex-col" dir="rtl">
                <Header />
                <main className="flex flex-1 items-center justify-center py-20">
                    <div className="text-center">
                        <h1 className="mb-6 text-xl font-bold text-slate-800">عذراً، هذا المنشور غير موجود</h1>
                        <Link to="/posts">
                            <Button className="bg-primary text-white rounded-xl px-8">
                                <ArrowRight className="ml-2" size={18} />
                                العودة للأخبار
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
            </HomeLayout>
        );
    }

    const formattedDate = apiPost.published ? new Date(apiPost.published).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }) : "";

    const relatedPosts = latestNews?.filter(p => p.slug !== id).slice(0, 3) || [];

    return (
        <HomeLayout>
            <div className="flex min-h-screen flex-col bg-white" dir="rtl">
                <Header />

                <main className="flex-1 py-8 md:py-12">
                    <div className="container max-w-4xl px-4 mx-auto">

                        {/* زر العودة: أصغر وأبسط */}
                        <Link to="/posts" className="mb-8 inline-flex items-center text-xs font-bold text-slate-400 transition-colors hover:text-primary">
                            <ArrowRight className="ml-1.5" size={14} />
                            العودة للأرشيف
                        </Link>

                        <article>
                            {/* 1. الصورة الرئيسية: تقليل الارتفاع من 400 لـ 350 لضمان رؤية العنوان فوراً */}
                            {apiPost.primaryImage && (
                                <div
                                    className="mb-10 h-60 rounded-[2rem] bg-cover bg-center shadow-2xl shadow-slate-100 md:h-[350px] border border-slate-50 overflow-hidden"
                                    style={{ backgroundImage: `url(${getImageUrl(apiPost.primaryImage)})` }}
                                />
                            )}

                            {/* 2. رأس المقال: تصغير العناوين */}
                            <div className="flex flex-col mb-8 text-right">
                                <div className="mb-4 flex items-center gap-4">
                                <span className={`inline-block rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white ${getCategoryColor(apiPost.categoryTitle || "أخبار")}`}>
                                    {apiPost.categoryTitle || "أخبار"}
                                </span>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                        <Calendar size={14} />
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>

                                {/* العنوان: تصغير من 5xl لـ 3xl ليكون أرقى */}
                                <h1 className="text-2xl font-black text-primary md:text-3xl leading-tight tracking-tight">
                                    {apiPost.postTitle}
                                </h1>
                            </div>

                            {/* 3. المحتوى: تحسين الخط والمسافات (Typography) */}
                            <div
                                className="prose prose-slate prose-lg max-w-none text-slate-700 text-justify leading-[1.8]
                             prose-p:mb-5 prose-p:leading-relaxed
                             prose-headings:text-primary prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                             prose-img:rounded-2xl prose-img:my-8
                             prose-strong:text-slate-900 prose-strong:font-bold"
                                dangerouslySetInnerHTML={{ __html: apiPost.bodyContent || "" }}
                            />
                        </article>

                        {/* 4. منشورات ذات صلة: تصغير الكروت والمسافات */}
                        {relatedPosts.length > 0 && (
                            <section className="mt-16 pt-12 pb-10 px-8 bg-[#f8fafc] border border-slate-100 rounded-[3rem] shadow-[inner_0_2px_4px_rgba(0,0,0,0.02)]">
                                {/* العنوان مع لمسة تميز */}
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                                    <h3 className="text-2xl font-black text-slate-800">أخبار قد تهمك</h3>
                                </div>

                                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                                    {relatedPosts.map((related) => (
                                        <Link key={related.id} to={`/posts/${related.slug}`} className="group">
                                            <Card className="h-full border-none shadow-sm rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 bg-white">
                                                {/* حاوية الصورة مع تأثير زووم */}
                                                <div className="relative h-40 overflow-hidden">
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                        style={{ backgroundImage: `url(${getImageUrl(related.primaryImage)})` }}
                                                    />
                                                    {/* طبقة تظليل خفيفة فوق الصورة */}
                                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                                </div>

                                                <CardContent className="p-5">
                                                    <h4 className="font-bold text-base leading-relaxed text-slate-700 transition-colors group-hover:text-primary line-clamp-2">
                                                        {related.postTitle}
                                                    </h4>
                                                    <div className="mt-4 flex items-center text-primary font-black text-xs opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                                                        اقرأ المزيد ←
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </main>

                <Footer />
            </div>

        </HomeLayout>
    );
};

export default PostDetail;