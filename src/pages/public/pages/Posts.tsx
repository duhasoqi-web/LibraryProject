import { useState, useEffect } from "react";
import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import HeroSection from "@/pages/public/components/HeroSection";
import PostCard from "@/pages/public/components/PostCard";
import { Post } from "@/pages/public/lib/posts";
import { useNews, useFeaturedNews, useNewsPage } from "@/pages/public/lib/use-api";
import { Button } from "@/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";





const getImageUrl = (url) => {
    if (!url) return "/placeholder-image.jpg";
    let path = url;
    if (url.startsWith("~")) path = url.substring(1);
    if (url.startsWith("/")) path = url;
    return `/media${path.startsWith('/') ? path : '/' + path}`;
};

const Posts = () => {
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<string>("all");
    const [allLoadedPosts, setAllLoadedPosts] = useState<Post[]>([]);

    const { data: newsPageData } = useNewsPage();

    const { data: newsRes, isLoading: newsLoading, isFetching } = useNews(page);
    const { data: featuredData } = useFeaturedNews();

    useEffect(() => {
        if (newsRes?.data) {
            const newPosts: Post[] = newsRes.data.map((n) => ({
                id: n.slug,
                slug: n.slug,
                title: n.postTitle,
                excerpt: n.excerpt,
                category: n.categoryTitle || "أخبار",
                image: getImageUrl(n.primaryImage),
                publishedAt: n.published,
                featured: n.isFeatured,
            }));

            setAllLoadedPosts((prev) => {
                const combined = [...prev, ...newPosts];
                const unique = Array.from(new Map(combined.map(p => [p.slug, p])).values());
                return unique;
            });
        }
    }, [newsRes]);

    const filteredPosts = filter === "all"
        ? allLoadedPosts
        : allLoadedPosts.filter((p) => p.category === filter);

    const featuredPosts: Post[] = featuredData?.slice(0, 2).map((n) => ({
        id: n.slug,
        slug: n.slug,
        title: n.postTitle,
        excerpt: n.excerpt,
        category: n.categoryTitle || "أخبار",
        image: getImageUrl(n.primaryImage),
        publishedAt: n.published,
        featured: true,
    })) || [];

    const hasMore = newsRes?.pagination ? page < newsRes.pagination.totalPages : false;

    if (page === 1 && newsLoading) {
        return (
            <HomeLayout>
            <div className="flex min-h-screen flex-col bg-white" dir="rtl">
                <Header />
                <div className="flex-1 flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">جاري تحميل الأرشيف...</p>
                    </div>
                </div>
                <Footer />
            </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
        <div className="flex min-h-screen flex-col bg-white" dir="rtl">
            <Header />

            <HeroSection
                title={newsPageData?.heading}
                subtitle={newsPageData?.description}
                backgroundImage={newsPageData?.mainImage ? getImageUrl(newsPageData.mainImage) : undefined}
                minHeight="45vh"
            />

            <main className="flex-1 py-12 bg-slate-50/50">
                <div className="container max-w-6xl px-4 mx-auto">

                    {featuredPosts.length > 0 && filter === "all" && page === 1 && (
                        <section className="mb-14">
                            <div className="mb-6 text-center border-b border-slate-100 pb-5">
                                <h2 className="text-xl font-black text-[#1e1a4d] md:text-2xl tracking-tight">
                                    الأخبار المميزة
                                </h2>
                            </div>
                            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                                {featuredPosts.map((post) => (
                                    <div key={`feat-${post.slug}`} className="group block">
                                        <PostCard post={post} featured />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    <div className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3 border-b border-slate-100 pb-6">
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            onClick={() => setFilter("all")}
                            className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-none duration-300 ${
                                filter === "all"
                                    ? "bg-[#1e1a4d] text-white scale-105"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            الكل
                        </Button>
                        {["أخبار", "إعلانات", "مقالات"].map((cat) => (
                            <Button
                                key={cat}
                                variant={filter === cat ? "default" : "outline"}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-none duration-300 ${
                                    filter === cat
                                        ? "bg-[#1e1a4d] text-white scale-105"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-red-500"
                                }`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {filteredPosts.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredPosts.map((post) => (
                                <div key={post.slug} className="block transition-transform duration-300 hover:-translate-y-1">
                                    <PostCard post={post} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-slate-400 font-bold text-lg">لا يوجد نتائج حالياً في قسم {filter}</p>
                        </div>
                    )}

                    {hasMore && (
                        <div className="mt-16 text-center border-t border-slate-100 pt-10">
                            <Button
                                onClick={() => setPage(p => p + 1)}
                                disabled={isFetching}
                                className="bg-white hover:bg-slate-50 text-primary border border-slate-200 px-8 py-4 text-xs md:text-sm font-bold transition-all duration-500 rounded-xl shadow-sm group"
                            >
                                {isFetching ? (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-primary/40" />
                                ) : (
                                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                                )}
                                {isFetching ? "جاري جلب المزيد..." : "عرض المزيد من الأرشيف"}
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
        </HomeLayout>
    );
};

export default Posts;