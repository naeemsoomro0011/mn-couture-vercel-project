import { useEffect, useState } from 'react';
import {
  FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaUserTie, FaRegClock,
  FaFacebookF, FaInstagram, FaTiktok, FaExternalLinkAlt,
} from 'react-icons/fa';
import { fetchShopInfo } from '../../api/shopInfo';
import { buildSocialLinks, telUrl, mailUrl, whatsappUrl, mapEmbedSrc, mapOpenUrl, mapQuery } from '../../utils/shopLinks';
import Logo from '../common/Logo';
import BlobBackground from '../common/BlobBackground';
import OpeningOverlay from '../common/OpeningOverlay';
import { useOpeningRedirect } from '../../utils/useOpeningRedirect';
import './ShopInfoSection.css';

const SOCIAL_ICONS = { facebook: FaFacebookF, instagram: FaInstagram, tiktok: FaTiktok, whatsapp: FaWhatsapp };

const ShopInfoSection = () => {
  const [info, setInfo] = useState(null);
  const { opening, openWithRedirect } = useOpeningRedirect();

  useEffect(() => {
    fetchShopInfo().then(setInfo).catch(() => {});
  }, []);

  if (!info) return null;

  // Map + every contact link is driven by what the admin saved in Basic Info.
  const mapSrc = mapEmbedSrc(info);
  const socials = buildSocialLinks(info).filter((s) => s.url).map((s) => ({ ...s, icon: SOCIAL_ICONS[s.key] }));

  return (
    <section id="contact" className="shopinfo-section">
      <BlobBackground variant="contact" />
      <div className="container shopinfo-inner">
        <div className="shopinfo-card card-3d anim-left">
          <div className="shopinfo-card-scroll scroll-thin">
            <Logo size={56} />
            <p className="shopinfo-desc">
              {info.description || "MN Couture — premium clothing for Men's, Women's, Kids and New Born, all under one roof."}
            </p>

            <div className="shopinfo-details">
              {info.ownerName && <p><FaUserTie /> <span>{info.ownerName}</span></p>}

              {info.phone && (
                <button type="button" className="shopinfo-detail-btn" onClick={() => openWithRedirect('Phone', telUrl(info.phone))}>
                  <FaPhone /> <span>{info.phone}</span>
                </button>
              )}

              {info.whatsapp && (
                <button
                  type="button" className="shopinfo-detail-btn"
                  onClick={() => openWithRedirect('WhatsApp', whatsappUrl(info.whatsapp, `Assalam-o-Alaikum ${info.shopName || 'MN Couture'}!`))}
                >
                  <FaWhatsapp /> <span>{info.whatsapp}</span>
                </button>
              )}

              {info.email && (
                <button type="button" className="shopinfo-detail-btn" onClick={() => openWithRedirect('Email', mailUrl(info.email))}>
                  <FaEnvelope /> <span>{info.email}</span>
                </button>
              )}

              <button type="button" className="shopinfo-detail-btn" onClick={() => openWithRedirect('Google Maps', mapOpenUrl(info))}>
                <FaMapMarkerAlt /> <span>{info.address || mapQuery(info)}</span>
              </button>

              {info.timing && <p><FaRegClock /> <span>{info.timing}</span></p>}
            </div>

            {socials.length > 0 && (
              <div className="shopinfo-socials">
                {socials.map(({ icon: Icon, url, label }) => (
                  <button
                    key={label} type="button" className="shopinfo-social-btn" aria-label={label} title={label}
                    onClick={() => openWithRedirect(label, url)}
                  >
                    <Icon />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shopinfo-map card-3d anim-right">
          <iframe
            key={mapSrc}
            src={mapSrc}
            title="Shop Location"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <button
            type="button" className="btn btn-primary shopinfo-map-btn"
            onClick={() => openWithRedirect('Google Maps', mapOpenUrl(info))}
          >
            <FaExternalLinkAlt /> Open in Google Maps
          </button>
        </div>
      </div>

      <OpeningOverlay label={opening} />
    </section>
  );
};

export default ShopInfoSection;
