import { Link } from 'react-router-dom';

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <img src="/assets/promo-banner.svg" alt="Welcome aboard ENA Coach route banner placeholder" />
      <div className="hero-banner__cta wrap">
        <p>Book from home or from whichever location you are in.</p>
        <Link to="/" className="book-ticket-btn">BOOK TICKET</Link>
      </div>
    </section>
  );
}
