import { useEffect, useState } from 'react';
import { FaComments, FaCheck, FaTrash, FaUserCircle } from 'react-icons/fa';
import { fetchAdminOrders, markAllOrdersSeen, approveAdminOrder, deleteAdminOrder } from '../../api/admin';
import AdminChatModal from '../../components/AdminShared/AdminChatModal';
import Loader3D from '../../components/common/Loader3D';
import socket from '../../socket';
import { alertConfirm, alertSuccess, alertError } from '../../utils/alerts';
import './AdminPages.css';

const AdminInbox = () => {
  const [orders, setOrders] = useState(null);
  const [chatUser, setChatUser] = useState(null);

  const load = () => {
    fetchAdminOrders().then(setOrders).catch(() => setOrders([]));
  };

  // Simply opening the Inbox means the admin has now SEEN these requests, so
  // the unseen flags are cleared server-side FIRST and the list is fetched
  // after — otherwise the fetch could win the race and paint stale "Unseen"
  // pills. Previously the flags only cleared when the admin opened a chat or
  // confirmed an order, which left the "New" pill and the sidebar dot stuck
  // on even after everything had been read.
  const markSeenThenLoad = () => {
    markAllOrdersSeen().catch(() => {}).finally(load);
  };

  useEffect(markSeenThenLoad, []);

  // New order requests appear instantly, without needing a page refresh.
  useEffect(() => {
    socket.connect();
    socket.emit('join', { role: 'admin' });

    // The admin is literally looking at the Inbox right now, so a freshly
    // arrived request is counted as seen too — no stale badge left behind.
    const handleNewOrder = () => markSeenThenLoad();
    socket.on('newOrder', handleNewOrder);
    return () => socket.off('newOrder', handleNewOrder);
  }, []);

  const unseenCount = orders?.filter((o) => !o.seenByAdmin).length || 0;

  const openChat = (order) => setChatUser(order.user);

  const handleApprove = async (id) => {
    try {
      await approveAdminOrder(id);
      alertSuccess('Approved!', 'A reply has been sent to the customer.');
      load();
    } catch {
      alertError('Failed', 'Please try again.');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alertConfirm('Delete This Request?', 'This will only be removed from your inbox — the shopper will still see it.', 'Delete');
    if (!confirmed) return;
    try {
      await deleteAdminOrder(id);
      alertSuccess('Deleted!', '');
      load();
    } catch {
      alertError('Failed', 'Please try again.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>
          Inbox {unseenCount > 0 && <span className="order-status-badge order-status-pending">{unseenCount} New</span>}
        </h2>
      </div>

      {orders === null && <div className="admin-loading-block"><Loader3D label="Loading..." /></div>}
      {orders?.length === 0 && <p className="admin-empty">No requests yet.</p>}

      <div className="admin-inbox-list">
        {orders?.map((order) => (
          <div key={order._id} className="admin-inbox-row card-3d anim-up">
            {order.user?.profilePic ? (
              <img src={order.user.profilePic} alt={order.user.name} className="admin-inbox-avatar" />
            ) : (
              <FaUserCircle className="admin-inbox-avatar" style={{ fontSize: '2.4rem', color: 'var(--text-muted)', background: 'none' }} />
            )}

            <div className="admin-inbox-main">
              <div className="admin-inbox-badges">
                {!order.seenByAdmin && <span className="order-status-badge order-status-pending">Unseen</span>}
                <span className={`order-status-badge order-status-${order.status}`}>
                  {order.status === 'approved' ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="admin-inbox-name">{order.user?.name || 'Unknown User'}</p>
              <p className="admin-inbox-email">{order.user?.email}</p>
              <p className="admin-inbox-items">{order.items.map((i) => `${i.name} (${i.size} × ${i.quantity})`).join(', ')}</p>
              <p className="admin-inbox-address">{order.address} · {order.phone}</p>
              <p className="admin-inbox-total">Rs. {order.totalPrice.toLocaleString()}</p>
            </div>

            <div className="admin-inbox-actions">
              <button type="button" className="btn btn-outline" onClick={() => openChat(order)}>
                <FaComments /> Chat
              </button>
              {order.status !== 'approved' && (
                <button type="button" className="btn btn-primary" onClick={() => handleApprove(order._id)}>
                  <FaCheck /> Confirm
                </button>
              )}
              <button type="button" className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleDelete(order._id)}>
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminChatModal open={!!chatUser} targetUser={chatUser} onClose={() => setChatUser(null)} />
    </div>
  );
};

export default AdminInbox;
