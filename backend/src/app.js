const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const userAuthRoutes = require('./routes/userAuthRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const shopInfoRoutes = require('./routes/shopInfoRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminItemRoutes = require('./routes/adminItemRoutes');
const adminGalleryRoutes = require('./routes/adminGalleryRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const adminMessageRoutes = require('./routes/adminMessageRoutes');
const adminProfileRoutes = require('./routes/adminProfileRoutes');
const adminShopInfoRoutes = require('./routes/adminShopInfoRoutes');
const pusherAuthRoute = require('./routes/pusherAuthRoute');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MN Couture API is running.' });
});

app.use('/api/auth', userAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/shop-info', shopInfoRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin/items', adminItemRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
app.use('/api/admin/profile', adminProfileRoutes);
app.use('/api/admin/shop-info', adminShopInfoRoutes);
app.use('/api/pusher', pusherAuthRoute);

// Routes for items, gallery, orders, chat, shop-info, and the AI chatbot
// are added in later phases as those features get built.

app.use(notFound);
app.use(errorHandler);

module.exports = app;
