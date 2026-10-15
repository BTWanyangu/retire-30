import { useEffect, useState } from 'react';
import { gallery } from '../data/siteData.js';

export default function Gallery() {
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setActiveImage(null);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#f7f8fa] pb-[95px] pt-[45px] max-md:pb-[85px] max-md:pt-[28px]">
      <section className="mx-auto w-full max-w-[1120px] px-4 max-md:px-[10px]">
        <header className="mb-[42px] text-center max-md:mb-[26px]">
          <h1 className="mb-[10px] text-[50px] font-extrabold leading-none tracking-[-0.04em] text-[#252a31] max-md:text-[34px]">
            Our Gallery
          </h1>

          <div className="mx-auto mb-[17px] h-[4px] w-[60px] rounded-full bg-[#2f6245] max-md:mb-[13px]" />

          <p className="m-0 text-[14px] font-normal leading-none text-[#555b63] max-md:text-[13px]">
            Take a look at our fleet and services
          </p>
        </header>

        <div className="grid grid-cols-5 gap-x-[14px] gap-y-[14px] max-lg:grid-cols-4 max-md:grid-cols-2 max-md:gap-[10px]">
          {gallery.map((item, index) => (
            <button
              type="button"
              key={item.src || index}
              onClick={() => setActiveImage(item)}
              className="group relative h-[212px] overflow-hidden rounded-[7px] bg-[#e5e7eb] text-left shadow-none outline-none max-md:h-[145px]"
              aria-label={`Open gallery image ${index + 1}`}
            >
              <img
                src={item.src}
                alt={item.alt || `ENA Coach gallery image ${index + 1}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
              />

              <span className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/35" />

              <span className="absolute left-1/2 top-1/2 grid h-[38px] w-[38px] -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-white/95 text-[#ff5b00] opacity-0 shadow-[0_6px_18px_rgba(0,0,0,0.25)] transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                <MagnifyIcon />
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeImage && (
        <Lightbox image={activeImage} onClose={() => setActiveImage(null)} />
      )}
    </main>
  );
}

function Lightbox({ image, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/90">
      <button
        type="button"
        aria-label="Close gallery image"
        onClick={onClose}
        className="absolute right-[28px] top-[45px] z-[1001] grid h-[32px] w-[32px] place-items-center text-[34px] font-light leading-none text-white/90 transition hover:text-white max-md:right-[14px] max-md:top-[18px]"
      >
        ×
      </button>

      <button
        type="button"
        aria-label="Close image preview"
        onClick={onClose}
        className="absolute inset-0 z-[999] cursor-default"
      />

      <div className="relative z-[1000] flex h-full w-full items-start justify-center px-4 pt-[82px] max-md:items-center max-md:px-[10px] max-md:pt-0">
        <img
          src={image.src}
          alt={image.alt || 'ENA Coach gallery preview'}
          className="max-h-[84vh] w-auto max-w-[910px] rounded-[4px] object-contain shadow-[0_18px_70px_rgba(0,0,0,0.45)] max-md:max-h-[78vh] max-md:max-w-full"
        />
      </div>
    </div>
  );
}

function MagnifyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[19px] w-[19px] fill-none stroke-current"
    >
      <path
        d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z"
        strokeWidth="2"
      />
      <path
        d="m16.2 16.2 4.3 4.3"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}