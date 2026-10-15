import { popularRoutes } from '../data/siteData';

export default function TopRoutes() {
  return (
    <section className="section route-section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Our Top Routes</span>
          <h2>Popular ENA Coach connections</h2>
          <p>Reusable route cards are ready for live backend fare, schedule, and seat availability data.</p>
        </div>
        <div className="route-grid">
          {popularRoutes.map((route) => (
            <article className="route-card" key={`${route.from}-${route.to}`}>
              <div className="route-card__arrow">↗</div>
              <h3>{route.from} <span>to</span> {route.to}</h3>
              <p>{route.subtitle}</p>
              <div className="route-card__meta">
                <span>{route.duration}</span>
                <button type="button">View</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
