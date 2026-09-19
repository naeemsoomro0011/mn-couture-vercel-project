import { useEffect, useMemo, useState } from 'react';
import {
  FaUpload, FaLink, FaStore, FaUserTie, FaPhoneAlt, FaWhatsapp, FaEnvelope, FaRegClock,
  FaFacebookF, FaInstagram, FaTiktok, FaMapMarkedAlt, FaMapMarkerAlt, FaImage,
  FaCheckCircle, FaSave, FaExternalLinkAlt, FaTrashAlt,
} from 'react-icons/fa';
import { fetchShopInfo } from '../../api/shopInfo';
import { updateAdminShopInfo } from '../../api/admin';
import { uploadImage } from '../../utils/uploadImage';
import { socialUrl, whatsappUrl, telUrl, mailUrl, mapOpenUrl } from '../../utils/shopLinks';
import Loader3D from '../../components/common/Loader3D';
import { alertSuccess, alertError } from '../../utils/alerts';
import './AdminPages.css';

/**
 * The form is grouped into meaningful sections instead of one long column, and
 * every link field here is what the public site actually uses — the footer,
 * hero social icons, contact card and the map all read these values live.
 *
 * `preview` turns whatever the admin typed into the exact URL a customer will
 * open, so the little ↗ button next to a field is a real end-to-end test of
 * the link before it ever goes live.
 */
const SECTIONS = [
  {
    id: 'identity',
    title: 'Shop Identity',
    subtitle: 'How the shop introduces itself across the site',
    icon: FaStore,
    fields: [
      { key: 'shopName', label: 'Shop Name', icon: FaStore, placeholder: 'MN Couture' },
      { key: 'ownerName', label: 'Owner Name', icon: FaUserTie, placeholder: 'Muhammad Naeem' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Details',
    subtitle: 'Tapping these on the site calls, chats or emails you',
    icon: FaPhoneAlt,
    fields: [
      {
        key: 'phone', label: 'Phone Number', icon: FaPhoneAlt, placeholder: '03159833357', type: 'tel',
        link: true, preview: (v) => telUrl(v),
      },
      {
        key: 'whatsapp', label: 'WhatsApp Number', icon: FaWhatsapp, placeholder: '03159833357', type: 'tel',
        hint: 'A 03xx number is converted to 92xx automatically.',
        link: true, preview: (v) => whatsappUrl(v),
      },
      {
        key: 'email', label: 'Email', icon: FaEnvelope, placeholder: 'you@gmail.com', type: 'email',
        link: true, preview: (v) => mailUrl(v),
      },
      { key: 'timing', label: 'Shop Timing', icon: FaRegClock, placeholder: '09:00 am – 11:00 pm' },
    ],
  },
  {
    id: 'social',
    title: 'Social Links',
    subtitle: 'Paste a full link or just the username — both work',
    icon: FaInstagram,
    fields: [
      {
        key: 'facebook', label: 'Facebook', icon: FaFacebookF, placeholder: 'https://facebook.com/yourpage',
        link: true, preview: (v) => socialUrl(v, 'https://www.facebook.com/'),
      },
      {
        key: 'instagram', label: 'Instagram', icon: FaInstagram, placeholder: '@yourhandle',
        link: true, preview: (v) => socialUrl(v, 'https://www.instagram.com/'),
      },
      {
        key: 'tiktok', label: 'TikTok', icon: FaTiktok, placeholder: '@yourhandle',
        link: true, preview: (v) => socialUrl(v, 'https://www.tiktok.com/@'),
      },
    ],
  },
  {
    id: 'location',
    title: 'Location',
    subtitle: 'Drives the map on the contact section',
    icon: FaMapMarkedAlt,
    fields: [
      { key: 'address', label: 'Shop Address', icon: FaMapMarkerAlt, placeholder: 'Shop #12, Main Bazar, Sukkur' },
      {
        key: 'mapLink', label: 'Google Maps Link (optional)', icon: FaMapMarkedAlt,
        placeholder: 'Paste the Google Maps share or embed link',
        link: true, full: true,
        hint: 'Paste the "Share" link from the Google Maps app — it\'s resolved to the exact pin automatically on Save. Leave empty to use the address above.',
        preview: (v, form) => mapOpenUrl({ ...form, mapLink: v }),
      },
    ],
  },
];

const ALL_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

/** Animated completion ring in the page header. */
const CompletionRing = ({ filled, total }) => {
  const pct = total ? Math.round((filled / total) * 100) : 0;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="admin-ring" title={`${filled} of ${total} details completed`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="adminRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle className="admin-ring-track" cx="32" cy="32" r={radius} />
        <circle
          className="admin-ring-bar"
          cx="32" cy="32" r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * pct) / 100}
        />
      </svg>
      <span className="admin-ring-value">{pct}<small>%</small></span>
    </div>
  );
};

