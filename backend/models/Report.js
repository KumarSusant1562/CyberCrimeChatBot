// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  from: { type: String, required: true },
  description: { type: String, required: true },
  refId: { type: String },
  location: { type: String },
  category: { type: String, default: 'Uncategorized' },
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

module.exports = mongoose.model('Report', ReportSchema);
