import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Auth() {
  const location = useLocation();
  const isSignup = location.pathname === '/sign-up';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main className="w-full bg-white px-4 pb-[170px] pt-[88px] max-md:px-[10px] max-md:pb-[110px] max-md:pt-[28px]">
      {isSignup ? (
        <SignUpForm
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
        />
      ) : (
        <LoginForm showPassword={showPassword} setShowPassword={setShowPassword} />
      )}
    </main>
  );
}

function LoginForm({ showPassword, setShowPassword }) {
  return (
    <section className="mx-auto w-full max-w-[450px] overflow-hidden rounded-[4px] border border-[#d7dce1] bg-white">
      <div className="border-b border-[#d7dce1] px-4 pb-[10px] pt-[9px] text-center">
        <img
          src="/assets/logo-placeholder.svg"
          alt="ENA Coach"
          className="mx-auto h-[88px] w-[160px] object-contain"
        />
        <h1 className="mt-[-2px] text-[22px] font-semibold leading-none text-[#20242a]">
          Log in
        </h1>
      </div>

      <form className="px-[13px] pb-[16px] pt-[20px]">
        <label className="mb-[8px] block">
          <span className="mb-[7px] block text-[12px] text-[#20242a]">Phone Number</span>
          <div className="grid h-[34px] grid-cols-[82px_1fr] overflow-hidden rounded-[4px] border border-[#d7dce1]">
            <select className="border-r border-[#d7dce1] bg-white px-[10px] text-[13px] outline-none">
              <option>254</option>
              <option>255</option>
              <option>256</option>
            </select>
            <input
              placeholder="e.g. 700 123456"
              className="min-w-0 px-[10px] text-[13px] outline-none placeholder:text-[#66758a]"
            />
          </div>
        </label>

        <PasswordField
          label="Password"
          show={showPassword}
          setShow={setShowPassword}
          placeholder=""
        />

        <div className="mt-[12px] flex items-center justify-between">
          <label className="flex items-center gap-[7px] text-[12px] text-[#20242a]">
            <input type="checkbox" className="h-[15px] w-[15px] rounded border-[#cbd5e1]" />
            Remember me
          </label>

          <Link to="/forgot-password" className="text-[12px] text-[#111]">
            Forgot password?
          </Link>
        </div>

        <button
          type="button"
          className="mt-[17px] h-[34px] w-full rounded-full bg-[#ff5b00] text-[12px] font-medium text-white"
        >
          Sign In
        </button>

        <p className="mt-[14px] text-center text-[12px] text-[#222]">
          Don&apos;t have an account?{' '}
          <Link to="/sign-up" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </section>
  );
}

function SignUpForm({ showPassword, setShowPassword, showConfirm, setShowConfirm }) {
  return (
    <section className="mx-auto w-full max-w-[457px]">
      <div className="mb-[24px] text-center">
        <img
          src="/assets/logo-placeholder.svg"
          alt="ENA Coach"
          className="mx-auto h-[88px] w-[160px] object-contain"
        />
        <h1 className="mt-[-4px] text-[25px] font-normal leading-none text-[#20242a]">
          Sign up
        </h1>
      </div>

      <form>
        <Field label="Name" placeholder="Enter your name" />

        <div className="mt-[8px] grid grid-cols-[100px_1fr] gap-[19px]">
          <label className="block">
            <span className="mb-[7px] block text-[12px] text-[#20242a]">Code</span>
            <select className="h-[33px] w-full rounded-[4px] border border-[#cbd7e5] bg-white px-[10px] text-[13px] text-[#66758a] outline-none">
              <option>Select ...</option>
              <option>254</option>
              <option>255</option>
              <option>256</option>
            </select>
          </label>

          <Field label="Phone" placeholder="Enter your phone number" noMargin />
        </div>

        <Field label="Email" placeholder="Enter your email" className="mt-[8px]" />

        <div className="mt-[8px] grid grid-cols-2 gap-[19px]">
          <label className="block">
            <span className="mb-[7px] block text-[12px] text-[#20242a]">Gender</span>
            <select className="h-[33px] w-full rounded-[4px] border border-[#cbd7e5] bg-white px-[10px] text-[13px] text-[#66758a] outline-none">
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </label>

          <Field label="Date of Birth" placeholder="05/10/2013" noMargin />
        </div>

        <div className="mt-[8px] grid grid-cols-2 gap-[19px]">
          <PasswordField
            label="Password"
            placeholder="Enter password"
            show={showPassword}
            setShow={setShowPassword}
          />

          <PasswordField
            label="Confirm Password"
            placeholder="Confirm password"
            show={showConfirm}
            setShow={setShowConfirm}
          />
        </div>

        <label className="mt-[14px] flex items-center gap-[7px] text-[12px] text-[#20242a]">
          <input type="checkbox" className="h-[15px] w-[15px] rounded border-[#cbd5e1]" />
          I agree to the terms and conditions
        </label>

        <button
          type="button"
          className="mt-[22px] h-[44px] w-full rounded-full bg-[#ff6b27] text-[12px] font-extrabold text-white"
        >
          Sign Up
        </button>

        <p className="mt-[16px] text-center text-[12px] text-[#20242a]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold underline">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}

function Field({ label, placeholder, noMargin = false, className = '' }) {
  return (
    <label className={`block ${noMargin ? '' : 'mt-[8px]'} ${className}`}>
      <span className="mb-[7px] block text-[12px] text-[#20242a]">{label}</span>
      <input
        placeholder={placeholder}
        className="h-[33px] w-full rounded-[4px] border border-[#d7dce1] bg-white px-[10px] text-[13px] text-[#20242a] outline-none placeholder:text-[#66758a]"
      />
    </label>
  );
}

function PasswordField({ label, placeholder, show, setShow }) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[12px] text-[#20242a]">{label}</span>
      <div className="grid h-[33px] grid-cols-[1fr_34px] overflow-hidden rounded-[4px] border border-[#9aa8b8] bg-white">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className="min-w-0 px-[10px] text-[13px] outline-none placeholder:text-[#66758a]"
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="grid place-items-center border-l border-[#9aa8b8] text-[#64748b]"
        >
          <EyeIcon />
        </button>
      </div>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] fill-none stroke-current">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.5" strokeWidth="1.6" />
    </svg>
  );
}