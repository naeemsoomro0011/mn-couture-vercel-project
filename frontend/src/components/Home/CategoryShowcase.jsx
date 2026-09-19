import { FaUserTie, FaPersonDress, FaChild, FaBaby } from 'react-icons/fa6';
import './CategoryShowcase.css';

const CATEGORIES = [
  { key: 'men', label: "Men's Collection", icon: FaUserTie },
  { key: 'women', label: "Women's Collection", icon: FaPersonDress },
  { key: 'kids', label: 'Kids Collection', icon: FaChild },
  { key: 'newborn', label: 'New Born', icon: FaBaby },
];

// Clicking a tile filters the Shop section below to that gender and scrolls to it.
const CategoryShowcase = ({ onSelectCategory }) => (
  <section id="categories" className="category-showcase">
    <div className="container">
      <p className="home-eyebrow">Choose Your Style</p>
      <h2>Shop by Category</h2>

      <div className="category-grid">
        {CATEGORIES.map(({ key, label, icon: Icon }, i) => (
          <button
            key={key}
            className="category-tile card-3d anim-up"
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => onSelectCategory?.(key)}
          >
            <span className="category-tile-icon">
              <Icon />
            </span>
            <h3>{label}</h3>
          </button>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryShowcase;
