import { useEffect, useState, useCallback } from 'react';
import { FaPlus, FaSearch, FaEllipsisV, FaTrash } from 'react-icons/fa';
import { fetchAdminGallery, addAdminGalleryImages, updateAdminGalleryImage, deleteAdminGalleryImage } from '../../api/admin';
import AdminGalleryFormModal from '../../components/AdminShared/AdminGalleryFormModal';
import Loader3D from '../../components/common/Loader3D';
import { alertConfirm, alertSuccess, alertError } from '../../utils/alerts';
import './AdminPages.css';

const AdminGallery = () => {
  const [images, setImages] = useState(null);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const load = useCallback(() => {
    fetchAdminGallery(search || undefined).then(setImages).catch(() => setImages([]));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleAdd = async (pending) => {
    await addAdminGalleryImages(pending);
    alertSuccess('Added!', `${pending.length} picture(s) added to the gallery.`);
    load();
  };

  const handleCaptionChange = (id, caption) => {
    setImages((prev) => prev.map((img) => (img._id === id ? { ...img, caption } : img)));
  };

  const handleCaptionBlur = async (id, caption) => {
    try {
      await updateAdminGalleryImage(id, { caption });
    } catch {
      alertError('Failed', 'Caption could not be saved.');
    }
  };

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    const confirmed = await alertConfirm('Delete This Picture?', 'Yeh hamesha ke liye delete ho jayegi.', 'Delete');
    if (!confirmed) return;
    try {
      await deleteAdminGalleryImage(id);
      alertSuccess('Deleted!', '');
      load();
    } catch {
      alertError('Failed', 'Please try again.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Gallery</h2>
        <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
          <FaPlus /> Create
        </button>
      </div>

      <div className="admin-search-bar">
        <FaSearch />
        <input placeholder="Search by caption..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {images === null && <div className="admin-loading-block"><Loader3D label="Loading..." /></div>}
      {images?.length === 0 && <p className="admin-empty">No pictures yet — start with "+ Create".</p>}

      <div className="admin-gallery-grid">
        {images?.map((img) => (
          <div key={img._id} className="admin-gallery-card card-3d anim-up">
            <div className="admin-item-card-menu-wrap">
              <button type="button" className="icon-btn" onClick={() => setOpenMenuId(openMenuId === img._id ? null : img._id)} aria-label="Options">
                <FaEllipsisV />
              </button>
              {openMenuId === img._id && (
                <div className="admin-gallery-menu anim-down">
                  <button type="button" className="admin-gallery-menu-danger" onClick={() => handleDelete(img._id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </div>
            <img src={img.imageUrl} alt={img.caption || ''} />
            <input
              className="admin-gallery-caption-input"
              placeholder="Caption (optional)"
              value={img.caption}
              onChange={(e) => handleCaptionChange(img._id, e.target.value)}
              onBlur={(e) => handleCaptionBlur(img._id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <AdminGalleryFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleAdd} />
    </div>
  );
};

export default AdminGallery;
