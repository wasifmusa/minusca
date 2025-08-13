import { Router } from 'express';
import { getCategories, getItemsByCategory, createItem, updateItem, deleteItem, exportCategoryAsCsv } from '../controllers/inventoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/categories', protect, getCategories);
router.get('/export/:categoryName', protect, exportCategoryAsCsv);
router.get('/:categoryName', protect, getItemsByCategory);
router.post('/', protect, adminOnly, createItem);
router.put('/:id', protect, adminOnly, updateItem);
router.delete('/:id', protect, adminOnly, deleteItem);

export default router;
