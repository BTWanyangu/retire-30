import { Link } from 'react-router-dom';
import { gallery } from '../data/siteData';

export default function GalleryPreview() {
  return (
    <section className="section gallery-preview">
      <div className="wrap">
        <div className="section-head section-head--row">
          <div>
            <span className="eyebrow">Gallery</span>
            <h2>Fleet and booking-office visuals</h2>
          </div>
          <Link className="text-link" to="/gallery">View gallery</Link>
        </div>
        <div className="gallery-grid gallery-grid--preview">
          {gallery.slice(0, 4).map((image) => (
            <img key={image.src} src={image.src} alt={image.alt} />
          ))}
        </div>
      </div>
    </section>
  );
}
