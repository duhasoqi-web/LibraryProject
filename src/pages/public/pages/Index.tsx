import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import HeroSection from "@/pages/public/components/HeroSection";
import SectionTitle from "@/pages/public/components/SectionTitle";
import PostCard from "@/pages/public/components/PostCard";
import { Card, CardContent } from "@/ui/card";
import { useLatestNews, useFeaturedBooks, useHome } from "@/pages/public/lib/use-api";
import { ArrowLeft, BookOpen, Users, RefreshCcw } from "lucide-react";
import axios from "axios";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";




const getImageUrl = (url) => {
    if (!url) return "/placeholder-image.jpg";
    let path = url;
    if (url.startsWith("~")) path = url.substring(1);
    if (url.startsWith("/")) path = url;
    return `/media${path.startsWith('/') ? path : '/' + path}`;
};

const AnimatedNumber = ({ end }) => {
    const [value, setValue] = useState(0);
    const ref = useRef(null);
    const observed = useRef(false);

    useEffect(() => {
        observed.current = false;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !observed.current) {
                    observed.current = true;
                    let start = 0;
                    const duration = 1500;
                    const stepTime = 20;
                    const steps = duration / stepTime;
                    const increment = end / steps;
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= end) {
                            setValue(end);
                            clearInterval(timer);
                        } else {
                            setValue(Math.floor(start));
                        }
                    }, stepTime);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end]);

    return <span ref={ref}>{value.toLocaleString("en-US")}</span>;
};

const Index = () => {
    const { data: homeData } = useHome(); // جلب بيانات الهيرو
    const { data: latestNews, isLoading: newsLoading } = useLatestNews();
    const { data: featuredBooks, isLoading: booksLoading } = useFeaturedBooks();
    const [homeStats, setHomeStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/api/Admin/homepage-cards");
                setHomeStats(response.data);
            } catch (error) {
                console.error("Error fetching homepage stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statsConfig = [
        {
            id: "books",
            label: "كتاب متاح",
            value: homeStats?.totalBooks || 0,
            icon: BookOpen,
            color: "text-blue-600",
        },
        {
            id: "borrowing",
            label: "عملية إعارة",
            value: homeStats?.totalBorrows || 0,
            icon: RefreshCcw,
            color: "text-amber-600",
        },
        {
            id: "members",
            label: "مشترك فعال",
            value: homeStats?.activeMembers || 0,
            icon: Users,
            color: "text-emerald-600",
        },
    ];

    return (

        <HomeLayout>
        <div className="flex min-h-screen flex-col" dir="rtl">
            <Header />

            <HeroSection
                title={homeData?.heading}
                subtitle={homeData?.description}
                showCTA
                backgroundImage={homeData?.mainImage ? getImageUrl(homeData.mainImage) : undefined}
            />

            <section className="relative py-12 md:py-20 bg-slate-100/80 border-b border-slate-200/50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                     style={{ backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

                <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
                    <SectionTitle>إحصائيات المكتبة</SectionTitle>

                    {statsLoading ? (
                        <div className="mt-8 grid gap-6 md:grid-cols-3 animate-pulse">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-white/50 rounded-2xl border border-slate-100" />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {statsConfig.slice(0, 3).map((stat) => {
                                const hoverBgColor =
                                    stat.id === 'books' ? 'bg-blue-600' :
                                        stat.id === 'borrowing' ? 'bg-amber-600' :
                                            'bg-emerald-600';

                                return (
                                    <div key={stat.id} className="group relative">
                                        <div className="relative overflow-hidden bg-white p-8 md:p-10 rounded-[1.5rem] border border-white shadow-sm transition-all duration-500 ease-in-out
                                                        group-hover:shadow-md group-hover:-translate-y-1">

                                            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
                                                <h3 className={`text-4xl font-black tracking-tight ${stat.color} leading-none transition-transform duration-500 group-hover:scale-105`}>
                                                    <AnimatedNumber end={stat.value} />
                                                </h3>

                                                <div className="flex items-center gap-2 text-slate-400 font-bold transition-colors duration-300 group-hover:text-slate-600">
                                                    <p className="text-xs uppercase tracking-widest">{stat.label}</p>
                                                    <div className="transition-all duration-500 group-hover:scale-110 group-hover:text-current">
                                                        <stat.icon size={18} strokeWidth={2.5} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`absolute bottom-0 left-0 right-0 h-1 ${hoverBgColor} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="py-12 md:py-16 bg-white">
                <div className="container px-4">
                    <div className="mb-8 flex flex-col items-center justify-center relative border-b border-slate-100 pb-6">

                        <div className="text-center">
                            <SectionTitle>آخر الأخبار والإعلانات</SectionTitle>
                        </div>

                        <Link
                            to="/posts"
                            className="mt-3 md:mt-0 md:absolute md:left-0 flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-all text-sm group"
                        >
                            عرض الكل
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        </Link>
                    </div>

                    {newsLoading ? (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic">
                            جاري تحميل الأخبار...
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {latestNews?.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={{
                                        id: post.slug,
                                        title: post.postTitle,
                                        excerpt: post.excerpt,
                                        image: getImageUrl(post.primaryImage),
                                        publishedAt: post.published,
                                        category: post.categoryTitle || "أخبار",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section id="featured-books" className="bg-slate-100/80 py-16 border-t border-slate-200/50">
                <div className="container text-center px-4">
                    <SectionTitle>الكتب المميزة</SectionTitle>
                    {booksLoading ? (
                        <div className="col-span-full py-16 text-sm font-medium text-slate-400">جاري تحميل الكتب...</div>
                    ) : (
                        <>
                            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredBooks?.map((book, i) => (
                                    <Card key={i} className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md bg-white rounded-xl">
                                        <div
                                            className="aspect-[3/4] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${getImageUrl(book.image)})` }}
                                        />
                                        <CardContent className="p-4 text-right">
                                            <h5 className="font-bold text-base text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h5>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed opacity-80">{book.subtitle}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <Link to="/search" className="mt-12 inline-block rounded-xl bg-secondary px-10 py-3 text-sm font-black text-secondary-foreground transition-all hover:scale-105 hover:shadow-md active:scale-95">
                                استكشف الفهرس الإلكتروني
                            </Link>
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </div>
        </HomeLayout>
    );
};

export default Index;