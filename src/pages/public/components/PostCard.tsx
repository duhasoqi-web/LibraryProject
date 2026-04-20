import { Link } from "react-router-dom";
import { Card, CardContent } from "@/ui/card";
import { CalendarDays, ArrowLeft } from "lucide-react";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";




// دالة الألوان بناءً على الأنواع
const getCategoryColor = (category = "") => {
  const cat = category.trim();
  if (cat.includes("إعلان")) return "bg-rose-600 text-white shadow-rose-200";
  if (cat.includes("مقال")) return "bg-emerald-600 text-white shadow-emerald-200";
  if (cat.includes("خبر") || cat.includes("أخبار")) return "bg-blue-600 text-white shadow-blue-200";

  return "bg-slate-500 text-white";
};

// ✅ أضفنا featured هنا لاستقبالها من الملفات الأخرى
const PostCard = ({ post, featured = false }: { post: any, featured?: boolean }) => {
  return (
      <Link to={`/posts/${post.id}`} className="group h-full block text-right" dir="rtl">
        {/* ✅ يمكنك استخدام featured هنا لتغيير شكل الكرت إذا أردت، مثلاً إضافة border مميز */}
        <Card className={`h-full overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-white flex flex-col ${featured ? 'ring-2 ring-primary/10' : ''}`}>

          {/* الصورة والتاج */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <img
                src={post.image || "/placeholder-image.jpg"}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* التاج الملون */}
            {post.category && (
                <div className={`absolute top-3 right-3 text-[10px] px-3 py-1.5 rounded-md font-black shadow-lg z-10 ${getCategoryColor(post.category)}`}>
                  {post.category}
                </div>
            )}
          </div>

          {/* محتوى الكرت */}
          <CardContent className="p-5 flex flex-col flex-grow">
            {/* التاريخ */}
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] mb-3 font-bold">
              <CalendarDays size={14} className="text-secondary" />
              <span>{post.publishedAt}</span>
            </div>

            {/* العنوان - تكبير الخط إذا كان featured */}
            <h3 className={`${featured ? 'text-xl' : 'text-lg'} font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug`}>
              {post.title}
            </h3>

            {/* الوصف */}
            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow leading-relaxed font-medium">
              {post.excerpt}
            </p>

            {/* زر اقرأ المزيد */}
            <div className="flex items-center gap-2 text-secondary font-black text-sm mt-auto">
              <span>اقرأ المزيد</span>
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            </div>
          </CardContent>
        </Card>
      </Link>
        );
};

export default PostCard;