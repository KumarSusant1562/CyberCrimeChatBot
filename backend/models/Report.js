// models/Report.js
const mongoose = require('mongoose');

// Counter for custom report IDs
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', CounterSchema);

const ReportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true }, // CYB001, CYB002, etc.
  from: { type: String, required: true },
  description: { type: String, required: true },
  refId: { type: String },
  location: { type: String },
  category: { type: String, default: 'Uncategorized' },
  subCategory: { type: String }, // Business type: E-commerce, Banking, etc.
  media: [{ url: String, contentType: String, uploadedAt: Date }],
  status: { type: String, default: 'Received' },
  
  // Timeline and conversation tracking
  timeline: [{
    action: String,          // e.g., "Status changed", "Note added", "Image uploaded"
    description: String,
    performedBy: String,     // "admin" or "user"
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Admin notes
  notes: [{
    content: String,
    addedBy: String,         // Admin identifier
    addedAt: { type: Date, default: Date.now }
  }],
  
  // AI conversation history
  conversation: [{
    from: String,            // "user" or "ai"
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Generate custom report ID
ReportSchema.pre('save', async function(next) {
  if (this.isNew && !this.reportId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'reportId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.reportId = `CYB${String(counter.seq).padStart(6, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Report', ReportSchema);
