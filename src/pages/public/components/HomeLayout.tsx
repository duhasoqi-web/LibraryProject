import '@/pages/public/Home.css';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="home-theme min-h-screen bg-background text-foreground" dir="rtl">
            {children}
        </div>
    );
}