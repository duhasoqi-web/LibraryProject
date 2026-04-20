import { useQuery } from "@tanstack/react-query";
import {
    fetchContact,
    fetchFooter,
    fetchAbout,
    fetchServices,
    fetchFeaturedBooks,
    fetchNews,
    fetchLatestNews,
    fetchFeaturedNews,
    fetchNewsBySlug,
    fetchNewsPage,
    fetchHome // أضفنا استيراد fetchHome
} from "@/pages/public/lib/api";

// ── هوك الصفحة الرئيسية (جديد ليطابق الكنترولر) ──
export const useHome = () =>
    useQuery({
        queryKey: ["cms", "home"],
        queryFn: fetchHome,
        staleTime: 5 * 60 * 1000
    });

// ── هوك صفحة الأخبار التعريفية ──
export const useNewsPage = () =>
    useQuery({
        queryKey: ["cms", "news-page"],
        queryFn: fetchNewsPage,
        staleTime: 5 * 60 * 1000
    });

export const useContact = () =>
    useQuery({ queryKey: ["cms", "contact"], queryFn: fetchContact, staleTime: 5 * 60 * 1000 });

export const useFooter = () =>
    useQuery({ queryKey: ["cms", "footer"], queryFn: fetchFooter, staleTime: 5 * 60 * 1000 });

export const useAbout = () =>
    useQuery({ queryKey: ["cms", "about"], queryFn: fetchAbout, staleTime: 5 * 60 * 1000 });

export const useServices = () =>
    useQuery({ queryKey: ["cms", "services"], queryFn: fetchServices, staleTime: 5 * 60 * 1000 });

export const useFeaturedBooks = () =>
    useQuery({ queryKey: ["cms", "featured-books"], queryFn: fetchFeaturedBooks, staleTime: 5 * 60 * 1000 });

export const useNews = (page = 1) =>
    useQuery({
        queryKey: ["cms", "news", page],
        queryFn: () => fetchNews(page),
        staleTime: 2 * 60 * 1000
    });

export const useLatestNews = () =>
    useQuery({ queryKey: ["cms", "news", "latest"], queryFn: fetchLatestNews, staleTime: 2 * 60 * 1000 });

export const useFeaturedNews = () =>
    useQuery({ queryKey: ["cms", "news", "featured"], queryFn: fetchFeaturedNews, staleTime: 2 * 60 * 1000 });

export const useNewsBySlug = (slug: string) =>
    useQuery({
        queryKey: ["cms", "news", slug],
        queryFn: () => fetchNewsBySlug(slug),
        enabled: !!slug,
        staleTime: 2 * 60 * 1000,
    });