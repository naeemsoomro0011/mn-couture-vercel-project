import { useEffect, useState } from 'react';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';
import Logo from '../common/Logo';
import OpeningOverlay from '../common/OpeningOverlay';
import { useOpeningRedirect } from '../../utils/useOpeningRedirect';
import { fetchShopInfo } from '../../api/shopInfo';
import { buildSocialLinks, telUrl, mailUrl, mapOpenUrl, mapQuery } from '../../utils/shopLinks';
import './Footer.css';

// Only the wording is a fallback — every link/number below comes from whatever
// the admin saved in Dashboard → Basic Info.
const FALLBACK = {
  description: "Premium, high-class clothing for Men's, Women's, Kids & New Born — all under one roof.",
};

const Footer = () => {
  const [info, setInfo] = useState(FALLBACK);
  const { opening, openWithRedirect } = useOpeningRedirect();

  useEffect(() => {
    fetchShopInfo().then((data) => data && setInfo({ ...FALLBACK, ...data })).catch(() => {});
  }, []);

  const ICONS = { facebook: FaFacebookF, instagram: FaInstagram, tiktok: FaTiktok, whatsapp: FaWhatsapp };
  const socials = buildSocialLinks(info)
    .filter((s) => s.url)
    .map((s) => ({ ...s, icon: ICONS[s.key] }));

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo size={40} />
          <p className="footer-tagline">{info.description}</p>
          <button
            type="button" className="footer-timing footer-contact-link"
            onClick={() => openWithRedirect('Google Maps', mapOpenUrl(info))}
          >
            <FaMapMarkerAlt /> {info.address || mapQuery(info)}
          </button>
          {info.timing && <p className="footer-timing">🕘 {info.timing}</p>}
        </div>

        <div className="footer-socials">
          <p className="footer-heading">Follow Us</p>
          <div className="footer-social-icons">
            {socials.map(({ icon: Icon, url, label }) => (
              <button
                key={label} type="button" className="footer-social-btn" aria-label={label} title={label}
                onClick={() => openWithRedirect(label, url)}
              >
                <Icon />
              </button>
            ))}
            {socials.length === 0 && <p className="footer-social-empty">Links coming soon.</p>}
          </div>
        </div>

        <div className="footer-contact">
          <p className="footer-heading">Get in Touch</p>
          <button type="button" className="footer-contact-link" onClick={() => openWithRedirect('Phone', telUrl(info.phone))}>
            {info.phone}
          </button>
          <button type="button" className="footer-contact-link" onClick={() => openWithRedirect('Email', mailUrl(info.email))}>
            {info.email}
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MN Couture. All rights reserved.</p>
      </div>

      <OpeningOverlay label={opening} />
    </footer>
  );
};

export default Footer;
