import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTshirt, FaEye, FaShoppingCart } from 'react-icons/fa';
import { fetchTopPriced } from '../../api/items';
import { sortSizes } from '../Shop/ItemCard';
import { useBuyFlow } from '../../utils/useBuyFlow';
import BlobBackground from '../common/BlobBackground';
import Loader3D from '../common/Loader3D';
import '../Shop/Shop.css';
import './TopPicksCarousel.css';

const GENDER_LABEL = { men: "Men's", women: "Women's", kids: 'Kids', newborn: 'New Born' };

const TopPicksCarousel = () => {
  const [items, setItems] = useState(null); // null = still loading
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { openQuickView, modals } = useBuyFlow();

  useEffect(() => {
    // The backend returns the 10 most premium items, ranked by price — so this
    // section always reflects the live shop, never a hard-coded list.
    fetchTopPriced()
      .then((data) => setItems((data || []).slice(0, 10)))
      .catch(() => setItems([]));
  }, []);

  const go = (dir) => {
    if (!items?.length) return;
    setDirection(dir);
    setIndex((i) => (i + dir + items.length) % items.length);
  };

  const activeItem = items?.[index];
  const activeSize = activeItem ? sortSizes(activeItem.sizes)[0] : null;

  return (
    <section id="top-picks" className="top-picks">
      <BlobBackground variant="default" />
      <div className="container top-picks-inner">
        <p className="home-eyebrow">Most Exclusive</p>
        <h2>Our Top Premium Picks</h2>
        {items?.length > 0 && (
          <p className="top-picks-subtitle">
            Showing the shop's top <strong>{items.length}</strong> most premium {items.length === 1 ? 'piece' : 'pieces'}
          </p>
        )}

        {items === null && (
          <div className="top-picks-loading">
            <Loader3D label="Loading collection..." />
          </div>
        )}

        {items?.length === 0 && (
          <div className="top-picks-empty card-3d anim-scale">
            <FaTshirt />
            <p>Our premium collection will appear here soon.</p>
          </div>
        )}

        {items?.length > 0 && (
          <div className="top-picks-carousel">
            <button className="carousel-nav" onClick={() => go(-1)} aria-label="Previous item">
              <FaChevronLeft />
            </button>

            <div className="carousel-track">
              {items.length > 1 && (
                <img
                  src={items[(index - 1 + items.length) % items.length].coverPicture}
                  className="carousel-peek carousel-peek-left"
                  onClick={() => go(-1)}
                  alt=""
                />
              )}

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={items[index]._id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 90, rotateY: direction * 22, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction * -90, rotateY: direction * -22, scale: 0.94 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="top-pick-card card-3d"
                >
                  <div className="top-pick-media">
                    <span className="top-pick-rank">#{index + 1} Top Pick</span>
                    <img src={items[index].coverPicture} alt={items[index].name} className="top-pick-img" />
                    <button
                      className="item-card-eye"
                      onClick={() => openQuickView(items[index], sortSizes(items[index].sizes)[0]?.label)}
                      aria-label="Quick view"
                    >
                      <FaEye />
                    </button>
                  </div>
                  <div className="top-pick-details">
                    <span className="top-pick-gender">{GENDER_LABEL[items[index].gender]}</span>
                    <h3>{items[index].name}</h3>
                    <p className="top-pick-desc">{items[index].description}</p>
                    <div className="top-pick-footer">
                      <p className="top-pick-price">Rs. {items[index].maxPrice?.toLocaleString()}</p>
                      <button
                        className="btn btn-primary item-card-buy"
                        onClick={() => openQuickView(items[index], sortSizes(items[index].sizes)[0]?.label)}
                      >
                        <FaShoppingCart /> Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {items.length > 1 && (
                <img
                  src={items[(index + 1) % items.length].coverPicture}
                  className="carousel-peek carousel-peek-right"
                  onClick={() => go(1)}
                  alt=""
                />
              )}
            </div>

            <button className="carousel-nav" onClick={() => go(1)} aria-label="Next item">
              <FaChevronRight />
            </button>
          </div>
        )}

        {items?.length > 1 && (
          <div className="top-picks-pager">
            <div className="top-picks-dots">
              {items.map((it, i) => (
                <button
                  key={it._id}
                  type="button"
                  className={`top-picks-dot ${i === index ? 'top-picks-dot-active' : ''}`}
                  onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                  aria-label={`Show item ${i + 1}`}
                />
              ))}
            </div>
            <p className="top-picks-count">{index + 1} / {items.length}</p>
          </div>
        )}
      </div>

      {modals}
    </section>
  );
};

export default TopPicksCarousel;
