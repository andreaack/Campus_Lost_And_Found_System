const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Claims
 *   description: Item claim submission, review, and status management
 */

/**
 * @swagger
 * /api/v1/claims:
 *   post:
 *     summary: Submit a claim with verification answers
 *     tags: [Claims]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, message]
 *             properties:
 *               itemId:  { type: string, example: '663a9f12b4e2c1' }
 *               message: { type: string, example: 'This is my laptop. I lost it Tuesday.' }
 *               verificationAnswers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question: { type: string, example: 'What brand is the charger?' }
 *                     answer:   { type: string, example: 'ASUS 65W' }
 *     responses:
 *       201:
 *         description: Claim submitted successfully
 *       400:
 *         description: Duplicate claim or item not available
 *   get:
 *     summary: Get all claims (admin only)
 *     tags: [Claims]
 *     responses:
 *       200: { description: List of all claims }
 *       403: { description: Admin only }
 */
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, message, verificationAnswers } = req.body;
    if (!itemId || !message) {
      return res.status(400).json({ success: false, error: { message: 'itemId and message are required' } });
    }
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      message,
      verificationAnswers: verificationAnswers || []
    });
    await claim.populate('itemId', 'name category status');
    await claim.populate('claimantId', 'name email');
    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: { message: 'You have already claimed this item' } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('itemId', 'name category status')
      .populate('claimantId', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: claims.length, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/claims/user/{userId}:
 *   get:
 *     summary: Get all claims submitted by a specific user
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User claim history }
 */
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.params.userId })
      .populate('itemId', 'name category status')
      .sort('-createdAt');
    res.json({ success: true, count: claims.length, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/claims/item/{itemId}:
 *   get:
 *     summary: Get all claims for a specific item
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Claims for the item }
 */
router.get('/item/:itemId', async (req, res) => {
  try {
    const claims = await Claim.find({ itemId: req.params.itemId })
      .populate('claimantId', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: claims.length, data: claims });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/claims/{id}:
 *   get:
 *     summary: Get a single claim by ID
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Claim details }
 *       404: { description: Claim not found }
 *   delete:
 *     summary: Delete a claim (owner or admin)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Claim deleted }
 *       403: { description: Not the owner }
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId', 'name category status')
      .populate('claimantId', 'name email');
    if (!claim) return res.status(404).json({ success: false, error: { message: 'Claim not found' } });
    res.json({ success: true, data: claim });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});
router.delete('/:id', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ success: false, error: { message: 'Claim not found' } });
    if (claim.claimantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Not authorised' } });
    }
    await claim.deleteOne();
    res.json({ success: true, message: 'Claim deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/claims/{id}/approve:
 *   put:
 *     summary: Approve a claim and mark item as recovered (admin only)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote: { type: string, example: 'Verified by ID and description match.' }
 *     responses:
 *       200: { description: Claim approved }
 *       403: { description: Admin only }
 *       404: { description: Claim not found }
 */
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ success: false, error: { message: 'Claim not found' } });
    claim.status = 'approved';
    claim.adminNote = adminNote || '';
    claim.resolvedAt = new Date();
    await claim.save();
    await Item.findByIdAndUpdate(claim.itemId, { status: 'recovered' });
    await claim.populate('itemId', 'name category status');
    await claim.populate('claimantId', 'name email');
    res.json({ success: true, data: claim, message: 'Claim approved and item marked as recovered' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/claims/{id}/reject:
 *   put:
 *     summary: Reject a claim (admin only)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote: { type: string, example: 'Description did not match the item.' }
 *     responses:
 *       200: { description: Claim rejected }
 *       403: { description: Admin only }
 */
router.put('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ success: false, error: { message: 'Claim not found' } });
    claim.status = 'rejected';
    claim.adminNote = adminNote || '';
    claim.resolvedAt = new Date();
    await claim.save();
    await claim.populate('itemId', 'name category status');
    await claim.populate('claimantId', 'name email');
    res.json({ success: true, data: claim, message: 'Claim rejected' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

module.exports = router;