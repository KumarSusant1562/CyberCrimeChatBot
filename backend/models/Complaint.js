// models/Complaint.js - For 1930 Cyber Crime Helpline
const mongoose = require('mongoose');

// Counter for ticket/reference numbers
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('ComplaintCounter', CounterSchema);

const ComplaintSchema = new mongoose.Schema({
  // Ticket/Reference Number
  ticketNumber: { type: String, unique: true }, // Format: 1930ODXXXXX
  
  // WhatsApp Details
  whatsappNumber: { type: String, required: true },
  
  // Personal Information
  name: { type: String, required: true },
  fatherSpouseName: { type: String },
  dateOfBirth: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  gender: { type: String }, // Male, Female, Other
  
  // Address Details
  village: { type: String },
  postOffice: { type: String },
  policeStation: { type: String },
  district: { type: String },
  pinCode: { type: String },
  
  // Complaint Category
  complaintType: { 
    type: String, 
    enum: ['new_complaint', 'status_check', 'account_unfreeze', 'other_query'],
    required: true 
  },
  
  // For New Complaints
  fraudCategory: { 
    type: String, 
    enum: ['financial_fraud', 'social_media_fraud', null] 
  },
  
  // Financial Fraud Types
  financialFraudType: { 
    type: String,
    enum: [
      'investment_trading_ipo',
      'customer_care',
      'upi_fraud',
      'apk_fraud',
      'fake_franchisee',
      'online_job',
      'debit_card',
      'credit_card',
      'ecommerce',
      'loan_app',
      'sextortion',
      'olx_fraud',
      'lottery',
      'hotel_booking',
      'gaming_app',
      'aeps_fraud',
      'tower_installation',
      'ewallet',
      'digital_arrest',
      'fake_website',
      'ticket_booking',
      'insurance_maturity',
      'others',
      null
    ]
  },
  
  // Social Media Fraud Types
  socialMediaFraudType: {
    type: String,
    enum: [
      'facebook_impersonation',
      'facebook_fake_account',
      'facebook_hack',
      'facebook_obscene',
      'instagram_impersonation',
      'instagram_fake_account',
      'instagram_hack',
      'instagram_obscene',
      'x_impersonation',
      'x_fake_account',
      'x_hack',
      'x_obscene',
      'whatsapp_impersonation',
      'whatsapp_fake_account',
      'whatsapp_hack',
      'whatsapp_obscene',
      'telegram_impersonation',
      'telegram_fake_account',
      'telegram_hack',
      'telegram_obscene',
      'gmail_impersonation',
      'gmail_hack',
      'gmail_obscene',
      'fraud_call_sms',
      null
    ]
  },
  
  // For Status Check
  existingComplaintNumber: { type: String },
  
  // For Account Unfreeze
  accountNumber: { type: String },
  bankName: { type: String },
  ifscCode: { type: String },
  
  // Description/Details
  description: { type: String },
  incidentDate: { type: String },
  amount: { type: Number }, // For financial frauds
  
  // Documents/Evidence
  documents: [{
    type: { 
      type: String,
      enum: [
        'aadhar_card',
        'pan_card',
        'debit_card',
        'credit_card',
        'bank_statement',
        'transaction_screenshot',
        'upi_screenshot',
        'disputed_screenshot',
        'request_letter',
        'govt_id',
        'url_screenshot',
        'other'
      ]
    },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Beneficiary Account Details (for financial fraud)
  beneficiaryDetails: {
    accountNumber: String,
    ifsc: String,
    upiId: String,
    transactionReferenceNumber: String,
    utrNumber: String,
    amount: Number,
    dateTime: String
  },
  
  // Status Management
  status: { 
    type: String, 
    default: 'Registered',
    enum: ['Registered', 'In Progress', 'Under Investigation', 'Escalated', 'Resolved', 'Closed']
  },
  
  priority: {
    type: String,
    default: 'Medium',
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  
  // Agent Assignment
  assignedTo: { type: String },
  
  // Admin Notes
  adminNotes: [{
    note: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Activity Timeline
  timeline: [{
    action: String,
    description: String,
    performedBy: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Links provided to user
  externalLinks: [{
    platform: String, // 'meta', 'x', 'whatsapp', 'telegram', 'google', 'sancharsaathi'
    url: String,
    providedAt: { type: Date, default: Date.now }
  }],
  
  // Conversation History
  chatHistory: [{
    from: String, // 'user' or 'bot'
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Generate custom ticket number
ComplaintSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'ticketNumber' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.ticketNumber = `1930OD${String(counter.seq).padStart(6, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
