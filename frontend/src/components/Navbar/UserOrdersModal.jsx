import { useState } from 'react';
import { FaTimes, FaEdit, FaMinus, FaPlus, FaSave } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import { updateMyOrder } from '../../api/orders';
import { alertSuccess, alertError } from '../../utils/alerts';
import './UserOrdersModal.css';

const UserOrdersModal = ({ open, orders, loading, onClose, onUpdated }) => {
  const [editingId, setEditingId] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const startEdit = (order) => {
    setEditingId(order._id);
    setEditItems(order.items.map((i) => ({ ...i })));
    setEditAddress(order.address);
    setEditPhone(order.phone);
  };

  const cancelEdit = () => setEditingId(null);

  const changeQty = (index, delta) => {
    setEditItems((prev) =>
      prev
        .map((it, i) => (i === index ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const editTotal = editItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const saveEdit = async (orderId) => {
    if (editItems.length === 0) {
      alertError('Cannot Save', 'An order must have at least one item.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await updateMyOrder(orderId, { items: editItems, address: editAddress, phone: editPhone });
      onUpdated(data.order);
      setEditingId(null);
      alertSuccess('Updated!', 'Your order has been updated.');
    } catch (err) {
      alertError('Could Not Save', err?.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div className="modal-overlay anim-scale" onClick={onClose}>
        <div className="modal-card card-3d anim-up user-orders-modal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
          <h3 className="modal-title">My Orders</h3>

          {loading && <Loader3D label="Loading orders..." />}
          {!loading && orders?.length === 0 && <p className="modal-subtitle">You have no orders yet.</p>}

          <div className="user-orders-list">
            {orders?.map((order) => (
              <div key={order._id} className="user-order-card">
                <div className="user-order-card-top">
                  <span className={`order-status-badge order-status-${order.status}`}>
                    {order.status === 'approved' ? 'Approved' : 'Pending'}
                  </span>
                  {!order.seenByAdmin && editingId !== order._id && (
                    <button type="button" className="user-order-edit-btn" onClick={() => startEdit(order)}>
                      <FaEdit /> Edit
                    </button>
                  )}
                </div>

                {editingId === order._id ? (
                  <div className="user-order-edit-form">
                    {editItems.map((item, i) => (
                      <div key={i} className="user-order-edit-row">
                        <span>{item.name} ({item.size})</span>
                        <div className="qty-control">
                          <button type="button" onClick={() => changeQty(i, -1)}><FaMinus /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => changeQty(i, 1)}><FaPlus /></button>
                        </div>
                      </div>
                    ))}
                    <div className="field">
                      <label>Delivery Address</label>
                      <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Phone Number</label>
                      <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                    </div>
                    <p className="user-order-edit-total">Total: Rs. {editTotal.toLocaleString()}</p>
                    <div className="quickview-actions">
                      <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                      {saving ? <Loader3D size={28} /> : (
                        <button type="button" className="btn btn-primary" onClick={() => saveEdit(order._id)}>
                          <FaSave /> Save
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="user-order-items">{order.items.map((i) => `${i.name} (${i.size} × ${i.quantity})`).join(', ')}</p>
                    <p className="user-order-address">{order.address} · {order.phone}</p>
                    <p className="user-order-total">Rs. {order.totalPrice.toLocaleString()}</p>
                    {order.seenByAdmin && (
                      <p className="user-order-locked">The shop has seen this order — it can no longer be edited.</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default UserOrdersModal;
