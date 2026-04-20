import { useState, useEffect } from "react";

interface HeroSectionProps {
    title: string;
    subtitle?: string;
    showCTA?: boolean;
    ctaText?: string;
    ctaHref?: string;
    backgroundImage: string;
    minHeight?: string;
}

const HeroSection = ({
                         title,
                         subtitle,
                         showCTA = false,
                         ctaText = "استكشف الآن",
                         ctaHref = "#featured-books",
                         backgroundImage,
                         minHeight = "70vh",
                     }: HeroSectionProps) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // التأكد من تحميل الصورة في الذاكرة قبل عرض الأنميشن
    useEffect(() => {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => setIsLoaded(true);
    }, [backgroundImage]);

    return (
        <section
            className="relative flex items-center justify-center overflow-hidden text-center bg-slate-900"
            style={{ minHeight }}
        >
            {/* الصورة باستخدام img بدلاً من backgroundImage لتحسين الأداء */}
            {backgroundImage && (
                <img
                    src={backgroundImage}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] ease-out
            ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
            /* تم استبدال الأنميشن المستمر بـ Transition لمرة واحدة عند التحميل */
          `}
                    loading="eager"
                    style={{ willChange: "transform, opacity" }} // تلميح للمتصفح لاستخدام كرت الشاشة
                />
            )}

            {/* طبقة التظليل (Overlay) */}
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />

            {/* المحتوى النصي */}
            <div className={`relative z-10 px-4 text-primary-foreground transition-all duration-1000 delay-300
        ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}>
                <h1 className="mb-4 text-4xl font-black leading-tight drop-shadow-2xl md:text-6xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mb-6 text-lg font-medium opacity-95 drop-shadow-md md:text-xl max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                )}
                {showCTA && (
                    <a
                        href={ctaHref}
                        className="inline-block rounded-xl bg-secondary px-10 py-4 text-lg font-black text-secondary-foreground shadow-xl transition-all hover:scale-105 active:scale-95 hover:brightness-110"
                    >
                        {ctaText}
                    </a>
                )}
            </div>
        </section>
    );
};

export default HeroSection;