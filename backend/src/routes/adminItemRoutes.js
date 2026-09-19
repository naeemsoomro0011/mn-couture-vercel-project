const express = require('express');
const router = express.Router();
const { createItem, updateItem, deleteItem, getAdminItems } = require('../controllers/adminItemController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

router.use(protectAdmin);
router.get('/', getAdminItems);
router.post('/', createItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
