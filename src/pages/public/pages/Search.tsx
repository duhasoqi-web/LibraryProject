import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/pages/public/components/Header";
import Footer from "@/pages/public/components/Footer";
import SectionTitle from "@/pages/public/components/SectionTitle";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Search as SearchIcon, Loader2, Book, Info, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, SearchCode } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/pages/public/components/HomeLayout.tsx";




// --- Interfaces ---
interface AuthorDetailDto {
  authorName: string;
  authorRole: string;
}

interface HomePageBookResponse {
  bookID: number;
  bookTitle: string;
  authorName: string;
  classification: string;
  materialType: string;
  bookStatus: string;
}

interface HomePageBookDetailsResponse {
  bookID: number;
  bookTitle: string;
  bookStatus: string;
  classification: string;
  publisher: string;
  publishYear: number;
  edition: string;
  materialType: string;
  pageCount: number;
  subjectHeading: string;
  authors: AuthorDetailDto[];
}

interface PagedResult<T> {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}

const categories = [
  { value: "000", label: "معارف عامة" },
  { value: "100", label: "الفلسفة وعلم النفس" },
  { value: "200", label: "الديانات" },
  { value: "300", label: "العلوم الاجتماعية" },
  { value: "400", label: "اللغات" },
  { value: "500", label: "العلوم الطبيعية" },
  { value: "600", label: "العلوم التطبيقية" },
  { value: "700", label: "الفنون" },
  { value: "800", label: "الآداب" },
  { value: "900", label: "التاريخ والجغرافيا" },
];

