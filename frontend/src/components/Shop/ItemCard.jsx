import { useState } from 'react';
import { FaEye, FaShoppingCart } from 'react-icons/fa';
import './Shop.css';

const SIZE_ORDER = ['Small', 'Medium', 'Large', 'Extra Large'];
const SIZE_SHORT = { Small: 'S', Medium: 'M', Large: 'L', 'Extra Large': 'XL' };

const sortSizes = (sizes) =>
  [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.label);
    const bi = SIZE_ORDER.indexOf(b.label);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

const ItemCard = ({ item, onOpenQuickView }) => {
  const sortedSizes = sortSizes(item.sizes);
  const defaultSize = sortedSizes.find((s) => s.label === 'Medium') || sortedSizes[0];
  const [activeSize, setActiveSize] = useState(defaultSize);

  return (
    <div id={`item-${item._id}`} className="item-card card-3d anim-up">
      <div className="item-card-media">
        <img src={activeSize.picture || item.coverPicture} alt={item.name} />
        <button className="item-card-eye" onClick={() => onOpenQuickView(item, activeSize.label)} aria-label="Quick view">
          <FaEye />
        </button>
      </div>

      <div className="item-card-body">
        <span className="item-card-gender">{item.gender}</span>
        <h3 className="item-card-name">{item.name}</h3>
        <p className="item-card-desc">{item.description}</p>

        <div className="item-card-sizes">
          {sortedSizes.map((s) => (
            <button
              key={s._id}
              className={`size-chip ${activeSize.label === s.label ? 'size-chip-active' : ''}`}
              onClick={() => setActiveSize(s)}
            >
              {SIZE_SHORT[s.label] || s.label}
            </button>
          ))}
        </div>

        <div className="item-card-footer">
          <span className="item-card-price">Rs. {activeSize.price?.toLocaleString()}</span>
          <button className="btn btn-primary item-card-buy" onClick={() => onOpenQuickView(item, activeSize.label)}>
            <FaShoppingCart /> Buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
export { sortSizes };
