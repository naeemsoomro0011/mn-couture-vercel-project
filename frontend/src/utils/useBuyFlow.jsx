import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertSuccess } from './alerts';
import QuickViewModal from '../components/Shop/QuickViewModal';
import CheckoutModal from '../components/Shop/CheckoutModal';
import LoginRequiredModal from '../components/Shop/LoginRequiredModal';

export const useBuyFlow = () => {
  const { user } = useAuth();
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [quickViewSize, setQuickViewSize] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);

  const openQuickView = (item, sizeLabel) => {
    setQuickViewItem(item);
    setQuickViewSize(sizeLabel);
  };

  const handleProceedToCheckout = (cartItems, total) => {
    setQuickViewItem(null);
    if (!user) {
      setLoginRequiredOpen(true);
      return;
    }
    setCheckout({ cartItems, total });
  };

  const handleOrderSuccess = () => {
    setCheckout(null);
    alertSuccess('Sent!', 'Your request has been sent to the shop — please wait for a response.');
  };

  const modals = (
    <>
      <QuickViewModal
        item={quickViewItem}
        initialSizeLabel={quickViewSize}
        open={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        onProceedToCheckout={handleProceedToCheckout}
      />
      <CheckoutModal
        open={!!checkout}
        cartItems={checkout?.cartItems || []}
        total={checkout?.total || 0}
        onClose={() => setCheckout(null)}
        onBack={() => setCheckout(null)}
        onSuccess={handleOrderSuccess}
      />
      <LoginRequiredModal open={loginRequiredOpen} onClose={() => setLoginRequiredOpen(false)} />
    </>
  );

  return { openQuickView, modals };
};
