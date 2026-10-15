import { chooseUs } from '../../data/siteData.js';

export default function WhyChooseSection() {
  return (
    <section className="w-full bg-white pt-[2px] pb-[14px] max-md:pt-0 max-md:pb-[6px]">
      <div className="mx-auto w-[min(1120px,calc(100%-32px))] max-md:w-[calc(100%-12px)]">
        <SectionHeader
          title="Why Choose Us"
          subtitle="Experience the best transport service in the region"
        />

        <div className="grid grid-cols-3 gap-2 max-md:grid-cols-1 max-md:gap-[6px]">
          {chooseUs.map((item, index) => (
            <article
              key={item.title}
              className={`
                grid min-h-[85px] grid-cols-[48px_1fr] items-center gap-[14px] rounded-[10px] border bg-white px-[14px] py-3 shadow-[0_10px_24px_rgba(0,0,0,0.035)]
                max-md:min-h-[54px] max-md:grid-cols-[38px_1fr] max-md:gap-2 max-md:rounded-[6px] max-md:px-[9px] max-md:py-[7px]
                ${index === 1 ? 'border-[#111111]' : 'border-[#d8dce1]'}
              `}
            >
              <div className="grid h-[43px] w-[43px] place-items-center overflow-hidden rounded-[7px] bg-[#eef9f5] max-md:h-[34px] max-md:w-[34px] max-md:rounded-[5px]">
                <img
                  src={item.icon}
                  alt=""
                  className="h-[36px] w-[36px] object-contain max-md:h-[28px] max-md:w-[28px]"
                />
              </div>

              <div>
                <strong className="mb-1 block text-[14px] font-extrabold leading-[1.1] text-[#24282d] max-md:mb-[2px] max-md:text-[10px]">
                  {item.title}
                </strong>
                <p className="m-0 line-clamp-2 overflow-hidden text-[11.5px] font-normal leading-[1.35] text-[#59616a] max-md:text-[6.9px]">
                  {item.body || item.description}
                </p>
              </div>
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