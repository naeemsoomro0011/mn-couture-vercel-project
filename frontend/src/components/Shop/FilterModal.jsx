import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Portal from '../common/Portal';
import './Shop.css';

const GENDERS = ['men', 'women', 'kids', 'newborn'];
const SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];

const FilterModal = ({ open, initialFilters, onClose, onApply }) => {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    if (open) setFilters(initialFilters);
  }, [open, initialFilters]);

  if (!open) return null;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const cleared = { minPrice: '', maxPrice: '', size: '', gender: '' };
    setFilters(cleared);
    onApply(cleared);
    onClose();
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <h3 className="modal-title">Filter Items</h3>
        <p className="modal-subtitle">Everything is optional — fill in only what you need.</p>

        <div className="filter-price-row">
          <div className="field">
            <label htmlFor="f-min">Min Price</label>
            <input id="f-min" type="number" min="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="f-max">Max Price</label>
            <input id="f-max" type="number" min="0" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
          </div>
        </div>

        <div className="field">
          <label>Gender</label>
          <div className="filter-chip-row">
            {GENDERS.map((g) => (
              <button
                key={g} type="button"
                className={`size-chip ${filters.gender === g ? 'size-chip-active' : ''}`}
                onClick={() => setFilters({ ...filters, gender: filters.gender === g ? '' : g })}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Size</label>
          <div className="filter-chip-row">
            {SIZES.map((s) => (
              <button
                key={s} type="button"
                className={`size-chip ${filters.size === s ? 'size-chip-active' : ''}`}
                onClick={() => setFilters({ ...filters, size: filters.size === s ? '' : s })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="quickview-actions">
          <button type="button" className="btn btn-outline" onClick={handleClear}>Clear</button>
          <button type="button" className="btn btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
    </Portal>
  );
};

export default FilterModal;
