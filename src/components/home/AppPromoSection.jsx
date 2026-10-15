export default function AppPromoSection() {
  return (
    <section className="w-full bg-white pb-5 max-md:pb-0">
      <div className="mx-auto grid min-h-[330px] w-[min(1120px,calc(100%-32px))] grid-cols-2 items-start max-md:min-h-0 max-md:w-[calc(100%-12px)] max-md:grid-cols-1">
        <div className="flex flex-col items-center">
          <img
            src="/assets/travler-phone-compressed-removebg-preview.png"
            alt="Travler app"
            className="h-[230px] w-[360px] max-w-full object-contain object-bottom max-md:h-[155px] max-md:w-[185px]"
          />

          <div className="mt-[-2px] flex items-center justify-center gap-[14px] max-md:mt-[2px] max-md:flex-col max-md:gap-2">
            <img
              src="/assets/googleapp.webp"
              alt="Get it on Google Play"
              className="h-[60px] w-[198px] object-contain max-md:h-[35px] max-md:w-[116px]"
            />
            <img
              src="/assets/apple.webp"
              alt="Download on the App Store"
              className="h-[60px] w-[198px] object-contain max-md:h-[35px] max-md:w-[116px]"
            />
          </div>
        </div>

        <div className="flex flex-col items-center pt-2 max-md:pt-[10px]">
          <img
            src="/assets/enacoach_logo.png"
            alt="ENA Coach"
            className="h-[170px] w-[330px] max-w-full object-contain max-md:h-[94px] max-md:w-[170px]"
          />

          <img
            src="/assets/googleapp.webp"
            alt="Get it on Google Play"
            className="mt-1 h-[62px] w-[205px] object-contain max-md:mt-[7px] max-md:h-[35px] max-md:w-[116px]"
          />
        </div>
      </div>
    </section>
  );
}