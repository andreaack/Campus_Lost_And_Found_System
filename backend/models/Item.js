const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: [
        'electronics',
        'clothing',
        'documents',
        'accessories',
        'bags',
        'keys',
        'other',
      ],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'recovered', 'archived'],
      default: 'pending',
    },
    imageUrls: [
      {
        type: String, // Cloudinary URLs (max 3)
      },
    ],
    dateLostFound: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance optimization

// Compound index for filtering by status and category (dashboard filters)
itemSchema.index({ status: 1, category: 1 });

// Index for sorting by date (recent items first)
itemSchema.index({ dateLostFound: -1 });

// Index for "My Items" page (find items by the user who reported them)
itemSchema.index({ reportedBy: 1 });

// Text index for keyword search (name, description, location)
itemSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);