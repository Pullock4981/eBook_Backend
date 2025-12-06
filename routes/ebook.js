/**
 * eBook Routes
 * API endpoints for eBook access and viewing
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkeBookAccess } = require('../middleware/ipRestriction');
const eBookController = require('../controllers/eBookController');

/**
 * @route   GET /api/ebooks
 * @desc    Get user's eBooks
 * @access  Private
 */
router.get('/', authenticate, eBookController.getUserEBooks);

/**
 * @route   GET /api/ebooks/:productId/access
 * @desc    Get eBook access token
 * @access  Private
 */
router.get('/:productId/access', authenticate, eBookController.geteBookAccess);

/**
 * @route   GET /api/ebooks/:productId/viewer
 * @desc    Get eBook viewer URL
 * @access  Private
 */
router.get('/:productId/viewer', authenticate, eBookController.getViewerURL);

/**
 * @route   GET /api/ebooks/view
 * @desc    Serve watermarked PDF (protected by IP/device)
 * @access  Private (via token)
 * @note    This endpoint is protected by checkeBookAccess middleware
 *          which validates IP, device, and token
 */
router.get('/view', checkeBookAccess, eBookController.servePDF);

/**
 * @route   DELETE /api/ebooks/:accessId
 * @desc    Revoke eBook access
 * @access  Private
 */
router.delete('/:accessId', authenticate, eBookController.revokeeBookAccess);

module.exports = router;

