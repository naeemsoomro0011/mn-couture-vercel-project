const express = require('express');
const router = express.Router();
const { getAllOrders, getUnseenCount, markSeen, markAllSeen, approveOrder, deleteOrder } = require('../controllers/adminOrderController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

router.use(protectAdmin);
router.get('/', getAllOrders);
router.get('/unseen-count', getUnseenCount);
router.patch('/seen-all', markAllSeen); // must stay above '/:id/...' so 'seen-all' isn't read as an id
router.patch('/:id/seen', markSeen);
router.patch('/:id/approve', approveOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
