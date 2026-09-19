import { useEffect, useState, useCallback } from 'react';
import { FaPlus, FaSearch, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { fetchAdminItems, createAdminItem, updateAdminItem, deleteAdminItem } from '../../api/admin';
import { sortSizes } from '../../components/Shop/ItemCard';
import AdminItemFormModal from '../../components/AdminShared/AdminItemFormModal';
import Loader3D from '../../components/common/Loader3D';
import { alertConfirm, alertSuccess, alertError } from '../../utils/alerts';
import './AdminPages.css';

const AdminItems = () => {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const load = useCallback(() => {
    fetchAdminItems(search || undefined).then(setItems).catch(() => setItems([]));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleCreate = () => { setEditingItem(null); setFormOpen(true); };
  const handleEdit = (item) => { setEditingItem(item); setFormOpen(true); setOpenMenuId(null); };

  const handleSubmit = async (payload) => {
    if (editingItem) {
      await updateAdminItem(editingItem._id, payload);
      alertSuccess('Updated!', 'The item has been updated successfully.');
    } else {
      await createAdminItem(payload);
      alertSuccess('Item Added!', 'The new item is now live in the shop.');
    }
    load();
  };

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    const confirmed = await alertConfirm('Delete This Item?', 'Yeh hamesha ke liye delete ho jayega.', 'Delete');
    if (!confirmed) return;
    try {
      await deleteAdminItem(id);
      alertSuccess('Deleted!', '');
      load();
    } catch {
      alertError('Failed', 'Please try again.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Items</h2>
        <button type="button" className="btn btn-primary" onClick={handleCreate}>
          <FaPlus /> Create
        </button>
      </div>

      <div className="admin-search-bar">
        <FaSearch />
        <input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {items === null && <div className="admin-loading-block"><Loader3D label="Loading..." /></div>}
      {items?.length === 0 && <p className="admin-empty">No items yet — start with "+ Create".</p>}

      <div className="admin-item-grid">
        {items?.map((item) => (
          <div key={item._id} className="admin-item-card card-3d anim-up">
            <div className="admin-item-card-menu-wrap">
              <button type="button" className="icon-btn" onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)} aria-label="Options">
                <FaEllipsisV />
              </button>
              {openMenuId === item._id && (
                <div className="admin-item-menu anim-down">
                  <button type="button" onClick={() => handleEdit(item)}><FaEdit /> Edit</button>
                  <button type="button" className="admin-item-menu-danger" onClick={() => handleDelete(item._id)}><FaTrash /> Delete</button>
                </div>
              )}
            </div>
            <img src={item.coverPicture} alt={item.name} className="admin-item-img" />
            <div className="admin-item-body">
              <span className="item-card-gender">{item.gender}</span>
              <h3>{item.name}</h3>
              <div className="item-card-sizes">
                {sortSizes(item.sizes).map((s) => (
                  <span key={s._id} className="size-chip">{s.label}: Rs. {s.price}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminItemFormModal
        open={formOpen}
        initialItem={editingItem}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminItems;
