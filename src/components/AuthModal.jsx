import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AuthModal({ open, onClose }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  function goToSignup() {
    onClose();
    navigate('/sign-up');
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/45">
      <button
        type="button"
        aria-label="Close login modal overlay"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="absolute left-1/2 top-[110px] z-[1000] w-[360px] -translate-x-1/2 rounded-[10px] border border-[#cfd6dd] bg-white px-[13px] pb-[16px] pt-[46px] shadow-[0_18px_55px_rgba(0,0,0,0.28)] max-md:top-[72px] max-md:w-[calc(100%-28px)]">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-[10px] top-[8px] grid h-[24px] w-[24px] place-items-center text-[28px] font-light leading-none text-[#6b6f75] hover:text-black"
        >
          ×
        </button>

        <div className="mb-[10px] text-center">
          <img
            src="/assets/logo-placeholder.svg"
            alt="ENA Coach"
            className="mx-auto h-[88px] w-[160px] object-contain"
          />
          <h2 className="mt-[-4px] text-[14px] font-normal uppercase leading-none text-[#1f2328]">
            Sign In
          </h2>
        </div>

        <form className="space-y-[9px]">
          <div className="grid grid-cols-[78px_1fr] gap-0">
            <label>
              <span className="mb-[7px] block text-[11px] font-normal uppercase leading-none text-[#20242a]">
                Code
              </span>
              <select className="h-[40px] w-full rounded-l-[4px] border border-[#d7dce1] bg-white px-[10px] text-[13px] outline-none">
                <option>254</option>
                <option>255</option>
                <option>256</option>
              </select>
            </label>

            <label>
              <span className="mb-[7px] block text-[11px] font-normal uppercase leading-none text-[#20242a]">
                Phone Number
              </span>
              <input
                type="number"
                defaultValue="700000000"
                className="h-[40px] w-full rounded-r-[4px] border border-l-0 border-[#d7dce1] bg-white px-[10px] text-[13px] outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-[7px] block text-[11px] font-normal uppercase leading-none text-[#20242a]">
              Password
            </span>

            <div className="grid h-[40px] grid-cols-[34px_1fr_33px] overflow-hidden rounded-[4px] border border-[#9aa8b8] bg-white">
              <span className="grid place-items-center border-r border-[#d7dce1] text-[#4b5563]">
                <LockIcon />
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                className="min-w-0 border-0 px-[10px] text-[13px] outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="grid place-items-center border-l border-[#9aa8b8] text-[#64748b]"
              >
                <EyeIcon />
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between pt-[2px]">
            <label className="flex items-center gap-[7px] text-[11px] text-[#20242a]">
              <input type="checkbox" className="h-[13px] w-[13px] rounded border-[#cbd5e1]" />
              Remember me
            </label>

            <Link to="/forgot-password" onClick={onClose} className="text-[12px] text-[#111]">
              Forgot password?
            </Link>
          </div>

          <button
            type="button"
            className="h-[31px] w-full rounded-full bg-[#ff5b00] text-[11px] font-extrabold uppercase text-white"
          >
            Sign In
          </button>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[12px] py-[6px]">
            <span className="h-px bg-[#c8c8c8]" />
            <span className="text-[11px] font-extrabold uppercase text-[#9a0000]">Or Continue</span>
            <span className="h-px bg-[#c8c8c8]" />
          </div>

          <button
            type="button"
            className="h-[31px] w-full rounded-full border border-black bg-white text-[11px] font-extrabold uppercase text-black"
          >
            As Guest
          </button>

          <p className="pt-[5px] text-center text-[12px] text-[#222]">
            Don&apos;t have an account?{' '}
            <button type="button" onClick={goToSignup} className="text-[#ff5b00]">
              Sign up
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] fill-none stroke-current">
      <path d="M7 10V8a5 5 0 0 1 10 0v2" strokeWidth="1.7" />
      <path d="M6 10h12v10H6V10Z" strokeWidth="1.7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] fill-none stroke-current">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.5" strokeWidth="1.6" />
    </svg>
  );
}