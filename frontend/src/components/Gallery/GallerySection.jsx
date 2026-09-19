import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaImages } from 'react-icons/fa';
import { fetchGallery } from '../../api/gallery';
import BlobBackground from '../common/BlobBackground';
import Loader3D from '../common/Loader3D';
import '../Home/TopPicksCarousel.css';
import './Gallery.css';

// A 3D flying carousel (not blob-shaped — kept as clean rounded rectangles
// per feedback) so it visually pairs with the Top Picks carousel elsewhere
// on the page.
const GallerySection = () => {
  const [images, setImages] = useState(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetchGallery().then(setImages).catch(() => setImages([]));
  }, []);

  const go = (dir) => {
    if (!images?.length) return;
    setDirection(dir);
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  return (
    <section id="gallery" className="gallery-section">
      <BlobBackground variant="gallery" />
      <div className="container gallery-inner">
        <p className="home-eyebrow">Our World</p>
        <h2>Shop Gallery</h2>

        {images === null && (
          <div className="top-picks-loading"><Loader3D label="Loading gallery..." /></div>
        )}

        {images?.length === 0 && (
          <div className="top-picks-empty card-3d anim-scale">
            <FaImages style={{ fontSize: '2rem', color: 'var(--gold)' }} />
            <p>Photos from our shop will appear here soon.</p>
          </div>
        )}

        {images?.length > 0 && (
          <div className="gallery-carousel">
            <button className="carousel-nav" onClick={() => go(-1)} aria-label="Previous photo">
              <FaChevronLeft />
            </button>

            <div className="carousel-track">
              {images.length > 1 && (
                <img
                  src={images[(index - 1 + images.length) % images.length].imageUrl}
                  className="carousel-peek carousel-peek-left"
                  onClick={() => go(-1)}
                  alt=""
                />
              )}

              {/* Wrapper owns the idle float so it never fights Framer Motion's
                  own transform on the card during slide transitions. */}
              <div className="gallery-stage">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={images[index]._id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 80, rotateY: direction * 14 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: direction * -80, rotateY: direction * -14 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="gallery-main-card card-3d"
                  >
                    <img src={images[index].imageUrl} alt={images[index].caption || 'MN Couture'} />
                    {images[index].caption && <span className="gallery-main-caption">{images[index].caption}</span>}
                  </motion.div>
                </AnimatePresence>
              </div>

              {images.length > 1 && (
                <img
                  src={images[(index + 1) % images.length].imageUrl}
                  className="carousel-peek carousel-peek-right"
                  onClick={() => go(1)}
                  alt=""
                />
              )}
            </div>

            <button className="carousel-nav" onClick={() => go(1)} aria-label="Next photo">
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
