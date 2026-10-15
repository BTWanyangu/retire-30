import { stats } from '../data/siteData';

export default function StatsBand() {
  return (
    <section className="stats-band">
      <div className="wrap stats-grid">
        {stats.map((item) => (
          <div className="stat" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
