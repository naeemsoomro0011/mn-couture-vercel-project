import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaUpload, FaLink, FaImage } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import { uploadImage } from '../../utils/uploadImage';
import '../../pages/AdminDashboard/AdminPages.css';
import './AdminShared.css';

const QUICK_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];
const emptySize = () => ({ label: '', price: '', picture: '' });

const AdminItemFormModal = ({ open, initialItem, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', description: '', gender: 'men' });
  const [sizes, setSizes] = useState([emptySize()]);
  const [sizeUrlModeIndex, setSizeUrlModeIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialItem) {
      setForm({
        name: initialItem.name,
        description: initialItem.description,
        gender: initialItem.gender,
      });
      setSizes(initialItem.sizes.map((s) => ({ label: s.label, price: s.price, picture: s.picture })));
    } else {
      setForm({ name: '', description: '', gender: 'men' });
      setSizes([emptySize()]);
    }
    setError('');
    setSizeUrlModeIndex(null);
  }, [open, initialItem]);

  if (!open) return null;

  const handleSizeUpload = async (index, file) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, picture: url } : s)));
    } finally {
      setUploading(false);
    }
  };

  const updateSize = (index, field, value) =>
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));

  const addSize = () => setSizes((prev) => [...prev, emptySize()]);
  const removeSize = (index) => setSizes((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validSizes = sizes.filter((s) => s.label && s.price && s.picture);
    if (validSizes.length === 0) return setError('At least one complete size (label, price, and picture) is required.');

    setSaving(true);
    try {
      // No separate cover upload any more — the first size's picture is what
      // the product card shows.
      await onSubmit({
        ...form,
        coverPicture: validSizes[0].picture,
        sizes: validSizes.map((s) => ({ ...s, price: Number(s.price) })),
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <h3 className="modal-title">{initialItem ? 'Edit Item' : 'Add New Item'}</h3>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="field">
            <label>Description ({form.description.length}/150)</label>
            <textarea
              required maxLength={150} rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Gender / Section</label>
            <div className="filter-chip-row">
              {['men', 'women', 'kids', 'newborn'].map((g) => (
                <button key={g} type="button" className={`size-chip ${form.gender === g ? 'size-chip-active' : ''}`} onClick={() => setForm({ ...form, gender: g })}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-sizes-block">
            <div className="admin-sizes-header">
              <div>
                <label>Sizes & Pricing</label>
                <p className="admin-sizes-note">Each size has its own price and picture.</p>
              </div>
              <button type="button" className="admin-chip-btn" onClick={addSize}>
                <FaPlus /> Add Size
              </button>
            </div>

            {sizes.map((s, i) => (
              <div key={i} className="admin-size-card">
                <div className="admin-size-card-head">
                  <span className="admin-size-index">Size {i + 1}</span>
                  {i === 0 && <span className="admin-size-cover-tag">Product card picture</span>}
                  {sizes.length > 1 && (
                    <button type="button" className="admin-size-remove" onClick={() => removeSize(i)} aria-label="Remove size">
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="admin-size-main">
                  <div className="admin-size-media">
                    {s.picture ? (
                      <img src={s.picture} alt="" className="admin-size-thumb" />
                    ) : (
                      <div className="admin-size-thumb admin-size-thumb-empty"><FaImage /></div>
                    )}
                    <div className="admin-size-media-actions">
                      <label className="admin-chip-btn admin-size-action" title="Upload picture">
                        <FaUpload /> Upload
                        <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleSizeUpload(i, e.target.files[0])} />
                      </label>
                      <button
                        type="button" title="Paste an image URL"
                        className={`admin-chip-btn admin-size-action ${sizeUrlModeIndex === i ? 'admin-size-action-active' : ''}`}
                        onClick={() => setSizeUrlModeIndex(sizeUrlModeIndex === i ? null : i)}
                      >
                        <FaLink /> URL
                      </button>
                    </div>
                  </div>

                  <div className="admin-size-fields">
                    <div className="admin-size-chips">
                      {QUICK_SIZES.map((q) => (
                        <button key={q} type="button" className={`size-chip ${s.label === q ? 'size-chip-active' : ''}`} onClick={() => updateSize(i, 'label', q)}>
                          {q}
                        </button>
                      ))}
                    </div>

                    <div className="admin-size-inputs">
                      <div className="admin-size-field">
                        <label>Size label</label>
                        <input
                          placeholder="Medium (or '0-1 Month')"
                          value={s.label}
                          onChange={(e) => updateSize(i, 'label', e.target.value)}
                          className="admin-size-label-input"
                        />
                      </div>

                      <div className="admin-size-field">
                        <label>Price</label>
                        <div className="admin-price-input">
                          <span className="admin-price-prefix">Rs.</span>
                          <input
                            type="number" min="0" inputMode="numeric" placeholder="0"
                            value={s.price}
                            onChange={(e) => updateSize(i, 'price', e.target.value)}
                            className="admin-size-price-input"
                          />
                        </div>
                      </div>
                    </div>

                    {sizeUrlModeIndex === i && (
                      <input
                        type="text" className="admin-url-input admin-size-url-input" placeholder="Paste image URL for this size"
                        value={s.picture} onChange={(e) => updateSize(i, 'picture', e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {uploading && <Loader3D size={26} label="Uploading..." />}
          {error && <p className="field-error">{error}</p>}

          {saving ? (
            <Loader3D size={32} />
          ) : (
            <button type="submit" className="btn btn-primary modal-submit-btn">Save</button>
          )}
        </form>
      </div>
    </div>
    </Portal>
  );
};

export default AdminItemFormModal;
