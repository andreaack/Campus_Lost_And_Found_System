const Claim = require('../models/Claim');
const Item  = require('../models/Item');
const { sendClaimEmail } = require('../utils/mailer');


exports.submitClaim = async (req, res) => {
  const { itemId, message, verificationAnswers } = req.body;


  const duplicate = await Claim.findOne({ itemId, claimantId: req.user._id });
  if (duplicate)
    return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CLAIM' } });

  const item = await Item.findById(itemId);
  if (!item || item.status !== 'approved')
    return res.status(404).json({ success: false, error: { code: 'ITEM_NOT_FOUND' } });

  const claim = await Claim.create({
    itemId,
    claimantId  : req.user._id,
    message,
    verificationAnswers : verificationAnswers || [],
  });

  res.status(201).json({ success: true, data: claim });
};


exports.getAllClaims = async (req, res) => {
  const claims = await Claim.find()
    .populate('itemId',     'name type location')
    .populate('claimantId', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: claims.length, data: claims });
};


exports.getUserClaims = async (req, res) => {
  const claims = await Claim.find({ claimantId: req.params.userId })
    .populate('itemId', 'name type status imageUrls');
  res.json({ success: true, count: claims.length, data: claims });
};


exports.getItemClaims = async (req, res) => {
  const claims = await Claim.find({ itemId: req.params.itemId })
    .populate('claimantId', 'name email');
  res.json({ success: true, count: claims.length, data: claims });
};


exports.approveClaim = async (req, res) => {
  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', adminNote: req.body.adminNote || '', resolvedAt: new Date() },
    { new: true }
  ).populate('claimantId', 'name email').populate('itemId', 'name');

  if (!claim) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });


  await Item.findByIdAndUpdate(claim.itemId, { status: 'recovered' });

  /
  await sendClaimEmail(claim.claimantId.email, 'approved', claim);

  res.json({ success: true, data: claim });
};


exports.rejectClaim = async (req, res) => {
  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', adminNote: req.body.adminNote || '', resolvedAt: new Date() },
    { new: true }
  ).populate('claimantId', 'name email').populate('itemId', 'name');

  if (!claim) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  await sendClaimEmail(claim.claimantId.email, 'rejected', claim);
  res.json({ success: true, data: claim });
};


exports.deleteClaim = async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (claim.claimantId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  await claim.deleteOne();
  res.json({ success: true, data: {} });
};
