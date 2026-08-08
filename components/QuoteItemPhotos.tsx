const CHARCOAL = "#1c1c1c";
const ORANGE = "#f5a524";
const ORANGE_DEEP = "#d9720c";

export default function QuoteItemPhotos({
  items,
  terms,
  showPhotos = true,
}: {
  items: any[];
  terms?: string | null;
  showPhotos?: boolean;
}) {
  const withPhotos = showPhotos ? items.filter((it) => it.image_url) : [];
  if (withPhotos.length === 0 && !terms) return null;

  return (
    <div className="text-gray-800" style={{ fontFamily: "Cambria, Georgia, 'Times New Roman', serif" }}>
      {terms && (
        <div
          className="bg-gray-100 rounded-2xl overflow-hidden shadow-premium mt-6 flex flex-col"
          style={{
            breakBefore: "page",
            pageBreakBefore: "always",
            border: `1px solid ${CHARCOAL}`,
          }}
        >
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${ORANGE} 0%, ${ORANGE_DEEP} 50%, ${ORANGE} 100%)` }} />
          <div className="p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1.5 rounded-full" style={{ background: ORANGE }} />
              <p className="font-bold uppercase text-sm tracking-widest text-gray-900">Terms &amp; Conditions</p>
            </div>
            <p className="whitespace-pre-line text-sm leading-7 text-gray-700">{terms}</p>
          </div>
        </div>
      )}

      {withPhotos.map((it, idx) => (
        <div
          key={it.id || idx}
          className="bg-white rounded-2xl overflow-hidden shadow-premium mt-6 flex flex-col"
          style={{
            minHeight: "1000px",
            breakBefore: "page",
            pageBreakBefore: "always",
            border: `1px solid ${CHARCOAL}`,
          }}
        >
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${ORANGE} 0%, ${ORANGE_DEEP} 50%, ${ORANGE} 100%)` }} />
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div
              className="rounded-xl p-4 bg-white flex items-center justify-center"
              style={{ border: `2px solid ${CHARCOAL}`, boxShadow: `0 0 0 4px ${ORANGE}22` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.image_url}
                alt={it.description}
                crossOrigin="anonymous"
                className="max-w-full max-h-[720px] object-contain"
              />
            </div>
            <p className="mt-8 text-center font-semibold text-gray-900 text-base whitespace-pre-line">
              {it.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
