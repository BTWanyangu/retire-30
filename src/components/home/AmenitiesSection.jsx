import { amenities } from '../../data/siteData.js';

const toneClasses = {
  blue: 'border-[#cfe0ff] bg-[#eef5ff]',
  green: 'border-[#bfead0] bg-[#effaf3]',
  yellow: 'border-[#ffe5a6] bg-[#fff9ea]',
};

export default function AmenitiesSection() {
  return (
    <section className="w-full bg-white pt-[72px] pb-[10px] max-md:pt-2 max-md:pb-2">
      <div className="mx-auto w-[min(1120px,calc(100%-32px))] max-md:w-[calc(100%-12px)]">
        <SectionHeader
          title="Amenities"
          subtitle="Offering world-class transportation services in an innovative"
        />

        <div className="grid grid-cols-3 gap-[22px] max-md:grid-cols-2 max-md:gap-[7px]">
          {amenities.map((item, index) => (
            <article
              key={item.title}
              className={`
                flex min-h-[98px] flex-col items-center justify-center gap-[9px] rounded-[13px] border shadow-[0_12px_24px_rgba(0,0,0,0.035)]
                max-md:min-h-[51px] max-md:gap-[3px] max-md:rounded-[7px]
                ${toneClasses[item.tone] || toneClasses.blue}
                ${index === 2 ? 'max-md:col-span-2 max-md:w-[48%] max-md:justify-self-center' : ''}
              `}
            >
              <img
                src={item.icon}
                alt=""
                className="h-[48px] w-[48px] object-contain max-md:h-[26px] max-md:w-[26px]"
              />
              <strong className="text-[13px] font-extrabold leading-none text-[#17191d] max-md:text-[7px]">
                {item.title}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <header className="mb-4 max-md:mb-[10px]">
      <h2 className="mb-2 text-[25px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#20242a] max-md:mb-[5px] max-md:text-[14px] max-md:tracking-normal">
        {title}
      </h2>
      <p className="m-0 text-[14px] font-normal leading-[1.4] text-[#555b63] max-md:text-[8px] max-md:leading-[1.3]">
        {subtitle}
      </p>
    </header>
  );
}