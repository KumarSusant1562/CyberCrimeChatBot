// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  from: { type: String, required: true },
  description: { type: String, required: true },
  refId: { type: String },     // <- add this
  location: { type: String },  // <- add this
  category: { type: String, default: 'Uncategorized' },
  media: [{ url: String, contentType: String }],
  status: { type: String, default: 'Received' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('Report', ReportSchema);
