import { useState } from 'react';
import { FaTimes, FaUpload, FaLink, FaTrash } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import { uploadImage } from '../../utils/uploadImage';
import './AdminShared.css';

const AdminGalleryFormModal = ({ open, onClose, onSubmit }) => {
  const [pending, setPending] = useState([]); // { imageUrl, caption }
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const uploads = await Promise.all(Array.from(files).map((f) => uploadImage(f)));
      setPending((prev) => [...prev, ...uploads.map((url) => ({ imageUrl: url, caption: '' }))]);
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    setPending((prev) => [...prev, { imageUrl: urlInput.trim(), caption: '' }]);
    setUrlInput('');
  };

  const removeAt = (i) => setPending((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (pending.length === 0) return setError('At least one image is required.');
    setSaving(true);
    try {
      await onSubmit(pending);
      setPending([]);
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
        <h3 className="modal-title">Add Pictures to Gallery</h3>
        <p className="modal-subtitle">You can add multiple pictures at once.</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <label className="auth-avatar-action-btn admin-gallery-add-row">
            <FaUpload /> Device Se Choose Karein (multiple)
            <input
              type="file" accept="image/*" multiple hidden
              onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
            />
          </label>

          <div className="admin-gallery-url-row">
            <input placeholder="Or paste an image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            <button type="button" className="auth-avatar-action-btn" onClick={addUrl}>
              <FaLink /> Add
            </button>
          </div>

          {uploading && <Loader3D size={26} label="Uploading..." />}

          {pending.length > 0 && (
            <div className="admin-gallery-preview-grid">
              {pending.map((p, i) => (
                <div key={i} className="admin-gallery-preview-tile">
                  <img src={p.imageUrl} alt="" />
                  <button type="button" onClick={() => removeAt(i)} aria-label="Hatayein">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="field-error">{error}</p>}

          {saving ? (
            <Loader3D size={32} />
          ) : (
            <button type="submit" className="btn btn-primary modal-submit-btn">
              {pending.length > 0 ? `${pending.length} Pictures Add Karein` : 'Save'}
            </button>
          )}
        </form>
      </div>
    </div>
    </Portal>
  );
};

export default AdminGalleryFormModal;
