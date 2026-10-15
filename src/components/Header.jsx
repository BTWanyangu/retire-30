import { NavLink } from 'react-router-dom';
import { navLinks } from '../data/siteData';
import { useState } from 'react';
import AuthModal from './AuthModal.jsx';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="ena-header">
        <div className="ena-header__top-line" />

        <div className="ena-header__bar">
          <div className="ena-header__inner">
            <NavLink
              to="/"
              className="ena-header__logo"
              aria-label="ENA Coach Home"
              onClick={() => setOpen(false)}
            >
              <img src="/assets/enacoach_logo.png" alt="ENA Coach" />
            </NavLink>

            <button
              className="ena-header__toggle"
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>

            <nav
              className={`ena-header__nav ${open ? 'ena-header__nav--open' : ''}`}
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `ena-header__link ${isActive ? 'is-active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="ena-header__actions">
              <button
                className="ena-header__flag"
                type="button"
                aria-label="Language selector"
              >
                🇬🇧
              </button>

              <NavLink
                className={({ isActive }) =>
                  `ena-header__support ${isActive ? 'is-active' : ''}`
                }
                to="/support"
                aria-label="Support"
                onClick={() => setOpen(false)}
              >
                <span>?</span>
                Support
              </NavLink>

              <button
                type="button"
                className="ena-header__account"
                onClick={() => {
                  setOpen(false);
                  setAuthOpen(true);
                }}
              >
                My Account
              </button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}