import { useEffect, useState, useCallback } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { fetchItems } from '../../api/items';
import { useBuyFlow } from '../../utils/useBuyFlow';
import ItemCard from './ItemCard';
import FilterModal from './FilterModal';
import Loader3D from '../common/Loader3D';
import './Shop.css';

const GENDER_SECTIONS = [
  { key: 'men', label: "Men's" },
  { key: 'women', label: "Women's" },
  { key: 'kids', label: 'Kids' },
  { key: 'newborn', label: 'New Born' },
];

const EMPTY_FILTERS = { minPrice: '', maxPrice: '', size: '', gender: '' };

const ShopSection = ({ activeGender = '' }) => {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const { openQuickView, modals } = useBuyFlow();

  useEffect(() => {
    if (activeGender) setFilters((f) => ({ ...f, gender: activeGender }));
  }, [activeGender]);

  const loadItems = useCallback(() => {
    const params = { search: search || undefined, ...filters };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    fetchItems(params).then(setItems).catch(() => setItems([]));
  }, [search, filters]);

  useEffect(() => {
    const t = setTimeout(loadItems, 300); // debounce search-as-you-type
    return () => clearTimeout(t);
  }, [loadItems]);

  const visibleSections = filters.gender
    ? GENDER_SECTIONS.filter((g) => g.key === filters.gender)
    : GENDER_SECTIONS;

  return (
    <section id="shop" className="shop-section">
      <div className="container">
        <p className="home-eyebrow">Full Collection</p>
        <h2>Shop</h2>

        <div className="shop-toolbar">
          <div className="shop-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="icon-btn shop-filter-btn" onClick={() => setFilterOpen(true)} aria-label="Filter">
            <FaFilter />
          </button>
        </div>

        {items === null && (
          <div className="top-picks-loading"><Loader3D label="Loading items..." /></div>
        )}

        {items?.length === 0 && (
          <div className="top-picks-empty card-3d anim-scale">
            <p>No items found.</p>
          </div>
        )}

        {items?.length > 0 &&
          visibleSections.map(({ key, label }) => {
            const sectionItems = items.filter((i) => i.gender === key);
            if (sectionItems.length === 0) return null;
            return (
              <div key={key} className="shop-gender-section">
                <h3 className="shop-gender-heading">{label}</h3>
                <div className="item-grid">
                  {sectionItems.map((item) => (
                    <ItemCard key={item._id} item={item} onOpenQuickView={openQuickView} />
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      <FilterModal
        open={filterOpen}
        initialFilters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />

      {modals}
    </section>
  );
};

export default ShopSection;
