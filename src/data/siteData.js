import { allPlaces } from './routePrices.js';

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Print Ticket', href: '/print-ticket' },
  { label: 'Contact Us', href: '/contact' },
  
  { label: 'Gallery', href: '/gallery' },
  
];

// One authoritative place list, as supplied in the route-and-fare data.
export const towns = allPlaces;

export const popularRoutes = [
  { from: 'Mombasa', to: 'Kisii', subtitle: 'Coast to western highlands', duration: '10h 30m' },
  { from: 'Kehancha', to: 'Nairobi', subtitle: 'Daily intercounty service', duration: '7h 00m' },
  { from: 'Kisii', to: 'Nairobi', subtitle: 'Reliable night and day trips', duration: '5h 00m' },
  { from: 'Kisumu', to: 'Mombasa', subtitle: 'Long-distance connection', duration: '14h 00m' },
  { from: 'Kisumu', to: 'Busia', subtitle: 'Western corridor route', duration: '2h 30m' },
  { from: 'Nairobi', to: 'Mombasa', subtitle: 'Capital to coast express', duration: '8h 00m' },
  { from: 'Nairobi', to: 'Homabay', subtitle: 'Lake region route', duration: '7h 30m' },
  { from: 'Nairobi', to: 'Mbita', subtitle: 'Comfort route to the lake', duration: '8h 10m' },
  { from: 'Nairobi', to: 'Kapsabet', subtitle: 'Rift Valley connection', duration: '6h 20m' },
];

export const stats = [
  { value: '30+', label: 'Routes covered' },
  { value: '24/7', label: 'Online booking' },
  { value: '3', label: 'Main service pillars' },
  { value: '2010', label: 'Operating heritage' },
];

export const services = [
  {
    title: 'Book Online',
    body: 'Search trips, choose seats, reserve tickets, and connect the form to your backend booking engine.',
    icon: 'ticket',
  },
  {
    title: 'Parcel Handling',
    body: 'A dedicated parcel section prepared for rates, tracking, pickup offices, and dispatch status.',
    icon: 'parcel',
  },
  {
    title: 'Comfort Travel',
    body: 'Reusable cards for amenities such as Wi-Fi, VIP seats, charging ports, and modern coaches.',
    icon: 'comfort',
  },
];

export const offices = [
  { city: 'Nairobi', name: 'Main Booking Office', phone: '0709 832 000', address: 'Haile Selassie Avenue' },
  { city: 'Mombasa', name: 'Coast Office', phone: '0731 101 890', address: 'Mombasa Road / CBD' },
  { city: 'Kisumu', name: 'Kisumu Office', phone: '0709 832 000', address: 'Bank Street / Main Stage' },
  { city: 'Kisii', name: 'Kisii Office', phone: '0709 832 000', address: 'Town Booking Office' },
];

export const gallery = [
  { src: '/assets/gallery/gallery-1.png', alt: 'Tahmeed Coach fleet image 1' },
  ...Array.from({ length: 2 }, (_, index) => ({
    src: `/assets/gallery/gallery-${index + 2}.jpg`,
    alt: `Tahmeed Coach fleet image ${index + 2}`,
  })),
];

export const heroSlides = [
  {
    id: 1,
    image: '/assets/image1.png',
    alt: 'ENA Coach bus travelling on a Kenyan highway',
  },
  {
    id: 2,
    image: '/assets/image2.jpg',
    alt: 'ENA Coach bus exterior view',
  },
  {
    id: 3,
    image: '/assets/image3.jpg',
    alt: 'ENA Coach fleet on route',
  },
];

export const amenities = [
  {
    id: 'wifi',
    title: 'Free Wi-Fi',
    icon: '/assets/amenities/wi-fi.png',
    tone: 'blue',
  },
  {
    id: 'power',
    title: 'Power Outlets',
    icon: '/assets/amenities/power.png',
    tone: 'green',
  },
  {
    id: 'legroom',
    title: 'Extra Legroom',
    icon: '/assets/amenities/seats.png',
    tone: 'yellow',
  },
];

export const whyChooseUs = [
  {
    id: 'mpesa',
    title: 'Lipa na M-Pesa',
    icon: '/assets/WEB/mpesa.webp',
    body: 'We have introduced several options to book from the comfort of your home or from whichever location you are, e.g. Lipa Na Mpesa.',
    description: 'We have introduced several options to book from the comfort of your home or from whichever location you are, e.g. Lipa Na Mpesa.',
  },
  {
    id: 'comfort',
    title: 'Comfort',
    icon: '/assets/WEB/thumbs.webp',
    body: 'We have the most comfortable buses on the Kenyan roads with lots of legroom to ensure that you reach your destination fully refreshed.',
    description: 'We have the most comfortable buses on the Kenyan roads with lots of legroom to ensure that you reach your destination fully refreshed.',
  },
  {
    id: 'amenities',
    title: 'Full Amenities',
    icon: '/assets/WEB/ticket.webp',
    body: 'Our buses are fitted with high speed internet connection via Wi-Fi and power outlets to charge your devices on the go.',
    description: 'Our buses are fitted with high speed internet connection via Wi-Fi and power outlets to charge your devices on the go.',
  },
];

export const showcaseImages = [
  {
    id: 1,
    image: '/assets/image1 (4).jpg',
    alt: 'ENA Coach bus front view on the road',
  },
  {
    id: 2,
    image: '/assets/image1 (5).jpg',
    alt: 'ENA Coach bus rear side view on the road',
  },
];

export const topRoutes = [
  'Mombasa Kilifi Kanamai',
  'Nairobi Kilifi',
  'Nairobi Kisumu',
  'Mombasa - Kisumu - Busia',
  'Nairobi - Mombasa',
  'Nairobi - Homabay - Mbita',
  'Nairobi - Kapkatet - Kakamega - Busia',
  'Port Victoria - Mombasa',
];

export const chooseUs = whyChooseUs;
export const routePills = topRoutes;

export const bookingDefaults = {
  tripTypes: ['One Way', 'Round Trip'],
  fromPlaceholder: 'Source',
  toPlaceholder: 'Destination',
  travelDateLabel: 'TRAVEL DATE',
  quickDateText: 'Today Tom',
  dateText: '9 May, 2026',
  buttonLabel: 'SEARCH BUS',
  bookingPartnerText: 'Book your next ticket using',
  bookingPartnerLogo: '/assets/Travellerlogo.svg',
};

export const appPromo = {
  phoneImage: '/assets/travler-phone.png',
  logo: '/assets/logo.svg',
  title: 'Book your ENA Coach tickets faster',
  description:
    'Use the mobile-friendly booking experience to search routes, select seats and manage your travel with ease.',
};

export const companyInfo = {
  name: 'ENA Coach',
  tagline: 'Exemplary Service',
  supportLabel: 'Support',
  accountLabel: 'My Account',
  logo: '/assets/logo.svg',
  flagIcon: '/assets/uk-flag.svg',
};

export const homeSections = {
  hero: {
    slides: heroSlides,
    booking: bookingDefaults,
  },
  amenities: {
    eyebrow: 'Amenities',
    title: 'Amenities',
    subtitle: 'Offering world-class transportation services in an innovative way.',
    items: amenities,
  },
  whyChooseUs: {
    eyebrow: 'Why Choose Us',
    title: 'Why Choose Us',
    subtitle: 'Experience the best transport service in the region.',
    items: whyChooseUs,
  },
  showcase: {
    images: showcaseImages,
  },
  topRoutes: {
    title: 'Our top routes',
    items: topRoutes,
  },
  appPromo,
};
