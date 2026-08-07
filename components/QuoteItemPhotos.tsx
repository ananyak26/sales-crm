export default function QuoteItemPhotos({ items }: { items: any[] }) {
  const withPhotos = items.filter((it) => it.image_url);
  if (withPhotos.length === 0) return null;

  return (
    <>
      {withPhotos.map((it, idx) => (
        <div
          key={it.id || idx}
          className="bg-white rounded-2xl border border-gray-300 shadow-premium mt-6 flex flex-col items-center justify-center p-10"
          style={{ minHeight: "1000px", breakBefore: "page", pageBreakBefore: "always" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={it.image_url}
            alt={it.description}
            crossOrigin="anonymous"
            className="max-w-full max-h-[820px] object-contain"
          />
          <p className="mt-8 text-center font-semibold text-gray-900 text-base whitespace-pre-line">
            {it.description}
          </p>
        </div>
      ))}
    </>
  );
}
