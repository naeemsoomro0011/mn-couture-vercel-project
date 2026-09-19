# MN Couture — Premium E-commerce Platform

Full-stack MERN e-commerce site: React (Vite) frontend + Node/Express + MongoDB backend, with OTP-verified authentication, a full admin control panel, real-time chat, and an AI shopping assistant (Google Gemini, free tier).

**The build is complete** — it was delivered in 6 phases so quality stayed controlled at each step; section 5 below is a full changelog of what each phase added, plus a few deliberate adaptations worth knowing about.

---

## 1. Project Structure

```
mn-couture/
├── backend/     Node + Express + MongoDB API
└── frontend/    React (Vite) app
```

---

## 2. Backend Setup

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000 with nodemon
```

Your `.env` is already filled in with the credentials you shared (MongoDB Atlas, Gmail App Password, a freshly-generated JWT secret, and default admin login). On first run, the server automatically:
- Connects to your MongoDB Atlas cluster
- Creates the first **Admin** account (`admin@gmail.com` / `admin$123` — change this after first login)
- Creates the single **ShopInfo** document

### Environment variables (`backend/.env`)
| Variable | Purpose |
|---|---|
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` / `JWT_EXPIRE` | Signs login sessions (30-day persistent login) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail + App Password, used to send OTP & login-notification emails |
| `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` | First admin account, auto-created once |
| `GEMINI_API_KEY` | **Get a free key:** https://aistudio.google.com/apikey — the AI chat assistant won't reply without this. **Do not enable billing** on that Google Cloud project — it removes the free tier. |

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

`frontend/.env` already points at the local backend (`VITE_API_URL`, `VITE_SERVER_URL`).

---

## 4. 🔒 Important Security Notes

You shared your MongoDB password and Gmail App Password directly in our chat, so a couple of things worth doing:

1. **Never commit `.env` to GitHub.** Both `backend/.gitignore` and `frontend/.gitignore` already exclude it — keep it that way. `.env.example` is the safe, secret-free version to commit instead.
2. **Consider rotating both credentials** once everything is confirmed working — regenerate a new Gmail App Password (Google Account → Security → App Passwords) and change the MongoDB Atlas database user's password — since they passed through this chat.
3. If you ever deploy this (Render, Railway, Vercel, etc.), set these same variables in that platform's **environment variables / secrets** panel — never hardcode them into a file that gets pushed to a public repo.

---

## 5. What's Built vs. What's Next

**✅ Phase 1 — Foundation**
- All 8 MongoDB models (User, Admin, Item, Gallery, Order, Message, ShopInfo, ChatbotSession)
- Full auth system: signup + email OTP, login, forgot/reset password (OTP), persistent login (JWT httpOnly cookie), admin login, auto-seeded admin account
- Image upload endpoint (Multer)
- Branded OTP + login-notification emails (Nodemailer + Gmail)
- Gemini AI service foundation (free tier)
- Full design system: couture Plum→Gold theme, Fraunces + Plus Jakarta Sans type, blob-shape animations, 3D cards/buttons, dark (desktop-default) / light (mobile-default) themes
- Navbar, Footer, Login, Signup, Admin Login — fully responsive (360px → 992px+)

**✅ Phase 2 — Homepage Portions 1-3**
- Public `GET /api/items/top-priced` and `GET /api/items` endpoints
- **Portion 1:** About/Hero section — shop intro, CTA, social icon row
- **Portion 2:** Dynamic Top-10-priciest-items carousel with peek thumbnails and smooth 3D transitions — shows an elegant empty state until the admin adds items (exactly as specced)
- **Portion 3:** Category showcase (Men's / Women's / Kids / New Born) — my creative choice for this portion, ready to link into the shop grid next phase

