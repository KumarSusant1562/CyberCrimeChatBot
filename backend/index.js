// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const Report = require('./models/Report');
const cors = require('cors');
const path = require('path');
const Twilio = require('twilio');
const { classifyText } = require('./services/classifier');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Twilio sends x-www-form-urlencoded
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Environment variables
const PORT = process.env.PORT || 3001;
const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// =========================
// 🌐 PUBLIC HEALTH CHECK API
// =========================
app.get('/public/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Public API working successfully!',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// =========================
// Database Connection & Server Start
// =========================
(async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // =========================
  // Admin APIs
  // =========================

  // Health check for internal use
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Get all reports
  app.get('/api/reports', async (req, res) => {
    try {
      const reports = await Report.find().sort({ createdAt: -1 }).lean();
      res.json({ count: reports.length, reports });
    } catch (err) {
      console.error('Error fetching reports:', err);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  // Update report status
  app.patch('/api/reports/:id', async (req, res) => {
    try {
      const { status } = req.body;
      await Report.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() });
      res.json({ ok: true });
    } catch (err) {
      console.error('Error updating report:', err);
      res.status(500).json({ error: 'Failed to update report' });
    }
  });

  // =========================
  // Twilio WhatsApp Webhook
  // =========================
  app.post('/webhook', async (req, res) => {
    const incomingRaw = (req.body.Body || '').trim();
    const incoming = incomingRaw;
    const from = req.body.From || 'unknown';
    const numMedia = parseInt(req.body.NumMedia || '0', 10);

    const MessagingResponse = Twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    try {
      if (!incoming) {
        twiml.message('No text received. Send HELP for commands.');
        return res.type('text/xml').send(twiml.toString());
      }

      const words = incoming.split(/\s+/);
      const cmd = words[0].toUpperCase();

      // HELP command
      if (cmd === 'HELP') {
        twiml.message([
          'CyberCrime Helpline (demo)',
          'Commands:',
          '1) REPORT <description> - File a report (attach images if any)',
          '2) STATUS <id> - Check status',
          '3) CONTACT - Safety tips & helpline',
        ].join('\n'));
      }

      // REPORT command
      else if (cmd === 'REPORT') {
        const desc = incoming.slice(6).trim() || '(no text)';
        const media = [];

        // Collect attached media
        for (let i = 0; i < numMedia; i++) {
          const url = req.body[`MediaUrl${i}`];
          const contentType = req.body[`MediaContentType${i}`];
          if (url) media.push({ url, contentType });
        }

        // Optional AI classification
        let category = 'Uncategorized';
        try {
          category = await classifyText(desc);
        } catch {
          category = 'Uncategorized';
        }

        // Save report to DB
        const report = await Report.create({ from, description: desc, media, category });

        // Notify Admin (optional)
        if (process.env.ADMIN_WHATSAPP) {
          try {
            await twilioClient.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: process.env.ADMIN_WHATSAPP,
              body: `New report ${report._id}\nCategory: ${report.category}\nFrom: ${from}\n${desc}`,
            });
          } catch (err) {
            console.warn('Admin notify failed:', err.message || err);
          }
        }

        twiml.message(`✅ Report received. Your reference ID: ${report._id}\nUse: STATUS ${report._id}`);
      }

      // STATUS command
      else if (cmd === 'STATUS') {
        const id = words[1];
        if (!id) {
          twiml.message('Usage: STATUS <report id>');
        } else {
          const r = await Report.findById(id).lean();
          if (!r) {
            twiml.message(`No report found with id ${id}`);
          } else {
            let reply = `Report ID: ${r._id}\nStatus: ${r.status}\nCategory: ${r.category}\nReceived: ${new Date(r.createdAt).toLocaleString()}\nDescription: ${r.description}`;
            if (r.media && r.media.length) reply += '\nMedia attached (viewable to admin).';
            twiml.message(reply);
          }
        }
      }

      // CONTACT command
      else if (cmd === 'CONTACT') {
        twiml.message([
          'Cyber Safety Tips:',
          '- Do not share OTPs or passwords.',
          '- Preserve screenshots and transaction details.',
          '- For emergencies, call local police.',
        ].join('\n'));
      }

      // No recognized command → handle image-only or unknown
      else {
        if (numMedia > 0) {
          const media = [];
          for (let i = 0; i < numMedia; i++) {
            const url = req.body[`MediaUrl${i}`];
            const contentType = req.body[`MediaContentType${i}`];
            if (url) media.push({ url, contentType });
          }

          const category = await classifyText('(image only)');
          const report = await Report.create({ from, description: '(image only)', media, category });

          if (process.env.ADMIN_WHATSAPP) {
            try {
              await twilioClient.messages.create({
                from: process.env.TWILIO_WHATSAPP_FROM,
                to: process.env.ADMIN_WHATSAPP,
                body: `New image report ${report._id}\nFrom: ${from}`,
              });
            } catch (nerr) {
              console.warn('Admin notify failed:', nerr.message);
            }
          }

          twiml.message(`✅ Image received. Report ID: ${report._id}`);
        } else {
          twiml.message(`Sorry, I didn't understand "${incoming}". Send HELP for commands.`);
        }
      }
    } catch (err) {
      console.error('Webhook processing failed:', err);
      twiml.message('Server error. Please try again later.');
    }

    res.type('text/xml').send(twiml.toString());
  });

  // =========================
  // Start Server
  // =========================
  app.listen(PORT, () => {
    console.log(`🚀 Backend listening on port ${PORT}`);
  });
})();
