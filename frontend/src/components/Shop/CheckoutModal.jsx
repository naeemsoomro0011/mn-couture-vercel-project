import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Loader3D from '../common/Loader3D';
import Portal from '../common/Portal';
import { createOrder } from '../../api/orders';
import './Shop.css';

const CheckoutModal = ({ open, cartItems, total, onClose, onBack, onSuccess }) => {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createOrder({ items: cartItems, address, phone });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
    <div className="modal-overlay anim-scale" onClick={onClose}>
      <div className="modal-card card-3d anim-up" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <h3 className="modal-title">Confirm Your Order</h3>

        <div className="checkout-summary">
          {cartItems.map((c, i) => (
            <div key={i} className="checkout-summary-row">
              <span>{c.name} ({c.size}) × {c.quantity}</span>
              <span>Rs. {(c.price * c.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="field">
            <label htmlFor="co-address">Delivery Address</label>
            <input id="co-address" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="co-phone">Phone Number</label>
            <input id="co-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {error && <p className="field-error">{error}</p>}

          <div className="quickview-actions">
            <button type="button" className="btn btn-outline" onClick={onBack}>Back</button>
            {loading ? (
              <Loader3D size={30} />
            ) : (
              <button type="submit" className="btn btn-primary">Confirm</button>
            )}
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
};

export default CheckoutModal;
