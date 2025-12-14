/**
 * Product Routes
 * API endpoints for product management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/slug/:slug', productController.getProductBySlug);

// Home page sections (public)
router.get('/sections/last-updates', productController.getLastUpdates);
router.get('/sections/coming-soon', productController.getComingSoon);
router.get('/sections/popular-reader', productController.getPopularReader);
router.get('/sections/frequently-downloaded', productController.getFrequentlyDownloaded);
router.get('/sections/favourited', productController.getFavourited); // Most viewed/clicked products
router.get('/sections/new-added', productController.getNewAdded); // Newly added products

// PDF proxy route (must be before /:id route)
router.get('/:id/pdf-proxy', productController.proxyPDF);

router.get('/:id', productController.getProductById);

// Admin routes (require authentication and admin role)
router.get('/admin/digital', authenticate, requireAdmin, productController.getDigitalProducts);
router.post('/', authenticate, requireAdmin, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;

