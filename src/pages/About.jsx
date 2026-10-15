
export default function About() {
  return (
    <main className="min-h-[calc(100vh-120px)] w-full bg-white px-4 pb-[140px] pt-[42px] max-md:px-[10px] max-md:pb-[90px] max-md:pt-[14px]">
      <section className="mx-auto w-full max-w-[1140px]">
        <article className="min-h-[348px] rounded-[12px] border border-[#d8dce1] bg-white px-[42px] pb-[44px] pt-[41px] max-md:min-h-0 max-md:rounded-[8px] max-md:px-[16px] max-md:py-[22px]">
          <h1 className="mb-[24px] text-[30px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#252a31] max-md:mb-[16px] max-md:text-[22px]">
            About Tahmeed
          </h1>

          <div className="max-w-[1045px] space-y-[6px] text-[16px] font-normal leading-[1.52] text-[#242930] max-md:space-y-[8px] max-md:text-[14px] max-md:leading-[1.55]">
            <p>
              <strong>Tahmeed Transporters</strong> is your premier bus company covering top
              cities across Kenya, Uganda, and Tanzania. With a decade of experience
              and a fleet of over 50 luxurious buses, we provide a 5-star travel
              experience defined by professionalism, safety, and punctuality.
            </p>

            <p>
              Tahmeed Transporters is seamless
            </p>

            <ul className="list-disc space-y-[6px] pl-[31px] text-[13px] marker:text-red-600 max-md:text-[12px]">
              <li>
                Search for available routes across the East African region.
              </li>
              <li>
                Select your preferred luxury bus from our modern fleet.
              </li>
              <li>
                Enjoy premium amenities like WiFi, AC, and reclining seats.
              </li>
              <li>
                Travel safely and affordably to your destination.
              </li>
            </ul>

            <p>
              Our buses come equipped with free WiFi, electrical charging outlets,
              DVD players, and flat-screen TVs, all supported by highly responsive
              customer service.
            </p>

            <p>
              <strong>
                NEED A SAFE, COMFORTABLE, AND AFFORDABLE BUS TRANSPORT SERVICE?
              </strong>
            </p>

            <p>
              Then Tahmeed Transporters is the provider for you.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
