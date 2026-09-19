const express = require('express');
const router = express.Router();
const { getTopPriced, getItems, getItemById } = require('../controllers/itemController');

router.get('/top-priced', getTopPriced);
router.get('/:id', getItemById);
router.get('/', getItems);

module.exports = router;
