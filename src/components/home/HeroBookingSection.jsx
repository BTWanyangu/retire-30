import { useEffect, useState } from 'react';
import BookingSearch from '../BookingSearch.jsx';
import { heroSlides } from '../../data/siteData.js';

export default function HeroBookingSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[402px] w-full bg-[#f6f6f6] max-md:min-h-0 max-md:bg-white max-md:pt-[7px]">
      <div className="relative h-[402px] w-full overflow-hidden max-md:hidden" aria-label="ENA Coach image slider">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id || slide.image}
            role="img"
            aria-label={slide.alt}
            className={`
              absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700
              ${index === activeSlide ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>

      <div className="absolute bottom-[-37px] left-1/2 z-[5] w-[min(1145px,calc(100%-210px))] -translate-x-1/2 max-md:static max-md:mx-auto max-md:w-[calc(100%-12px)] max-md:translate-x-0">
        <BookingSearch />
      </div>
    </section>
  );
}