const AdminBasicInfo = () => {
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrlMode, setLogoUrlMode] = useState(false);

  useEffect(() => {
    fetchShopInfo()
      .then((data) => {
        setForm(data || {});
        setInitial(data || {});
      })
      .catch(() => {
        setForm({});
        setInitial({});
      });
  }, []);

  const dirty = useMemo(() => {
    if (!form || !initial) return false;
    if ((form.description || '') !== (initial.description || '')) return true;
    if ((form.logoUrl || '') !== (initial.logoUrl || '')) return true;
    return ALL_KEYS.some((k) => (form[k] || '') !== (initial[k] || ''));
  }, [form, initial]);

  const filledCount = useMemo(
    () => (form ? ALL_KEYS.filter((k) => (form[k] || '').trim()).length : 0),
    [form]
  );

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleLogoUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setField('logoUrl', url);
    } catch {
      alertError('Upload failed', 'That image could not be uploaded. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateAdminShopInfo(form);
      setForm(updated);
      setInitial(updated);
      alertSuccess('Saved!', 'Shop info has been updated on both the dashboard and the live site.');
    } catch (err) {
      alertError('Failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openPreview = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const descLength = (form?.description || '').length;
  const descPercent = Math.min(100, (descLength / 220) * 100);
  const savedPercent = ALL_KEYS.length ? (filledCount / ALL_KEYS.length) * 100 : 0;

  return (
    <div className="admin-page admin-page-wide">
      <div className="admin-page-header">
        <div className="admin-page-heading">
          <h2>Basic Info</h2>
          <p className="admin-page-subtitle">Everything here appears live on the customer site.</p>
        </div>

        {form && (
          <div className="admin-header-meta">
            <span className={`admin-status-pill ${dirty ? 'admin-status-pill-dirty' : ''}`}>
              {dirty ? <><i className="admin-pill-dot" /> Unsaved changes</> : <><FaCheckCircle /> All changes saved</>}
            </span>
            <CompletionRing filled={filledCount} total={ALL_KEYS.length} />
          </div>
        )}
      </div>

      {!form ? (
        <div className="admin-loading-block"><Loader3D label="Loading..." /></div>
      ) : (
        <form onSubmit={handleSave} className="admin-form admin-info-form">
          {/* ---- Brand card ---- */}
          <section className="admin-info-card card-3d admin-reveal" style={{ '--d': '0.02s' }}>
            <div className="admin-info-card-head">
              <span className="admin-info-icon"><FaImage /></span>
              <div>
                <h3>Brand &amp; Description</h3>
                <p>Your logo and the intro line customers read first</p>
              </div>
            </div>

            <div className="admin-brand-row">
              <div className="admin-logo-preview">
                {form.logoUrl ? <img src={form.logoUrl} alt="Shop logo" /> : <span className="admin-logo-empty">No Logo</span>}
                {uploading && <div className="admin-logo-uploading"><Loader3D size={26} /></div>}
              </div>

              <div className="admin-brand-actions">
                <label className="admin-chip-btn">
                  <FaUpload /> Upload Logo
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleLogoUpload(e.target.files[0])} />
                </label>
                <button type="button" className={`admin-chip-btn ${logoUrlMode ? 'admin-chip-btn-active' : ''}`} onClick={() => setLogoUrlMode((m) => !m)}>
                  <FaLink /> {logoUrlMode ? 'Hide URL' : 'Use Image URL'}
                </button>
                {form.logoUrl && (
                  <button type="button" className="admin-chip-btn admin-chip-btn-danger" onClick={() => setField('logoUrl', '')}>
                    <FaTrashAlt /> Remove
                  </button>
                )}
                <p className="admin-field-hint">PNG or JPG, square looks best.</p>
              </div>
            </div>

            {logoUrlMode && (
              <input
                type="text" className="admin-url-input" placeholder="https://.../logo.png"
                value={form.logoUrl || ''} onChange={(e) => setField('logoUrl', e.target.value)}
              />
            )}

            <div className="admin-field" style={{ '--fd': '0.05s' }}>
              <div className="admin-field-top">
                <label htmlFor="shop-description">Description</label>
                <span className={`admin-counter ${descLength > 200 ? 'admin-counter-warn' : ''}`}>{descLength}/220</span>
              </div>
              <textarea
                id="shop-description" maxLength={220} rows={3}
                placeholder="A short, premium line about your shop..."
                value={form.description || ''}
                onChange={(e) => setField('description', e.target.value)}
              />
              <div className="admin-meter"><span style={{ width: `${descPercent}%` }} /></div>
            </div>
          </section>

          {/* ---- Grouped field cards ---- */}
          {SECTIONS.map((section, si) => {
            const SectionIcon = section.icon;
            return (
              <section
                key={section.id}
                className="admin-info-card card-3d admin-reveal"
                style={{ '--d': `${0.06 + si * 0.06}s` }}
              >
                <div className="admin-info-card-head">
                  <span className="admin-info-icon"><SectionIcon /></span>
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.subtitle}</p>
                  </div>
                </div>

                <div className="admin-field-grid">
                  {section.fields.map(({ key, label, icon: Icon, placeholder, type, hint, link, full, preview }, fi) => {
                    const value = form[key] || '';
                    const previewUrl = link && value.trim() && preview ? preview(value, form) : '';

                    return (
                      <div
                        className={`admin-field ${full ? 'admin-field-full' : ''}`}
                        key={key}
                        style={{ '--fd': `${0.04 * fi}s` }}
                      >
                        <div className="admin-field-top">
                          <label htmlFor={`field-${key}`}>{label}</label>
                          {link && value.trim() ? <span className="admin-field-live">Live</span> : null}
                        </div>

                        <div className={`admin-input-wrap ${previewUrl ? 'admin-input-wrap-has-action' : ''}`}>
                          <span className="admin-input-icon"><Icon /></span>
                          <input
                            id={`field-${key}`}
                            type={type || 'text'}
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setField(key, e.target.value)}
                          />
                          {previewUrl && (
                            <button
                              type="button"
                              className="admin-field-open"
                              onClick={() => openPreview(previewUrl)}
                              title="Test this link"
                              aria-label={`Test ${label} link`}
                            >
                              <FaExternalLinkAlt />
                            </button>
                          )}
                        </div>

                        {hint && <p className="admin-field-hint">{hint}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* ---- Sticky save bar ---- */}
          <div className="admin-save-bar">
            <div className="admin-save-bar-progress">
              <p className="admin-save-bar-text">
                <strong>{filledCount}/{ALL_KEYS.length}</strong> details completed
              </p>
              <div className="admin-meter admin-save-meter"><span style={{ width: `${savedPercent}%` }} /></div>
            </div>

            {saving ? (
              <Loader3D size={30} />
            ) : (
              <button type="submit" className="btn btn-primary admin-save-btn" disabled={!dirty}>
                <FaSave /> {dirty ? 'Save Changes' : 'Saved'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminBasicInfo;