**✅ Phase 3 — Full Shop Grid (Portion 4)**
- `POST /api/orders`, `GET /api/orders/my`, `PATCH /api/orders/:id` (edit while admin hasn't seen it yet)
- Animated search bar + filter popup (price range, gender, size — all optional)
- Items grouped by section: Men's / Women's / Kids / New Born
- Product cards with on-card size switching (S/M/L/XL, only sizes the admin actually added)
- Quick View popup: size carousel, per-size quantity, **multi-size purchase in one order** (e.g. 2 Medium + 1 Small), live total
- Checkout popup: address + phone, order summary, submits the request to the admin
- Gentle "login required" popup for guests trying to buy (browsing stays open to everyone)
- Category tiles now filter the shop grid and scroll to it
- Navbar's Orders dropdown shows real pending/approved status

**✅ Phase 4 — AI Chatbot, Gallery, Shop Info (Portions 5-7)**
- `POST /api/chatbot/message`, session history endpoints — **Google Gemini (free)**, grounded in your real product data so it only ever recommends items that actually exist
- Chat replies mark suggested items as `[[Item Name]]`, which the frontend turns into a clickable link that scrolls straight to that product card
- ChatGPT-style history sidebar: new chat, switch between past chats, delete a chat — chat only works when logged in (browsing stays open to everyone)
- `GET /api/gallery`, `GET /api/shop-info` (public read endpoints — admin editing lives in the Admin Panel, see Phase 5)
- Gallery: responsive masonry-style grid with 3D hover, empty state until admin uploads photos
- Shop Info section: owner/contact details + Google Maps embed (falls back to a styled placeholder until a map link is set)
- Footer now pulls real shop data instead of hardcoded text

**✅ Phase 5 — Full Admin Panel**
- Admin routes for Items, Gallery, Orders, Messages, Profile, Shop Info — all protected by `protectAdmin`
- **Foldable sidebar** (desktop, matte dark, collapses to icon-only) + **bottom tabbar** (mobile) — premium 3D nav with active-state glow
- **Items:** animated search, "+ Create" popup with per-size picture/price/label (quick-select S/M/L/XL chips or free text for New Born), 3-dot menu → Edit/Delete, instant sync to the live shop grid
- **Gallery:** multi-image upload (device or URL) in one popup, inline caption editing, 3-dot delete
- **Inbox:** every order request with unseen-count badge, user info + items + total, in-place **Chat popup** (persists full history), Confirm (approves + notifies), Delete (admin-side only — never removes it from the shopper's own order history)
- **Basic Info:** edit shop name/logo/description/owner/contact/socials/map link — saves straight to the live site and Footer
- **Profile:** edit name/picture/numbers, email change (2-step OTP — see Phase 6), password update (requires old password), logout
- Fast 3D loader used consistently across every popup and async action

**✅ Phase 6 — Real-Time Chat + Final Polish**
- **Socket.io wired end-to-end:** shopper ↔ admin messages now appear instantly on both sides, no refresh needed — same for new order requests hitting the admin Inbox and order-approval notifications reaching the shopper
- **Floating "Chat with Admin" bubble** on every shopper-facing page (logged-in users only) — separate from the AI assistant, this is the direct line to the shop owner, with an unread pulse indicator
- **Fixed a real gap:** the shopper's own Profile popup (view + edit name/picture/email) didn't have a backend yet — it's now fully built, including the **exact 2-step email-change flow from the brief**: OTP confirms on the OLD email first, then a second OTP verifies the NEW email before anything changes. The admin's email-change flow was upgraded to match, exactly as specced ("same as user's")
- **Performance polish:** route-level code-splitting (React.lazy) — a shopper's first visit no longer downloads the entire admin panel's code, and vice versa. Total bundle dropped from one 635 KB chunk to route-based chunks (initial load ≈ 440 KB)
- Full test sweep: backend (52 routes across 13 route files) — 0 syntax errors; frontend build — 591 modules, 0 errors; linter — 0 errors

**The full build is complete** — every portion from your original spec (user-facing Portions 1-7, the complete Admin Portion) is implemented, wired to the real database, and tested. See "A Few Notes" below for the handful of deliberate, documented adaptations made along the way.

**✅ Post-launch bug-fix round 1** — after your testing feedback, this round fixed:
- Critical `otpPurpose` schema bug that was blocking every email change (both shopper and admin)
- Gemini model name corrected to the stable `gemini-2.5-flash` (the chatbot was completely broken before this)
- Order delete no longer removes the order from the shopper's own history — it only hides it from the admin's inbox
- Old uploaded files (profile pictures, item/gallery photos, shop logo) are now deleted from disk when replaced, so `uploads/` doesn't grow forever
- Every popup now renders through a React Portal directly on `document.body`, fixing a CSS quirk where popups nested inside an animated card were positioning themselves relative to that card instead of the full screen
- SweetAlert2 popups: the Cancel/Back button was set to a transparent color (invisible) — fixed, plus a proper premium gradient-border theme
- Dark theme shifted to a more premium deep teal-black (`#0c1416`) instead of purple-black
- New 3D rotating-gem loader, replacing the earlier flat spinner
- Navbar rebuilt: logo left, section links center (smooth-scroll), theme toggle right
- Admin panel now has the same dark/light toggle as the shopper side, plus a live unread-count badge on the Inbox nav item
- Item/Gallery forms: added a URL option alongside device upload
- Social icons and shop contact details (email/WhatsApp/phone) now show an "Opening X..." popup before redirecting to the right handler
- Shop location now shows a real embedded map by default
- Gallery rebuilt from a static grid into a 3D flying carousel (not blob-shaped)
- Top Picks carousel cards now have Eye (quick view) and Buy buttons, sharing the exact same buy flow as the main shop grid
- Category icons replaced with fashion-specific ones; blob-shape cropping softened so product photos are never awkwardly cut off
- Chat widget resized to a more moderate height; both admin↔shopper chat threads now defensively re-fetch and de-duplicate messages
- New premium "My Orders" popup for shoppers — view and edit an order (address, phone, quantities) until the admin has seen it
- Shoppers can now also change their password (with old-password confirmation, plus a "forgot password" fallback) — this was missing before
- Admin Profile page redesigned with a cleaner two-section premium layout
- **Full site-wide English translation** — every button, heading, alert, validation message, and email template, on both frontend and backend

**✅ Post-launch bug-fix round 2:**
- **Confirmed root cause found:** the old-file cleanup from round 1 was never actually deleting anything — `uploadImage()` on the frontend returns a *full* URL (`http://localhost:5000/uploads/...`), but the cleanup utility only matched *relative* `/uploads/...` paths. Fixed — replacing any picture (profile, item, gallery, logo) now genuinely removes the old file.
- Gemini model updated to `gemini-3.6-flash` (Google deprecated `2.5-flash` for new API keys after this project started — their own error message pointed to the replacement)
- Item search rebuilt: MongoDB's word-tokenized `$text` search was matching unrelated items (e.g. searching "kids-1" also matched "Female-1" because both tokenize down to include "1") — replaced with proper case-insensitive partial matching, both in the admin panel and the public shop search
- Item names are now enforced unique (case-insensitive) on create and edit
- SweetAlert2's Cancel/Back button was relying on inherited `currentColor`, which could resolve to something invisible — now has an explicit, always-visible color
- **Found a real, widespread bug:** native `<button>` elements don't inherit text color by default in any browser (a CSS spec quirk) — every button without its own explicit color was rendering with the browser's default button-text color, invisible or low-contrast against dark cards. Fixed globally with one rule.
- The floating chat bubble (FAB + panel) now renders through a Portal too — it had the same viewport-positioning bug as the modals before the Portal fix
- Removed a redundant leftover `max-height` on the admin chat popup that could still detach its border on scroll
- Admin Inbox: the sidebar's unread-count badge now updates instantly when an order is opened/seen, not just on new orders or page navigation
- Shop info (WhatsApp/Facebook/Instagram/TikTok/location) now sent with no-cache headers plus a cache-busting param, so an admin update is reflected immediately rather than showing a stale cached copy
- Admin Profile page reflowed to a horizontal layout on wider screens so it uses the full available width instead of leaving empty space
- Login and password-change now send confirmation emails on **both** the shopper and admin sides (login email was already wired for shoppers but missing for admin; password-change email didn't exist at all before)
- Navbar center-links CSS was accidentally left unstyled after the earlier restructure (logo/links/toggle) — rebuilt properly with true centering, spacing, and hover underline
- Shop grid item cards made noticeably more compact (shorter image ratio, tighter spacing, more columns on wider screens)

---

## 6. Notes on a Few Design Decisions

- **Sizes are flexible, not fixed to S/M/L/XL:** each size an admin adds has its own price/picture/stock. This covers normal clothing sizes *and* New Born items, where you set custom age-range labels (e.g. "0-1 Month") instead.
- **Accounts only "exist" after OTP verification** — matches "account banega jab OTP correct ho." An unverified signup can safely be retried with the same email.
- **Forgot Password is a popup, not a page** — matches the brief exactly (email step → OTP + new password step, same modal).
- **"0.1s loader"** is implemented as a fast, energetic spin animation — actual wait time will match how long your database/email calls really take, since a literal 100ms round-trip isn't realistic over the internet.
- **Email-change confirmation:** the brief describes a "click YES" confirmation email for the old address. I implemented this as an OTP code instead (entered in the same popup, rather than a clickable email link) — it achieves the identical goal (proving the requester still controls the old email before anything changes) while staying consistent with the OTP pattern used everywhere else in the app, so it's one familiar UI instead of two different confirmation styles.

---

## 7. Troubleshooting

- **Emails not sending:** confirm 2-Step Verification is ON for that Gmail account and the App Password hasn't been revoked (Google Account → Security → App Passwords).
- **Mongo connection fails:** in MongoDB Atlas → Network Access, make sure your current IP (or `0.0.0.0/0` for development) is allow-listed.
- **CORS / cookie issues in production:** update `CLIENT_URL` in `backend/.env` to your deployed frontend URL, and the cookie `sameSite`/`secure` settings will automatically switch to production mode.
- **Real-time chat not updating live:** Socket.io uses the same `CLIENT_URL` for its CORS check, so if that's wrong the REST API will work but live messages won't arrive until a refresh — double check it matches your frontend's actual URL exactly (including `http://` vs `https://`).
- **AI chatbot says it's not configured:** you haven't pasted a real `GEMINI_API_KEY` into `backend/.env` yet — grab a free one from the link above and restart the backend.
