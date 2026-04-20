import "@/Index.css";

interface ReviewProps {
  formData: Record<string, any>;
  materialTypes?: { id: number; name: string }[];
  authorRoles?: { id: number; name: string }[];
  authorTypes?: { id: number; name: string }[];
  subtitleTypes?: { id: number; name: string }[];
}

export default function Review({
  formData,
  materialTypes = [],
  authorRoles = [],
  authorTypes = [],
  subtitleTypes = [],
}: ReviewProps) {
  const pub = formData.publishers || {};
  const series = formData.series || {};
  const supplies = formData.supplies || {};
  const authors = formData.authors || [];
  const subtitles = formData.subtitles || [];

  const getName = (list: { id: number; name: string }[], id: number | null) =>
    list.find((item) => item.id === id)?.name ?? "—";

  return (
    <div className="space-y-6" dir="rtl">
      <h3 className="text-lg font-semibold">مراجعة البيانات</h3>

      {/* ── بطاقة الإجراءات ── */}
      {(formData.createdBy || formData.updatedBy || formData.deletedBy) && (
        <div className="border rounded-xl p-4 bg-muted/40 space-y-3">
          <h4 className="font-semibold text-primary text-sm">🕓 سجل الإجراءات</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formData.createdBy && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <span className="text-green-600 text-lg">✅</span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">أُضيف بواسطة</p>
                  <p className="text-sm font-semibold text-green-800">{formData.createdBy}</p>
                </div>
              </div>
            )}
            {formData.updatedBy && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-600 text-lg">✏️</span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">عُدِّل بواسطة</p>
                  <p className="text-sm font-semibold text-blue-800">{formData.updatedBy}</p>
                </div>
              </div>
            )}
            {formData.deletedBy && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-red-600 text-lg">🗑️</span>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">حُذف بواسطة</p>
                  <p className="text-sm font-semibold text-red-800">{formData.deletedBy}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── المعلومات الأساسية ── */}
      <div className="border rounded-xl p-4 space-y-2 bg-card text-card-foreground">
        <h4 className="font-semibold text-primary">📘 المعلومات الأساسية</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>رقم التسلسل:</strong> {formData.serialNumber || "—"}</p>
          <p><strong>رمز التصنيف:</strong> {formData.classificationCode || "—"}</p>
          <p><strong>اللاحقة:</strong> {formData.suffix || "—"}</p>
          <p><strong>عنوان الكتاب:</strong> {formData.title || "—"}</p>
          <p><strong>الأبعاد:</strong> {formData.dimensions || "—"}</p>
          <p>
            <strong>نوع المادة:</strong>{" "}
            {formData.materialTypeName || getName(materialTypes, formData.materialTypeID) || "—"}
          </p>
          <p><strong>رأس الموضوع:</strong> {formData.subjectHeading || "—"}</p>
          <p><strong>ISBN:</strong> {formData.isbn || "—"}</p>
          <p><strong>عدد الصفحات:</strong> {formData.numberOfPages || "—"}</p>
          <p><strong>المستخلص:</strong> {formData.abstract || "—"}</p>
          <p><strong>الإيضاحات:</strong> {formData.illustrations || "—"}</p>
          <p><strong>الملاحظة البيبليوغرافية:</strong> {formData.bibliographicNote || "—"}</p>
          {formData.bookType && (
            <p><strong>نوع الكتاب:</strong> {formData.bookType}</p>
          )}
        </div>

        {subtitles.length > 0 && (
          <div className="mt-2">
            <strong className="text-sm">العناوين الفرعية:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {subtitles.map((s: any, i: number) => (
                <li key={i} className="text-sm">
                  {s.subtitle || "—"}
                  {s.subtitleTypeID && (
                    <span className="text-muted-foreground mr-1">
                      ({s.subtitleTypeName || getName(subtitleTypes, s.subtitleTypeID)})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── المؤلفون ── */}
      <div className="border rounded-xl p-4 space-y-2 bg-card text-card-foreground">
        <h4 className="font-semibold text-primary">✍️ المؤلفون</h4>
        {authors.length > 0 ? (
          authors.map((a: any, i: number) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-sm">
              <p><strong>مؤلف {i + 1}:</strong> {a.name || "—"}</p>
              <p>
                <strong>الدور:</strong>{" "}
                {a.authorRoleName || getName(authorRoles, a.authorRoleID)}
              </p>
              <p>
                <strong>الصفة:</strong>{" "}
                {a.authorTypeName || getName(authorTypes, a.authorTypeID)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">لا يوجد مؤلفون</p>
        )}
      </div>

      {/* ── الناشر ── */}
      <div className="border rounded-xl p-4 space-y-2 bg-card text-card-foreground">
        <h4 className="font-semibold text-primary">🏢 الناشر</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>اسم الناشر:</strong> {pub.name || "—"}</p>
          <p><strong>مكان النشر:</strong> {pub.place || "—"}</p>
          <p><strong>سنة النشر:</strong> {pub.year || "—"}</p>
          <p><strong>الطبعة:</strong> {pub.edition || "—"}</p>
          <p><strong>رقم الإيداع:</strong> {pub.depositNumber || "—"}</p>
        </div>
      </div>

      {/* ── السلسلة ── */}
      <div className="border rounded-xl p-4 space-y-2 bg-card text-card-foreground">
        <h4 className="font-semibold text-primary">📚 السلسلة</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>السلسلة:</strong> {series.title || "—"}</p>
          <p><strong>رقم الجزء:</strong> {series.partNumber || "—"}</p>
          <p><strong>عدد الأجزاء:</strong> {series.partCount || "—"}</p>
          <p><strong>ملاحظة:</strong> {series.note || "—"}</p>
          <p><strong>السلسلة الفرعية:</strong> {series.subSeriesTitle || "—"}</p>
          <p><strong>رقم جزء السلسلة الفرعية:</strong> {series.subSeriesPartNumber || "—"}</p>
        </div>
      </div>

      {/* ── المزوّد ── */}
      <div className="border rounded-xl p-4 space-y-2 bg-card text-card-foreground">
        <h4 className="font-semibold text-primary">🚚 المزوّد</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <p><strong>الاسم:</strong> {supplies.name || "—"}</p>
          <p><strong>التاريخ:</strong> {supplies.supplyDate || "—"}</p>
          <p><strong>الطريقة:</strong> {supplies.supplyMethod || "—"}</p>
          <p><strong>السعر:</strong> {supplies.price || "—"}</p>
          <p><strong>العملة:</strong> {supplies.currency || "—"}</p>
          <p><strong>ملاحظات:</strong> {supplies.note || "—"}</p>
        </div>
      </div>
    </div>
  );
}