const Search = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchType, setSearchType] = useState("title");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<HomePageBookResponse[]>([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<HomePageBookDetailsResponse | null>(null);

  // --- Helpers لترجمة الحالات وتنسيق الألوان ---
  const isAvailable = (status: string) => {
    const s = status?.toLowerCase();
    return s === "available" || s === "متوفر";
  };

  const getStatusStyle = (status: string, materialType: string) => {
    if (materialType === "مرجع") return "text-blue-600 bg-blue-50 border-blue-100";

    if (isAvailable(status)) {
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    }
    // الحالات الأخرى (مستعار أو محجوز)
    return "text-orange-500 bg-orange-50 border-orange-100";
  };

  const getStatusLabel = (status: string, materialType: string) => {
    if (materialType === "مرجع") return "للمطالعة الداخلية فقط";

    const s = status?.toLowerCase();
    if (s === "available" || s === "متوفر") return "متوفر للإعارة";
    if (s === "borrowed" || s === "مستعار") return "مستعار حالياً";
    if (s === "reserved" || s === "محجوز") return "محجوز حالياً";
    return "غير متاح";
  };

  // --- API Calls ---
  const fetchBooks = async (page: number, category = activeCategory, searchQuery = query) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      let endpoint = `/api/Book/search-home`;
      let requestBody: any = {
        pageNumber: page,
        pageSize: 12,
        bookTitle: null,
        authorName: null,
        subject: null
      };

      if (category) {
        endpoint = `/api/Book/search-category`;
        requestBody.categoryCode = category;
      } else if (searchQuery) {
        if (searchType === "title") requestBody.bookTitle = searchQuery;
        if (searchType === "author") requestBody.authorName = searchQuery;
        if (searchType === "subject") requestBody.subject = searchQuery;
      }

      const response = await axios.post<PagedResult<HomePageBookResponse>>(endpoint, requestBody);
      setResults(response.data.data || []);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.pageNumber
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في جلب البيانات من السيرفر" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveCategory(null);
    fetchBooks(1, null, query);
  };

  const handleCategoryClick = (catValue: string) => {
    const newCat = activeCategory === catValue ? null : catValue;
    setActiveCategory(newCat);
    setQuery("");
    if (newCat) fetchBooks(1, newCat, "");
    else {
      setResults([]);
      setHasSearched(false);
    }
  };

  const fetchDetails = async (id: number) => {
    try {
      const response = await axios.get<HomePageBookDetailsResponse>(`/api/Book/home-details/${id}`);
      setSelectedBook(response.data);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في جلب تفاصيل الكتاب" });
    }
  };

  const handleBorrow = async (bookId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول أولاً لإتمام الطلب" });
      navigate("/Login");
      return;
    }
    setIsActionLoading(true);
    try {
      const response = await axios.post(
          `/api/Borrow/request-online/${bookId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "نجاح الطلب", description: response.data.message || "تم إرسال طلب الإعارة بنجاح" });
      setSelectedBook(null);
      fetchBooks(pagination.currentPage);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "تعذر إرسال طلب الإعارة حالياً"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
<HomeLayout>
      <div className="flex min-h-screen flex-col bg-slate-50/50" dir="rtl">
        <Header />
        <main className="flex-1 py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-8 lg:flex-row">

              <aside className="lg:w-72 shrink-0">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 sticky top-24">
                  <h5 className="mb-5 text-xl font-bold border-b pb-3 flex items-center gap-2 text-slate-800">
                    <Book className="text-secondary" size={22} /> الأقسام العلمية
                  </h5>
                  <div className="flex flex-col gap-1.5">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryClick(cat.value)}
                            className={`rounded-lg px-4 py-2.5 text-start text-sm transition-all duration-200 ${
                                activeCategory === cat.value
                                    ? "bg-secondary text-white font-bold shadow-md"
                                    : "hover:bg-slate-100 text-slate-600"
                            }`}
                        >
                          {cat.label}
                        </button>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="flex-1">
                <div className="text-center mb-10">
                  <SectionTitle>
                    <SearchIcon className="ml-3 inline-block text-secondary" size={28} />
                    الفهرس الآلي للمكتبة
                  </SectionTitle>
                </div>

                <form onSubmit={handleSearchSubmit} className="mb-12 flex flex-wrap justify-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-48 bg-slate-50 border-none font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={"home-theme"}>
                      <SelectItem value="title">عنوان الكتاب</SelectItem>
                      <SelectItem value="author">اسم المؤلف</SelectItem>
                      <SelectItem value="subject">رأس الموضوع</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1 max-w-md">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ابحث عن عنوان، مؤلف، أو موضوع..."
                        className="w-full h-12 bg-slate-50 border-none focus-visible:ring-secondary"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="bg-secondary h-12 px-10 hover:bg-secondary/90 shadow-lg transition-all">
                    {isLoading ? <Loader2 className="animate-spin" /> : "ابدأ البحث"}
                  </Button>
                </form>

                {isLoading ? (
                    <div className="flex flex-col items-center py-24 gap-4">
                      <Loader2 className="animate-spin text-secondary" size={48} />
                      <p className="text-slate-500 font-medium animate-pulse">جاري جلب النتائج...</p>
                    </div>
                ) : results.length > 0 ? (
                    <>
                      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {results.map((book) => (
                            <Card key={book.bookID} className="home-theme rounded-2xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <span className="text-[10px] bg-secondary/10 text-secondary px-2.5 py-1 rounded font-black uppercase">
                                    {book.materialType}
                                  </span>
                                  <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(book.bookStatus, book.materialType)}`}>
                                    {isAvailable(book.bookStatus) && book.materialType !== "مرجع" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    {getStatusLabel(book.bookStatus, book.materialType)}
                                  </div>
                                </div>
                                <h5 className="font-bold text-lg mb-2 line-clamp-2 h-14 text-slate-800 group-hover:text-secondary transition-colors">{book.bookTitle}</h5>
                                <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                                  <span className="font-bold text-slate-700">المؤلف:</span>
                                  {book.authorName || "غير محدد"}
                                </p>
                                <Button
                                    variant="secondary"
                                    className="w-full bg-slate-100 text-slate-700 hover:bg-secondary hover:text-white transition-all font-bold rounded-xl"
                                    onClick={() => fetchDetails(book.bookID)}
                                >
                                  <Info size={18} className="ml-2" /> تفاصيل الكتاب
                                </Button>
                              </CardContent>
                            </Card>
                        ))}
                      </div>

                      {pagination.totalPages > 1 && (
                          <div className="mt-12 flex justify-center items-center gap-4">
                            <Button variant="outline" disabled={pagination.currentPage === 1} onClick={() => fetchBooks(pagination.currentPage - 1)} className="rounded-xl">
                              <ChevronRight className="ml-1" size={18} /> السابق
                            </Button>
                            <span className="text-sm font-bold bg-white px-4 py-2 rounded-lg shadow-sm border text-slate-700">
                              صفحة {pagination.currentPage} من {pagination.totalPages}
                            </span>
                            <Button variant="outline" disabled={pagination.currentPage === pagination.totalPages} onClick={() => fetchBooks(pagination.currentPage + 1)} className="rounded-xl">
                              التالي <ChevronLeft className="mr-1" size={18} />
                            </Button>
                          </div>
                      )}
                    </>
                ) : hasSearched ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="text-slate-300 mb-4 flex justify-center"><Book size={64} /></div>
                      <p className="text-slate-400 font-medium text-lg">لم نجد أي نتائج تطابق بحثك حالياً</p>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="text-secondary/20 mb-4 flex justify-center"><SearchCode size={64} /></div>
                      <p className="text-slate-500 font-bold text-xl">مرحباً بك في الفهرس الذكي</p>
                      <p className="text-slate-400 mt-2">اختر قسماً من القائمة الجانبية أو ابحث عن كتابك المفضل للبدء</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
          <DialogContent className="home-theme max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white" dir="rtl">
            <div className="bg-secondary p-8 text-white relative">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold leading-tight pr-6 text-right w-full">
                  {selectedBook?.bookTitle}
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 text-sm mb-8">
                <ModalInfo label="رقم التصنيف" value={selectedBook?.classification} />
                <ModalInfo label="سنة النشر" value={selectedBook?.publishYear} />
                <ModalInfo label="الناشر" value={selectedBook?.publisher} />
                <ModalInfo label="نوع المادة" value={selectedBook?.materialType} />
                <ModalInfo label="عدد الصفحات" value={selectedBook?.pageCount} />
                <ModalInfo label="الطبعة" value={selectedBook?.edition} />
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                <p className="font-bold text-secondary mb-3 flex items-center gap-2">
                  <Info size={16} /> المؤلفون والمساهمون
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedBook?.authors && selectedBook.authors.length > 0 ? (
                      selectedBook.authors.map((auth, i) => (
                          <div key={i} className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs shadow-sm">
                            <p className="font-bold text-slate-800">{auth.authorName}</p>
                            <p className="text-slate-500 italic">{auth.authorRole}</p>
                          </div>
                      ))
                  ) : (
                      <p className="text-xs text-slate-400 italic pr-2">لا يوجد مؤلفون مسجلون لهذا الكتاب</p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-8 flex gap-3 border-t pt-6">
                {selectedBook?.materialType !== "مرجع" && isAvailable(selectedBook?.bookStatus || "") ? (
                    <Button
                        disabled={isActionLoading}
                        className="flex-1 bg-secondary h-14 font-bold text-lg shadow-xl shadow-secondary/20 hover:bg-secondary/90 transition-all rounded-2xl"
                        onClick={() => handleBorrow(selectedBook!.bookID)}
                    >
                      {isActionLoading ? <Loader2 className="animate-spin ml-2" /> : "📌 تأكيد طلب الإعارة أونلاين"}
                    </Button>
                ) : (
                    <div className={`flex-1 p-4 rounded-2xl text-center font-bold border flex items-center justify-center gap-2 ${
                        selectedBook?.materialType === "مرجع" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100"
                    }`}>
                      <AlertCircle size={20} />
                      {getStatusLabel(selectedBook?.bookStatus || "", selectedBook?.materialType || "")}
                    </div>
                )}
                <Button variant="ghost" onClick={() => setSelectedBook(null)} className="h-14 px-8 font-bold text-slate-400">إغلاق</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        <Footer />
      </div>
</HomeLayout>
  );
};

const ModalInfo = ({ label, value }: { label: string; value: any }) => (

    <div className="home-theme flex flex-col gap-1 border-r-2 border-secondary/20 pr-3">
      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{label}</span>
      <span className="font-bold text-slate-800">{value || "غير متوفر"}</span>
    </div>
);

export default Search;