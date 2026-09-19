const express = require('express');
const router = express.Router();
const { getShopInfo } = require('../controllers/shopInfoController');

router.get('/', getShopInfo);

module.exports = router;
