import { showcaseImages } from '../../data/siteData.js';

export default function FleetSection() {
  return (
    <section className="w-full bg-white pb-2 max-md:pb-[5px]" aria-label="ENA Coach fleet showcase">
      <div className="mx-auto w-[min(1120px,calc(100%-32px))] max-md:w-[calc(100%-12px)]">
        <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1 max-md:gap-[6px]">
          {showcaseImages.map((item, index) => (
            <article
              key={item.id || item.image}
              className="relative h-[245px] overflow-hidden rounded-lg bg-[#edf1f3] max-md:h-[126px] max-md:rounded"
            >
              <img
                src={item.image}
                alt={item.alt}
                className="block h-full w-full object-cover"
              />

              {index === 1 && (
                <div
                  className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-[6px] max-md:bottom-[7px] max-md:gap-1"
                  aria-hidden="true"
                >
                  <span className="h-[9px] w-[22px] rounded-full bg-white max-md:h-[6px] max-md:w-[15px]" />
                  {Array.from({ length: 7 }).map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className="h-[9px] w-[9px] rounded-full bg-white/55 max-md:h-[6px] max-md:w-[6px]"
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}