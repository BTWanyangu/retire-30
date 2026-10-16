export default function Support() {
  return (
    <main className="w-full bg-white pt-[34px] pb-[48px] max-md:pt-[24px] max-md:pb-[90px]">
      <section className="mx-auto w-full max-w-[1152px] px-4 text-center max-md:px-[10px]">
        <div className="mx-auto mb-[20px] flex justify-center max-md:mb-[14px]">
          <img
            src="/assets/support/desktop-support.svg"
            alt="Customer support"
            className="h-[278px] w-[360px] object-contain max-md:h-[205px] max-md:w-[270px]"
          />
        </div>

        <h1 className="text-[40px] font-extrabold leading-none tracking-[-0.03em] text-[#073575] max-md:text-[28px]">
          Tahmeed Coach Customer Support
        </h1>

        <p className="mt-[12px] text-[13px] font-normal leading-none text-[#555b63] max-md:mt-[9px]">
          24/7 Customer Support
        </p>

        <div className="mt-[40px] grid grid-cols-4 gap-[20px] max-lg:grid-cols-2 max-md:mt-[28px] max-md:grid-cols-1 max-md:gap-[14px]">
          <SupportCard
            color="cyan"
            icon={<PhoneIcon />}
            title="Call Us"
          >
            <div className="mt-[14px] grid grid-cols-2 gap-[5px]">
              <a
                href="tel:0709832000"
                className="grid h-[28px] place-items-center rounded-[4px] bg-white text-[12px] font-semibold text-[#111827]"
              >
                0752651226
              </a>
              
            </div>
          </SupportCard>

          <SupportCard
            color="green"
            icon={<WhatsAppIcon />}
            title="Chat on WhatsApp"
          >
            <a
              href="https://wa.me/254752651226"
              target="_blank"
              rel="noreferrer"
              className="mt-[9px] block text-[12px] font-extrabold text-[#111827]"
            >
              0752651226
            </a>
          </SupportCard>

          <SupportCard
            color="yellow"
            icon={<MailIcon />}
            title="Email Us"
          >
            <a
              href="mailto:info@tahmeedcoach.co.ke"
              className="mt-[9px] block text-[12px] font-extrabold text-[#111827]"
            >
              info@tahmeedcoach.co.ke
            </a>
          </SupportCard>

          <SupportCard
            color="purple"
            icon={<ClockIcon />}
            title="Availability"
          >
            <p className="mt-[12px] text-[11.5px] font-normal leading-[1.35] text-[#555b63]">
              24/7, including weekends &amp; public holidays
            </p>
          </SupportCard>
        </div>

        <p className="mt-[57px] text-[11px] font-normal text-[#6b7280] max-md:mt-[28px]">
          Ena Coach © 2026 - All Rights Reserved
        </p>
      </section>
    </main>
  );
}

function SupportCard({ color, icon, title, children }) {
  const colorClasses = {
    cyan: 'bg-[#c9f6ff] text-[#09b9e8]',
    green: 'bg-[#caeadc] text-[#05a265]',
    yellow: 'bg-[#fff0bd] text-[#f6b600]',
    purple: 'bg-[#dfc2f2] text-[#111111]',
  };

  return (
    <article className="min-h-[199px] rounded-[14px] bg-[#f8f9fa] px-[20px] pt-[20px] pb-[18px] shadow-[0_18px_40px_rgba(0,0,0,0.035)] max-md:min-h-[170px]">
      <div
        className={`mx-auto grid h-[55px] w-[55px] place-items-center rounded-full ${
          colorClasses[color] || colorClasses.cyan
        }`}
      >
        {icon}
      </div>

      <h2 className="mt-[21px] text-[16px] font-extrabold leading-none text-[#252a31] max-md:mt-[16px]">
        {title}
      </h2>

      {children}
    </article>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[25px] w-[25px] fill-current" aria-hidden="true">
      <path d="M7.2 2.8c.5-.3 1.2-.2 1.6.3l2.1 2.9c.3.4.3 1 0 1.4L9.7 9.1c.9 1.8 2.4 3.3 4.2 4.2l1.7-1.2c.4-.3 1-.3 1.4 0l2.9 2.1c.5.4.6 1.1.3 1.6l-1.4 2.5c-.4.7-1.1 1.1-1.9 1.1C10.1 19.4 4.6 13.9 4.6 7.1c0-.8.4-1.5 1.1-1.9l1.5-2.4Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[25px] w-[25px] fill-none stroke-current" aria-hidden="true">
      <path
        d="M12 3.5a8.4 8.4 0 0 0-7.2 12.8L3.8 20l3.8-1a8.5 8.5 0 1 0 4.4-15.5Z"
        strokeWidth="1.8"
      />
      <path
        d="M8.6 8.5c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.4.5c-.1.2-.2.3-.1.5.4.8 1.1 1.5 2.2 2 .2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .6-.5 1.5-1.2 1.7-.6.2-2.4.1-4.5-1.7-2.1-1.8-3.1-4.1-2.9-5.1Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[25px] w-[25px] fill-none stroke-current" aria-hidden="true">
      <path d="M4 6h16v12H4V6Z" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[25px] w-[25px] fill-none stroke-current" aria-hidden="true">
      <path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" strokeWidth="1.8" />
      <path d="M12 9v4l2.6 1.7" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 2 4 5M17 2l3 3" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}