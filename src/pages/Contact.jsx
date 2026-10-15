import { useState } from 'react';

const offices = [
  {
    title: 'Head Office',
    lines: ['Haile Selassie Avenue, Nairobi', 'KPCU Building (Wakulima House)'],
  },
  {
    title: 'Mombasa Office',
    lines: ['Majengo, opposite KCB Bank, Mvita'],
  },
  {
    title: 'Kisumu Office',
    lines: ['Near KPLC, off Oginga Odinga Street'],
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+254',
    mobile: '',
    subject: '',
    message: '',
  });

  const [notice, setNotice] = useState('');

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setNotice('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.mobile ||
      !form.subject ||
      !form.message
    ) {
      setNotice('Please fill in all fields before sending.');
      return;
    }

    console.log('Contact form payload:', form);
    setNotice('Message ready to send.');
  }

  return (
    <main className="w-full bg-white pb-[95px] max-md:pb-[90px]">
      <ContactHero />

      <section className="mx-auto w-full max-w-[950px] px-4 pt-0 max-md:px-[10px]">
        <h1 className="mb-[14px] text-center text-[34px] font-normal leading-none tracking-[-0.02em] text-[#252a31] max-md:mb-[14px] max-md:text-[26px]">
          Get In Touch
        </h1>

        <div className="grid min-h-[484px] grid-cols-[374px_1fr] overflow-hidden rounded-[11px] border border-[#d5dce3] bg-white max-md:grid-cols-1 max-md:rounded-[10px]">
          <ContactDetails />

          <form
            onSubmit={handleSubmit}
            className="rounded-l-[11px] bg-[#eeeeee] px-[26px] pb-[32px] pt-[27px] max-md:rounded-l-none max-md:px-[16px] max-md:py-[20px]"
          >
            <div className="grid grid-cols-2 gap-x-[14px] gap-y-[16px] max-md:grid-cols-1 max-md:gap-y-[14px]">
              <FormField
                label="First Name"
                name="firstName"
                value={form.firstName}
                placeholder="Enter first name"
                onChange={updateField}
              />

              <FormField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                placeholder="Enter last name"
                onChange={updateField}
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                placeholder="Enter email address"
                onChange={updateField}
              />

              <MobileField
                countryCode={form.countryCode}
                mobile={form.mobile}
                onChange={updateField}
              />

              <div className="col-span-2 max-md:col-span-1">
                <FormField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  placeholder="Enter subject of enquiry / your message"
                  onChange={updateField}
                />
              </div>

              <label className="col-span-2 block max-md:col-span-1">
                <span className="mb-[9px] block text-[13px] font-normal leading-none text-[#303030]">
                  Message
                </span>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={updateField}
                  placeholder="Your message"
                  rows={5}
                  className="h-[96px] w-full resize-none rounded-[5px] border border-[#d7d7d7] bg-white px-[10px] py-[12px] text-[14px] font-normal text-[#252a31] shadow-[inset_0_1px_5px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#5e6570] focus:border-[#ff8b50] max-md:h-[120px]"
                />
              </label>
            </div>

            {notice && (
              <p className="mt-[10px] text-[13px] font-medium text-[#c44900]">
                {notice}
              </p>
            )}

            <button
              type="submit"
              className="mt-[8px] h-[41px] rounded-full bg-[#ff8b50] px-[28px] text-[13px] font-medium text-white transition hover:bg-[#ff751f] max-md:mt-[16px] max-md:w-full"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ContactHero() {
  return (
    <section className="mb-[6px] h-[195px] w-full bg-gradient-to-r from-[#ff7933] via-[#ff5b00] to-[#ea4300] max-md:mb-[10px] max-md:h-[160px]">
      <div className="mx-auto flex h-full w-full max-w-[1120px] flex-col justify-center px-[10px] text-white">
        <h2 className="max-w-[390px] text-[40px] font-extrabold leading-[1.2] tracking-[-0.02em] max-md:max-w-[280px] max-md:text-[31px]">
          Travel Smarter &amp; save more
        </h2>

        <p className="mt-[18px] max-w-[625px] text-[13px] font-normal leading-[1.55] max-md:mt-[12px] max-md:max-w-[330px] max-md:text-[11.5px]">
          Discover smarter routes, unbeatable deals, and a seamless booking experience — all in one
          place. Travel better, for less.
        </p>
      </div>
    </section>
  );
}

function ContactDetails() {
  return (
    <aside className="bg-white px-[19px] pb-[22px] pt-[22px] max-md:px-[16px] max-md:py-[20px]">
      <h2 className="mb-[27px] text-[20px] font-extrabold leading-none text-[#252a31] max-md:mb-[18px] max-md:text-[20px]">
        Contact Details
      </h2>

      <div className="mb-[22px] h-px w-full bg-[#c8c8c8]" />

      <h3 className="mb-[7px] text-[16px] font-extrabold leading-none text-[#252a31]">
        Head Office:
      </h3>

      <div className="space-y-[7px]">
        {offices.map((office) => (
          <article
            key={office.title}
            className="rounded-[6px] border border-[#d8dfe5] bg-white px-[7px] pb-[9px] pt-[9px]"
          >
            <strong className="mb-[7px] block text-[13px] font-extrabold leading-none text-[#252a31]">
              {office.title}
            </strong>

            <div className="space-y-[3px]">
              {office.lines.map((line) => (
                <p
                  key={line}
                  className="m-0 text-[11px] font-normal leading-[1.25] text-[#555b63]"
                >
                  {line}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-[21px] space-y-[25px]">
        <section>
          <h3 className="mb-[8px] text-[16px] font-extrabold leading-none text-[#252a31]">
            Helplines
          </h3>
          <p className="m-0 text-[13px] leading-[1.45] text-[#252a31]">
            Helplines: 0752651226
          </p>
          <p className="mt-[13px] text-[13px] leading-[1.4] text-[#252a31]">
            WhatsApp: 0752651226
          </p>
        </section>

        <section>
          <h3 className="mb-[9px] text-[16px] font-extrabold leading-none text-[#252a31]">
            Email
          </h3>
          <p className="m-0 text-[13px] leading-[1.5] text-[#252a31]">
            info@tahmeedcoach.co.ke
          </p>
        </section>
      </div>
    </aside>
  );
}

function FormField({
  label,
  name,
  value,
  placeholder,
  onChange,
  type = 'text',
}) {
  return (
    <label className="block">
      <span className="mb-[9px] block text-[13px] font-normal leading-none text-[#303030]">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-[39px] w-full rounded-[5px] border border-[#d7d7d7] bg-white px-[10px] text-[14px] font-normal text-[#252a31] shadow-[inset_0_1px_5px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#5e6570] focus:border-[#ff8b50]"
      />
    </label>
  );
}

function MobileField({ countryCode, mobile, onChange }) {
  return (
    <label className="block">
      <span className="mb-[9px] block text-[13px] font-normal leading-none text-[#303030]">
        Mobile Number
      </span>

      <div className="grid h-[39px] grid-cols-[89px_1fr] overflow-hidden rounded-[5px] border border-[#d7d7d7] bg-white shadow-[inset_0_1px_5px_rgba(0,0,0,0.08)]">
        <select
          name="countryCode"
          value={countryCode}
          onChange={onChange}
          className="h-full border-0 border-r border-[#d7d7d7] bg-white px-[10px] text-[14px] text-[#252a31] outline-none"
        >
          <option value="+254">+254</option>
          <option value="+255">+255</option>
          <option value="+256">+256</option>
          <option value="+250">+250</option>
        </select>

        <input
          type="tel"
          name="mobile"
          value={mobile}
          onChange={onChange}
          placeholder="Enter mobile number"
          className="h-full min-w-0 border-0 bg-white px-[10px] text-[14px] text-[#252a31] outline-none placeholder:text-[#5e6570]"
        />
      </div>
    </label>
  );
}