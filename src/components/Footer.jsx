
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkoutApi } from '../api/checkoutApi';

const footerLinks = [
  { label: 'About', href: '/about' },
  { label: 'Print Ticket', href: '/print-ticket' },
  { label: 'Get In Touch', href: '/contact' },
  { label: 'Terms', href: '/terms' },
  { label: 'EPH T&C', href: '/terms-and-conditions' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
];

const socialLinks = [
  {
    label: 'Facebook',
    href: '#',
    image: '/assets/footer/facebook.svg',
  },
  {
    label: 'X',
    href: '#',
    image: '/assets/footer/x.svg',
  },
  {
    label: 'Instagram',
    href: '#',
    image: '/assets/footer/instagram.svg',
  },
  {
    label: 'TikTok',
    href: '#',
    image: '/assets/footer/tiktok.svg',
  },
];

// ==========================================
// REAL WHATSAPP SVG ICON
// ==========================================

function WhatsAppIcon({ size = 22, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.198.297-.768.965-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.475-.883-.788-1.48-1.76-1.653-2.057-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.52-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01s-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.261.489 1.693.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.618h-.004a9.87 9.87 0 0 1-5.03-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.513-5.26C2.167 6.69 6.69 2.166 12.043 2.166a9.81 9.81 0 0 1 6.977 2.892 9.81 9.81 0 0 1 2.89 6.978c-.003 5.352-4.525 9.875-9.859 9.875M20.52 3.46A11.9 11.9 0 0 0 12.044 0C5.488 0 .152 5.336.149 11.895a11.86 11.86 0 0 0 1.588 5.946L0 24l6.306-1.654a11.9 11.9 0 0 0 5.733 1.461h.005c6.557 0 11.894-5.336 11.897-11.895A11.85 11.85 0 0 0 20.52 3.46" />
    </svg>
  );
}

// ==========================================
// FOOTER COMPONENT
// ==========================================

export default function Footer() {
  const navigate = useNavigate();

  const [whatsApp, setWhatsApp] = useState('');

  // ==========================================
  // LOAD WHATSAPP NUMBER FROM BACKEND
  // ==========================================

  useEffect(() => {
    let active = true;

    checkoutApi
      .config()
      .then((config) => {
        if (!active) return;

        const number = String(
          config?.supportWhatsApp || ''
        ).replace(/\D/g, '');

        setWhatsApp(number);
      })
      .catch((error) => {
        console.error(
          'Failed to load WhatsApp support configuration:',
          error
        );
      });

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // OPEN WHATSAPP WITH PREFILLED MESSAGE
  // ==========================================

  const openWhatsApp = () => {
    if (!whatsApp) {
      navigate('/support');
      return;
    }

    const message =
      'Hello Tahmeed I would like to get help with my booking.';

    const whatsappUrl =
      `https://wa.me/${whatsApp}?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <footer className="relative w-full bg-[#000000] text-white">

      {/* =====================================
          TOP FOOTER - GREY BACKGROUND
         ===================================== */}

      <div className="w-full bg-[#999999]">
        <div
          className="
            mx-auto
            grid
            min-h-[87px]
            max-w-[1130px]
            grid-cols-[1fr_1fr_1fr_1.65fr]
            items-center
            gap-x-4
            px-5

            max-[520px]:grid-cols-2
            max-[520px]:gap-y-4
            max-[520px]:py-5
          "
        >

          {/* ENA COACH LOGO */}
          <a
            href="/"
            aria-label="ENA Coach home"
            className="flex items-center justify-center"
          >
            <img
              src="/assets/enacoach_logo.png"
              alt="ENA Coach"
              className="
                h-[40px]
                max-w-full
                object-contain
                max-md:h-[33px]
              "
            />
          </a>

          {/* TRAVLER LOGO */}
          <div className="flex items-center justify-center">
            <img
              src="/assets/Travellerlogo.svg"
              alt="Travler"
              className="
                h-[38px]
                max-w-full
                object-contain
                max-md:h-[32px]
              "
            />
          </div>

          {/* VOLTIC LOGO */}
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="/assets/voltic-logo.svg"
              alt="Voltic"
              className="
                h-[42px]
                max-w-full
                object-contain
                max-md:h-[35px]
              "
            />

            <span
              className="
                mt-[2px]
                whitespace-nowrap
                text-[10px]
                font-normal
                leading-none
                text-[#454545]
                max-md:text-[8px]
              "
            >
              Powered by voltic
            </span>
          </div>

          {/* DOWNLOAD APP */}
          <div className="flex flex-col items-center justify-center">

            <p
              className="
                mb-[6px]
                text-[12px]
                font-normal
                leading-none
                text-[#252525]
              "
            >
              Download App
            </p>

            <div className="flex items-center justify-center gap-[12px] max-md:gap-[7px]">

              <a
                href="#"
                aria-label="Get it on Google Play"
              >
                <img
                  src="/assets/googleapp.webp"
                  alt="Get it on Google Play"
                  className="
                    h-[27px]
                    w-[101px]
                    max-w-full
                    rounded-[3px]
                    object-contain
                    max-md:h-[25px]
                    max-md:w-[85px]
                  "
                />
              </a>

              <a
                href="#"
                aria-label="Download on the App Store"
              >
                <img
                  src="/assets/apple.webp"
                  alt="Download on the App Store"
                  className="
                    h-[27px]
                    w-[101px]
                    max-w-full
                    rounded-[3px]
                    object-contain
                    max-md:h-[25px]
                    max-md:w-[85px]
                  "
                />
              </a>

            </div>
          </div>

        </div>
      </div>

      {/* =====================================
          BOTTOM FOOTER - BLACK BACKGROUND
         ===================================== */}

      <div className="w-full bg-[#000000]">
        <div
          className="
            mx-auto
            grid
            min-h-[44px]
            max-w-[1130px]
            grid-cols-[230px_1fr_150px]
            items-center
            gap-x-3
            px-5

            max-lg:grid-cols-[1fr_auto]
            max-lg:gap-y-3
            max-lg:py-3

            max-sm:grid-cols-1
            max-sm:justify-items-center
            max-sm:gap-y-3
          "
        >

          {/* CONTACT EMAIL */}
          <a
            href="mailto:info@tahmeedcoach.co.ke"
            className="
              flex
              items-center
              gap-[7px]
              whitespace-nowrap
              text-[11px]
              font-normal
              text-white
              transition
              hover:text-[#cccccc]
            "
          >
            <Mail size={15} strokeWidth={1.7} />

            <span>info@tahmeedcoach.co.ke</span>
          </a>

          {/* FOOTER NAVIGATION */}
          <nav
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-[13px]
              gap-y-2
              text-[10px]
              font-normal
              leading-none
              text-white

              max-lg:col-span-2
              max-lg:row-start-2

              max-sm:col-span-1
              max-sm:row-auto
            "
          >
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  whitespace-nowrap
                  text-white
                  transition-colors
                  hover:text-[#cccccc]
                "
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* SOCIAL MEDIA ICONS */}
          

        </div>
      </div>

      {/* =====================================
          FLOATING WHATSAPP SUPPORT BUTTONS
         ===================================== */}

      <div
        className="
          fixed
          bottom-[22px]
          right-[22px]
          z-50
          flex
          items-center
          gap-[10px]

          max-sm:bottom-[16px]
          max-sm:right-[12px]
        "
      >

        {/* =====================================
            NEED HELP - WHATSAPP BUTTON
           ===================================== */}

        <button
          type="button"
          onClick={openWhatsApp}
          aria-label="Need help? Chat with Tahmeed on WhatsApp"
          title="Chat with Tahmeed on WhatsApp"
          className="
            flex
            h-[44px]
            items-center
            justify-center
            gap-[9px]
            rounded-full
            border
            border-[#dedede]
            bg-white
            px-[17px]
            text-[13px]
            font-semibold
            text-[#222222]
            shadow-[0_4px_15px_rgba(0,0,0,0.15)]
            transition-all
            duration-200

            hover:border-[#25D366]
            hover:bg-[#f0fff5]

            max-sm:h-[42px]
            max-sm:px-[13px]
            max-sm:text-[12px]
          "
        >
          <WhatsAppIcon
            size={21}
            className="text-[#25D366]"
          />

          <span>Need help?</span>
        </button>

        {/* =====================================
            FLOATING WHATSAPP ICON
           ===================================== */}

        <button
          type="button"
          aria-label="Chat with Tahmeed on WhatsApp"
          title="WhatsApp Support"
          onClick={openWhatsApp}
          className="
            flex
            h-[54px]
            w-[54px]
            items-center
            justify-center
            rounded-full
            bg-[#25D366]
            text-white
            shadow-[0_5px_18px_rgba(0,0,0,0.25)]
            transition-all
            duration-200

            hover:scale-110
            hover:bg-[#20bd5a]

            max-sm:h-[49px]
            max-sm:w-[49px]
          "
        >
          <WhatsAppIcon size={28} />
        </button>

      </div>

    </footer>
  );
}
