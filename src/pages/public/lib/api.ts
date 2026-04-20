// ── Generic Fetch Function ──
async function fetchApi<T>(path: string): Promise<T> {
  const baseUrl = ""; // اتركها فارغة إذا كان الـ Proxy مُعد في vite.config
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// ── 1. Home ──
export interface HomeInfo {
  heading: string;
  description: string;
  mainImage: string | null;
}

export function fetchHome(): Promise<HomeInfo> {
  // مطابق لـ [HttpGet("Home")]
  return fetchApi<HomeInfo>("/api/Cms/Home");
}

// ── 2. NewsPage (الصفحة التعريفية للأخبار) ──
export interface NewsPageInfo {
  heading: string;
  description: string;
  mainImage: string | null;
}

export function fetchNewsPage(): Promise<NewsPageInfo> {
  // مطابق لـ [HttpGet("NewsPage")]
  return fetchApi<NewsPageInfo>("/api/Cms/NewsPage");
}

// ── 3. About ──
export interface AboutInfo {
  heading: string;
  description: string;
  body: string;
  mainImage: string | null;
  gallery: string[];
}

export function fetchAbout(): Promise<AboutInfo> {
  // مطابق لـ [HttpGet("about")]
  return fetchApi<AboutInfo>("/api/Cms/about");
}

// ── 4. Contact ──
export interface ContactInfo {
  heading: string;
  description: string;
  primeImage: string | null;
  phone: string;
  whatsApp: string;
  email: string;
  workingHours: string;
  facebookUrl: string;
  address: string;
}

export function fetchContact(): Promise<ContactInfo> {
  // مطابق لـ [HttpGet("contact")]
  return fetchApi<ContactInfo>("/api/Cms/contact");
}

// ── 5. Services ──
export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServicesResponse {
  header: {
    heading: string;
    subtitle: string;
    primeImage: string | null;
  };
  servicesList: ServiceItem[];
}

export function fetchServices(): Promise<ServicesResponse> {
  // مطابق لـ [HttpGet("services")]
  return fetchApi<ServicesResponse>("/api/Cms/services");
}

// ── 6. Footer ──
export interface FooterInfo {
  about: string;
  location: string;
  phone: string;
  email: string;
}

export function fetchFooter(): Promise<FooterInfo> {
  // مطابق لـ [HttpGet("footer")]
  return fetchApi<FooterInfo>("/api/Cms/footer");
}

// ── 7. Featured Books ──
export interface FeaturedBook {
  title: string;
  subtitle: string;
  image: string | null;
}

export function fetchFeaturedBooks(): Promise<FeaturedBook[]> {
  // مطابق لـ [HttpGet("featured-books")]
  return fetchApi<FeaturedBook[]>("/api/Cms/featured-books");
}

// ── 8. News & Posts (الأخبار والمنشورات) ──
export interface NewsPost {
  id: string;
  slug: string;
  postTitle: string;
  primaryImage: string | null;
  excerpt: string;
  categoryTitle: string | null;
  published: string;
  isFeatured: boolean;
  tags: string[];
  bodyContent?: string; // يستخدم في صفحة التفاصيل
}

export interface NewsPaginated {
  data: NewsPost[]; // مطابق لـ return Ok(new { Data = ... }) حيث ستصل data
  pagination: {
    totalPosts: number;
    totalPages: number;
    currentPage: number;
  };
}

export function fetchNews(page = 1): Promise<NewsPaginated> {
  // مطابق لـ [HttpGet("news")]
  return fetchApi<NewsPaginated>(`/api/Cms/news?page=${page}`);
}

export function fetchLatestNews(): Promise<NewsPost[]> {
  // مطابق لـ [HttpGet("news/latest")]
  return fetchApi<NewsPost[]>("/api/Cms/news/latest");
}

export function fetchFeaturedNews(): Promise<NewsPost[]> {
  // مطابق لـ [HttpGet("news/featured")]
  return fetchApi<NewsPost[]>("/api/Cms/news/featured");
}

export function fetchNewsBySlug(slug: string): Promise<NewsPost> {
  // مطابق لـ [HttpGet("news/{slug}")]
  return fetchApi<NewsPost>(`/api/Cms/news/${slug}`);
}
export async function requestBorrowOnline(bookId: number): Promise<any> {
  // استخدام POST وإرسال الـ bookId في المسار حسب الـ Swagger
  return fetchApi(`/api/Borrow/request-online/${bookId}`);
}