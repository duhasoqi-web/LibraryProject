export interface Post {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  image?: string;
  publishedAt: string;
  featured?: boolean;
}

const categoryLabels: Record<string, string> = {
  "news": "أخبار",
  "article": "مقالات",
  "announcement": "إعلانات",
  "أخبار": "أخبار",
  "إعلانات": "إعلانات",
  "مقالات": "مقالات"
};

const categoryColors: Record<string, string> = {
  "news": "bg-blue-600",
  "أخبار": "bg-blue-600",

  "article": "bg-emerald-600",
  "مقالات": "bg-emerald-600",

  "announcement": "bg-amber-500",
  "إعلانات": "bg-amber-500",

  "default": "bg-gray-500"
};
export const getCategoryLabel = (category: string) => categoryLabels[category] || category || "أخبار";
export const getCategoryColor = (category: string) => categoryColors[category] || categoryColors["default"];

