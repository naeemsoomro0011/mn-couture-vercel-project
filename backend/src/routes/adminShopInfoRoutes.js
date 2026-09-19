const express = require('express');
const router = express.Router();
const { updateShopInfo } = require('../controllers/adminShopInfoController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

router.patch('/', protectAdmin, updateShopInfo);

module.exports = router;
