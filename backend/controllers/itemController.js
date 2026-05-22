const Item = require('../models/Item');
// POST /api/v1/items  — Report a new item
exports.createItem = async (req, res) => {
  const imageUrls = req.files ? req.files.map(f => f.path) : [];
  const item = await Item.create({
    ...req.body,
    reportedBy : req.user._id,
    imageUrls,
  });
  res.status(201).json({ success: true, data: item });
};
// GET /api/v1/items  — List all approved items (paginated)
exports.getItems = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip  = (page - 1) * limit;

  const items = await Item.find({ status: 'approved' })
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip).limit(limit);

  const total = await Item.countDocuments({ status: 'approved' });
  res.json({ success: true, count: items.length, total, page, pages: Math.ceil(total / limit), data: items });
};
// GET /api/v1/items/:id
exports.getItem = async (req, res) => {
  const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  res.json({ success: true, data: item });
};
// PUT /api/v1/items/:id
exports.updateItem = async (req, res) => {
  let item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const isOwner = item.reportedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin')
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: item });
};

// DELETE /api/v1/items/:id
exports.deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  await item.deleteOne();
  res.json({ success: true, data: {} });
};
// PUT /api/v1/items/:id/mark-recovered
exports.markRecovered = async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, { status: 'recovered' }, { new: true });
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  res.json({ success: true, data: item });
};

// GET /api/v1/items/search?q=laptop
exports.searchItems = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: { code: 'MISSING_QUERY' } });

  const items = await Item.find(
    { $text: { $search: q }, status: 'approved' },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } }).limit(20);

  res.json({ success: true, count: items.length, data: items });
};

// GET /api/v1/items/filter?type=lost&category=electronics&status=approved
exports.filterItems = async (req, res) => {
  const { type, category, location, status, dateFrom, dateTo } = req.query;
  const query = {};

  if (type)     query.type     = type;
  if (category) query.category = category;
  if (location) query.location = new RegExp(location, 'i');
  if (status)   query.status   = status;
  if (dateFrom || dateTo) {
    query.dateLostFound = {};
    if (dateFrom) query.dateLostFound.$gte = new Date(dateFrom);
    if (dateTo)   query.dateLostFound.$lte = new Date(dateTo);
  }

  const items = await Item.find(query).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, count: items.length, data: items });
};

// GET /api/v1/items/admin/all — Get all items for admin (including pending)
exports.getAllItemsForAdmin = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  }

  const items = await Item.find()
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: items.length, data: items });
};

// PATCH /api/v1/items/:id/status — Update item status (approve/reject)
exports.updateItemStatus = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  }

  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS' } });
  }

  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('reportedBy', 'name email');

  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  res.json({ success: true, data: item });
};

