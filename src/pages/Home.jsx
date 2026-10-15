import HeroBookingSection from '../components/home/HeroBookingSection.jsx';
import AmenitiesSection from '../components/home/AmenitiesSection.jsx';
import WhyChooseSection from '../components/home/WhyChooseSection.jsx';
import FleetSection from '../components/home/FleetSection.jsx';
import RoutesSection from '../components/home/RoutesSection.jsx';
import AppPromoSection from '../components/home/AppPromoSection.jsx';

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden bg-white text-[#20242a]">
      <HeroBookingSection />
      <AmenitiesSection />
      <WhyChooseSection />
      <FleetSection />
      <RoutesSection />
      <AppPromoSection />
    </main>
  );
}