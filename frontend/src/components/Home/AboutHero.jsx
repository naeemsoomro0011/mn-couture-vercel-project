import { useEffect, useState } from 'react';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaTshirt, FaGem, FaShoppingBag } from 'react-icons/fa';
import Logo from '../common/Logo';
import BlobBackground from '../common/BlobBackground';
import OpeningOverlay from '../common/OpeningOverlay';
import { useOpeningRedirect } from '../../utils/useOpeningRedirect';
import { fetchShopInfo } from '../../api/shopInfo';
import { buildSocialLinks } from '../../utils/shopLinks';
import './AboutHero.css';

const ICONS = { facebook: FaFacebookF, instagram: FaInstagram, tiktok: FaTiktok, whatsapp: FaWhatsapp };

// The CTA scrolls to the AI chat section.
const AboutHero = () => {
  const [info, setInfo] = useState({});
  const { opening, openWithRedirect } = useOpeningRedirect();

  useEffect(() => {
    fetchShopInfo().then((data) => data && setInfo(data)).catch(() => {});
  }, []);

  // Every icon below points at the link the admin saved in Basic Info.
  const socials = buildSocialLinks(info)
    .filter((s) => s.url)
    .map((s) => ({ ...s, icon: ICONS[s.key] }));

  return (
    <section id="home" className="about-hero">
      <BlobBackground variant="default" />
      <div className="container about-hero-inner">
        <div className="about-hero-text anim-left">
          <p className="home-eyebrow">Men's · Women's · Kids · New Born</p>
          <h1 className="home-title">Premium Couture, <br /> In Every Style.</h1>
          <p className="about-hero-desc">
            MN Couture is a high-class boutique offering the finest fabric, tailoring and finishing
            for men, women, kids and newborns — every size, for every occasion. No compromise on quality.
          </p>
          <a href="#ai-chat" className="btn btn-primary about-hero-cta">
            Talk to Our AI Assistant
          </a>

          <div className="about-hero-socials">
            {socials.map(({ icon: Icon, url, label }) => (
              <button
                key={label} type="button" className="about-social-btn" aria-label={label} title={label}
                onClick={() => openWithRedirect(label, url)}
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>

        <div className="about-hero-visual anim-right">
          <div className="about-visual-blob blob-morph card-3d">
            <Logo size={78} showText={false} />
          </div>
          <div className="about-visual-float about-visual-float-1"><FaTshirt /></div>
          <div className="about-visual-float about-visual-float-2"><FaGem /></div>
          <div className="about-visual-float about-visual-float-3"><FaShoppingBag /></div>
        </div>
      </div>

      <OpeningOverlay label={opening} />
    </section>
  );
};

export default AboutHero;
