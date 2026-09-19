const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, updateMyOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.patch('/:id', updateMyOrder);

module.exports = router;
