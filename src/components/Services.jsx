import { services } from '../data/siteData';

const iconMap = {
  ticket: '🎫',
  parcel: '📦',
  comfort: '🚌',
};

export default function Services() {
  return (
    <section className="section services-section">
      <div className="wrap services-layout">
        <div className="services-copy">
          <span className="eyebrow">Why travel with us</span>
          <h2>Everything prepared for booking, parcels, and customer support.</h2>
          <p>This frontend is component-based, so real schedules, payment states, ticket printing, and parcel tracking can be connected without redesigning the UI.</p>
          <div className="payment-strip">
            <img src="/assets/mpesa.svg" alt="M-Pesa placeholder" />
            <div>
              <strong>Payment-ready area</strong>
              <span>Swap this block with your actual checkout or M-Pesa/STK integration.</span>
            </div>
          </div>
        </div>
        <div className="service-cards">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-card__icon">{iconMap[service.icon]}</div>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
