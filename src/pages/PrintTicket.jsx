import { useState } from 'react';

export default function PrintTicket() {
  const [form, setForm] = useState({
    ticketNumber: '',
    mobileNumber: '',
  });

  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.ticketNumber.trim()) {
      setError('Enter your ticket number.');
      return;
    }

    if (!form.mobileNumber.trim()) {
      setError('Enter your mobile number.');
      return;
    }

    console.log('Print ticket payload:', form);
  }

  return (
    <main className="w-full bg-white px-4 pb-[290px] pt-[80px] max-md:px-[10px] max-md:pb-[120px] max-md:pt-[24px]">
      <section className="mx-auto w-full max-w-[650px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[6px] bg-[#fff7f2] px-[14px] pb-[14px] pt-[15px]"
        >
          <h3 className="mb-[12px] text-[12px] font-semibold leading-none tracking-[-0.02em] text-[#24282d]">
            Print Ticket
          </h3>

          <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1 max-md:gap-[10px]">
            <label className="block">
              <span className="mb-[8px] block text-[13px] font-extrabold leading-none text-[#24282d]">
                Ticket Number
              </span>

              <input
                type="text"
                name="ticketNumber"
                value={form.ticketNumber}
                onChange={updateField}
                placeholder="e.g XYZ123456789"
                className="h-[45px] w-full rounded-[5px] border border-[#ff9b6a] bg-white px-[11px] text-[13px] font-normal text-[#24282d] outline-none placeholder:text-[#707070] focus:border-[#ff5b00]"
              />
            </label>

            <label className="block">
              <span className="mb-[8px] block text-[13px] font-extrabold leading-none text-[#24282d]">
                Mobile Number
              </span>

              <input
                type="tel"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={updateField}
                placeholder="e.g 0785700700"
                className="h-[45px] w-full rounded-[5px] border border-[#ff9b6a] bg-white px-[11px] text-[13px] font-normal text-[#24282d] outline-none placeholder:text-[#707070] focus:border-[#ff5b00]"
              />
            </label>
          </div>

          {error && (
            <p className="mt-[8px] text-[12px] font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="mt-[14px] flex justify-end">
            <button
              type="submit"
              className="inline-flex h-[px] items-center justify-center gap-[7px] rounded-full bg-[#ff5b00] px-[14px] text-[13px] font-medium text-white transition hover:bg-[#ef5200]"
            >
              <SearchIcon />
              Print Ticket
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[15px] w-[15px] fill-none stroke-current"
    >
      <path
        d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z"
        strokeWidth="2"
      />
      <path
        d="m16.2 16.2 4.3 4.3"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}