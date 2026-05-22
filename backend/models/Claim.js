const mongoose = require('mongoose');

// Embedded sub‑schema for verification questions/answers
const verificationAnswerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false } // no separate _id for each Q&A pair
);

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationAnswers: [verificationAnswerSchema],
    adminNote: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for performance optimization

// Find all claims for a specific item (admin view)
claimSchema.index({ itemId: 1 });

// Find all claims made by a specific user (claim history)
claimSchema.index({ claimantId: 1 });

// Unique compound index to prevent duplicate claims on the same item by the same user
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);