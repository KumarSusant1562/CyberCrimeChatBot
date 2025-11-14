// index.js - 1930 Cyber Crime Helpline WhatsApp Bot
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Twilio = require('twilio');
const connectDB = require('./db');
const Complaint = require('./models/Complaint');
const { handleHelpline1930Webhook } = require('./services/helpline1930WebhookHandler');
const helplineService = require('./services/helpline1930Service');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

// Start server
(async () => {
  try {
    await connectDB();
    console.log('✅ Database connected - 1930 Cyber Crime Helpline');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: '1930 Cyber Crime Helpline - Odisha',
      timestamp: new Date().toISOString()
    });
  });

  // Get all complaints (Admin API)
  app.get('/api/complaints', async (req, res) => {
    try {
      const complaints = await Complaint.find()
        .sort({ createdAt: -1 })
        .lean();
      res.json({ count: complaints.length, complaints });
    } catch (err) {
      console.error('Error fetching complaints:', err);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  });

  // Get single complaint
  app.get('/api/complaints/:id', async (req, res) => {
    try {
      const complaint = await Complaint.findOne({
        $or: [
          { _id: req.params.id },
          { ticketNumber: req.params.id.toUpperCase() }
        ]
      });
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      
      res.json(complaint);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      res.status(500).json({ error: 'Failed to fetch complaint' });
    }
  });

  // Update complaint status (Admin)
  app.patch('/api/complaints/:id', async (req, res) => {
    try {
      const { status, note, assignedTo, priority } = req.body;
      
      const complaint = await Complaint.findOne({
        $or: [
          { _id: req.params.id },
          { ticketNumber: req.params.id.toUpperCase() }
        ]
      });
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Update fields
      if (status) {
        complaint.status = status;
        complaint.timeline.push({
          action: 'Status Updated',
          description: `Status changed to: ${status}`,
          performedBy: 'admin',
          timestamp: new Date()
        });
        
        // Send WhatsApp notification to user
        try {
          await helplineService.sendStatusUpdateNotification(
            complaint.whatsappNumber,
            twilioClient,
            TWILIO_WHATSAPP_FROM,
            complaint,
            status,
            note
          );
        } catch (err) {
          console.warn('Failed to send WhatsApp notification:', err.message);
        }
      }

      if (note) {
        complaint.adminNotes.push({
          note: note,
          addedBy: 'admin',
          addedAt: new Date()
        });
        complaint.timeline.push({
          action: 'Note Added',
          description: 'Admin added a note',
          performedBy: 'admin',
          timestamp: new Date()
        });
      }

      if (assignedTo) {
        complaint.assignedTo = assignedTo;
        complaint.timeline.push({
          action: 'Assigned',
          description: `Complaint assigned to: ${assignedTo}`,
          performedBy: 'admin',
          timestamp: new Date()
        });
      }

      if (priority) {
        complaint.priority = priority;
      }

      await complaint.save();
      res.json({ success: true, complaint });
      
    } catch (err) {
      console.error('Error updating complaint:', err);
      res.status(500).json({ error: 'Failed to update complaint' });
    }
  });

  // Add note to complaint
  app.post('/api/complaints/:id/notes', async (req, res) => {
    try {
      const { note } = req.body;
      
      const complaint = await Complaint.findOne({
        $or: [
          { _id: req.params.id },
          { ticketNumber: req.params.id.toUpperCase() }
        ]
      });
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      complaint.adminNotes.push({
        note: note,
        addedBy: 'admin',
        addedAt: new Date()
      });

      complaint.timeline.push({
        action: 'Note Added',
        description: 'Admin added a note',
        performedBy: 'admin',
        timestamp: new Date()
      });

      // Send note to user via WhatsApp
      try {
        await twilioClient.messages.create({
          from: TWILIO_WHATSAPP_FROM,
          to: complaint.whatsappNumber,
          body: `📝 *Update on your complaint*\n\n🎫 Ticket: ${complaint.ticketNumber}\n\n${note}\n\n━━━━━━━━━━━━━━━━━━━━━\n1930 Cyber Helpline, Odisha`
        });
      } catch (err) {
        console.warn('Failed to send note via WhatsApp:', err.message);
      }

      await complaint.save();
      res.json({ success: true, complaint });
      
    } catch (err) {
      console.error('Error adding note:', err);
      res.status(500).json({ error: 'Failed to add note' });
    }
  });

  // Statistics endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const total = await Complaint.countDocuments();
      const registered = await Complaint.countDocuments({ status: 'Registered' });
      const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
      const resolved = await Complaint.countDocuments({ status: 'Resolved' });
      const closed = await Complaint.countDocuments({ status: 'Closed' });
      
      const financialFraud = await Complaint.countDocuments({ fraudCategory: 'financial_fraud' });
      const socialMediaFraud = await Complaint.countDocuments({ fraudCategory: 'social_media_fraud' });
      
      res.json({
        total,
        byStatus: { registered, inProgress, resolved, closed },
        byCategory: { financialFraud, socialMediaFraud }
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // WhatsApp Webhook
  app.get('/webhook', (req, res) => {
    console.log('✅ Webhook verification');
    res.status(200).send('1930 Helpline Webhook Active');
  });

  app.post('/webhook', async (req, res) => {
    console.log('📥 Webhook received from:', req.body.From);
    console.log('📨 Message:', req.body.Body);
    
    await handleHelpline1930Webhook(
      req, 
      res, 
      twilioClient, 
      TWILIO_WHATSAPP_FROM
    );
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 1930 Cyber Crime Helpline - Backend running on port ${PORT}`);
    console.log(`📱 WhatsApp Bot: ${TWILIO_WHATSAPP_FROM}`);
  });
})();
