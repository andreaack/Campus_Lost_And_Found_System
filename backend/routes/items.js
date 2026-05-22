const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Lost and found item reporting and management
 */

/**
 * @swagger
 * /api/v1/items:
 *   post:
 *     summary: Report a new lost or found item (with up to 3 images)
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [type, name, description, category, location, dateLostFound]
 *             properties:
 *               type:          { type: string, enum: [lost, found] }
 *               name:          { type: string, example: 'Blue ASUS Laptop' }
 *               description:   { type: string, example: '15-inch, sticker on lid' }
 *               category:      { type: string, enum: [electronics, clothing, documents, accessories, bags, keys, other] }
 *               location:      { type: string, example: 'Library 2nd floor' }
 *               dateLostFound: { type: string, format: date, example: '2026-04-09' }
 *               images:
 *                 type: array
 *                 maxItems: 3
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Item reported successfully }
 *       401: { description: Unauthorized }
 */
router.post('/', protect, upload.array('images', 3), async (req, res) => {
  try {
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const url = await uploadToCloudinary(file.buffer);
          imageUrls.push(url);
        } catch (uploadErr) {
          console.warn('Image upload skipped (Cloudinary error):', uploadErr.message);
        }
      }
    }
    const item = await Item.create({
      ...req.body,
      reportedBy: req.user._id,
      imageUrls,
    });
    await item.populate('reportedBy', 'name');
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});
/**
 * @swagger
 * /api/v1/items:
 *   get:
 *     summary: Get all approved items (paginated)
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of items
 */
router.get('/mine', protect, async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id }).populate('reportedBy', 'name').sort('-createdAt');
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = { status: { $in: ['approved', 'pending'] } };
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('reportedBy', 'name')
      .sort('-createdAt')
      .skip((page-1)*limit)
      .limit(limit);
    res.json({ success: true, count: items.length, total, pages: Math.ceil(total/limit), data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/items/search:
 *   get:
 *     summary: Search items by keyword (uses MongoDB text index)
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, example: 'laptop' }
 *     responses:
 *       200: { description: Matching items }
 *       400: { description: Missing query parameter }
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category, location } = req.query;
    if (!q) return res.status(400).json({ success: false, error: { message: 'Search query required' } });
    
    const filter = { $text: { $search: q } };
    if (category && category !== 'All Categories') {
      filter.category = category.toLowerCase();
    }
    if (location && location !== 'All Locations') {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    const items = await Item.find(filter)
      .populate('reportedBy', 'name')
      .sort({ score: { $meta: 'textScore' } });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/items/filter:
 *   get:
 *     summary: Filter items by type, category, location, status, and date range
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [lost, found] }
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [electronics, clothing, documents, accessories, bags, keys, other] }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, recovered, archived] }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Filtered items }
 */
router.get('/filter', async (req, res) => {
  try {
    const { type, category, location, status, dateFrom, dateTo } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.dateLostFound = {};
      if (dateFrom) filter.dateLostFound.$gte = new Date(dateFrom);
      if (dateTo) filter.dateLostFound.$lte = new Date(dateTo);
    }
    const items = await Item.find(filter).populate('reportedBy', 'name');
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/items/{id}:
 *   get:
 *     summary: Get single item by ID
 *     tags: [Items]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item detail }
 *       404: { description: Item not found }
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name');
    if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/items/{id}:
 *   put:
 *     summary: Update an item (owner or admin)
 *     tags: [Items]
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
 *               name:     { type: string }
 *               status:   { type: string, enum: [pending, approved, recovered, archived] }
 *               location: { type: string }
 *     responses:
 *       200: { description: Item updated }
 *       403: { description: Not the owner }
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Not authorised' } });
    }
    item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('reportedBy', 'name');
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/items/{id}:
 *   delete:
 *     summary: Delete an item (owner or admin)
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item deleted }
 *       403: { description: Not the owner }
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Not authorised' } });
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * @swagger
 * /api/v1/items/{id}/mark-recovered:
 *   put:
 *     summary: Mark item as recovered/returned
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item marked as recovered }
 *       404: { description: Item not found }
 */
router.put('/:id/mark-recovered', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name');
    if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
    item.status = 'recovered';
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/v1/items/admin/all — Get all items for admin (including pending)
router.get('/admin/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const items = await Item.find()
      .populate('reportedBy', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/v1/items/:id/status — Update item status (approve/reject)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

module.exports = router;