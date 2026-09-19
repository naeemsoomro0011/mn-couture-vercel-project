import { useState } from 'react';

/**
 * Shows a brief "Opening X..." popup, then sends the visitor to the link the
 * ADMIN saved in Basic Info (social profiles, WhatsApp, phone, email, map).
 *
 * The new tab is opened synchronously inside the click handler — opening it
 * later from a setTimeout is treated as a pop-up by every browser and was
 * silently blocked, which is why some links looked dead.
 */
export const useOpeningRedirect = () => {
  const [opening, setOpening] = useState(null); // label string | null

  const openWithRedirect = (label, url) => {
    if (!url) return;

    const sameTab = /^(mailto:|tel:)/i.test(url);
    let win = null;

    if (!sameTab) {
      // Opened right now, during the user gesture → never pop-up blocked.
      win = window.open(url, '_blank', 'noopener,noreferrer');
    }

    setOpening(label);
    setTimeout(() => {
      if (sameTab || !win) window.location.href = url; // fallback if the tab was blocked
      setOpening(null);
    }, 650);
  };

  return { opening, openWithRedirect };
};
