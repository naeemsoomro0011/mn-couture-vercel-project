import { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaMinus, FaPlus } from 'react-icons/fa';
import { sortSizes } from './ItemCard';
import Portal from '../common/Portal';
import './Shop.css';

const QuickViewModal = ({ item, initialSizeLabel, open, onClose, onProceedToCheckout }) => {
  const sizes = item ? sortSizes(item.sizes) : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [selections, setSelections] = useState({}); // { sizeLabel: qty }

  useEffect(() => {
    if (open && item) {
      const idx = sizes.findIndex((s) => s.label === initialSizeLabel);
      setActiveIndex(idx >= 0 ? idx : 0);
      setSelections({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  if (!open || !item || sizes.length === 0) return null;

  const activeSize = sizes[activeIndex];
  const activeQty = selections[activeSize.label] || 0;

  const changeQty = (delta) => {
    setSelections((prev) => {
      const current = prev[activeSize.label] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) delete updated[activeSize.label];
      else updated[activeSize.label] = next;
      return updated;
    });
  };

  const selectedEntries = Object.entries(selections);
  const total = selectedEntries.reduce((sum, [label, qty]) => {
    const size = sizes.find((s) => s.label === label);
    return sum + (size ? size.price * qty : 0);
  }, 0);

  const handleBuy = () => {
    if (selectedEntries.length === 0) return;
    const cartItems = selectedEntries.map(([label, qty]) => {
      const size = sizes.find((s) => s.label === label);
      return {
        item: item._id,
        name: item.name,
        picture: size.picture,
        size: label,
        price: size.price,
        quantity: qty,
      };
    });
    onProceedToCheckout(cartItems, total);
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up quickview-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="quickview-image-wrap">
          {sizes.length > 1 && (
            <button className="quickview-nav quickview-nav-left" onClick={() => setActiveIndex((i) => (i - 1 + sizes.length) % sizes.length)} aria-label="Pichla size">
              <FaChevronLeft />
            </button>
          )}
          <img src={activeSize.picture} alt={item.name} className="quickview-image" />
          {sizes.length > 1 && (
            <button className="quickview-nav quickview-nav-right" onClick={() => setActiveIndex((i) => (i + 1) % sizes.length)} aria-label="Agla size">
              <FaChevronRight />
            </button>
          )}
        </div>

        <h3 className="modal-title">{item.name}</h3>
        <p className="modal-subtitle">{item.description}</p>

        <div className="item-card-sizes quickview-sizes">
          {sizes.map((s, i) => (
            <button key={s._id} className={`size-chip ${i === activeIndex ? 'size-chip-active' : ''}`} onClick={() => setActiveIndex(i)}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="quickview-qty-row">
          <span>Rs. {activeSize.price?.toLocaleString()} / piece</span>
          <div className="qty-control">
            <button type="button" onClick={() => changeQty(-1)} disabled={activeQty === 0} aria-label="Decrease"><FaMinus /></button>
            <span>{activeQty}</span>
            <button type="button" onClick={() => changeQty(1)} aria-label="Increase"><FaPlus /></button>
          </div>
        </div>

        {selectedEntries.length > 0 && (
          <div className="quickview-selection-list">
            {selectedEntries.map(([label, qty]) => (
              <span key={label} className="selection-chip">{label} × {qty}</span>
            ))}
          </div>
        )}

        <div className="quickview-total">
          <span>Total</span>
          <strong>Rs. {total.toLocaleString()}</strong>
        </div>

        <div className="quickview-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Back</button>
          <button type="button" className="btn btn-primary" onClick={handleBuy} disabled={selectedEntries.length === 0}>
            Buy
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
};

export default QuickViewModal;
