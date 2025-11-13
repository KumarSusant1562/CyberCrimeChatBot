// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const Report = require('./models/Report');
const cors = require('cors');
const path = require('path');
const Twilio = require('twilio');
const multer = require('multer');
const { classifyText } = require('./services/classifier');
const { uploadImageFromUrl } = require('./services/cloudinary');
const { getAIResponse, getCyberAwareness, categorizeReport } = require('./services/geminiAI');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

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
      const { status, note } = req.body;
      const report = await Report.findById(req.params.id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Update status
      if (status) {
        report.status = status;
        report.timeline.push({
          action: 'Status Updated',
          description: `Status changed to: ${status}`,
          performedBy: 'admin',
          timestamp: new Date()
        });

        // Send WhatsApp notification to user
        try {
          await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: report.from,
            body: `📋 Update on your report (${report._id})\n\n✅ Status: ${status}\n\nReply with STATUS ${report._id} for full details.`
          });
        } catch (err) {
          console.warn('Failed to notify user:', err.message);
        }
      }

      // Add note if provided
      if (note) {
        report.notes.push({
          content: note,
          addedBy: 'admin',
          addedAt: new Date()
        });
        report.timeline.push({
          action: 'Note Added',
          description: 'Admin added a note',
          performedBy: 'admin',
          timestamp: new Date()
        });

        // Send note to user via WhatsApp
        try {
          await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: report.from,
            body: `📝 Message from CyberCrime Support (Report: ${report._id}):\n\n${note}`
          });
        } catch (err) {
          console.warn('Failed to send note to user:', err.message);
        }
      }

      report.updatedAt = new Date();
      await report.save();
      
      res.json({ ok: true, report });
    } catch (err) {
      console.error('Error updating report:', err);
      res.status(500).json({ error: 'Failed to update report' });
    }
  });

  // Add admin note to report
  app.post('/api/reports/:id/notes', async (req, res) => {
    try {
      const { note } = req.body;
      const report = await Report.findById(req.params.id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      report.notes.push({
        content: note,
        addedBy: 'admin',
        addedAt: new Date()
      });

      report.timeline.push({
        action: 'Note Added',
        description: 'Admin added a note',
        performedBy: 'admin',
        timestamp: new Date()
      });

      // Send to WhatsApp
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: report.from,
          body: `📝 Message from CyberCrime Support (Report: ${report._id}):\n\n${note}`
        });
      } catch (err) {
        console.warn('Failed to send note to user:', err.message);
      }

      await report.save();
      res.json({ ok: true, report });
    } catch (err) {
      console.error('Error adding note:', err);
      res.status(500).json({ error: 'Failed to add note' });
    }
  });

  // Send image to user via WhatsApp
  app.post('/api/reports/:id/send-image', upload.single('image'), async (req, res) => {
    try {
      const report = await Report.findById(req.params.id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const imageUrl = req.body.imageUrl; // Admin provides image URL
      const message = req.body.message || 'Please review this image from our team.';

      // Send to WhatsApp
      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: report.from,
        body: `📷 CyberCrime Support (Report: ${report._id}):\n\n${message}`,
        mediaUrl: [imageUrl]
      });

      report.timeline.push({
        action: 'Image Sent',
        description: 'Admin sent an image to user',
        performedBy: 'admin',
        timestamp: new Date()
      });

      await report.save();
      res.json({ ok: true });
    } catch (err) {
      console.error('Error sending image:', err);
      res.status(500).json({ error: 'Failed to send image' });
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
      // Initial greeting
      if (!incoming && numMedia === 0) {
        twiml.message('👋 Welcome to CyberCrime Help Service!\n\nSend HELP to see available commands.');
        return res.type('text/xml').send(twiml.toString());
      }

      // Handle greetings with automated options
      const greetings = ['hi', 'hello', 'hey', 'hola', 'namaste'];
      if (greetings.includes(incoming.toLowerCase())) {
        const welcomeMsg = `👋 Hello! Welcome to CyberCrime Help Service.

📋 How can we assist you today?

1️⃣ REPORT - File a cyber crime report
2️⃣ STATUS <ID> - Check report status
3️⃣ AWARENESS - Cyber safety tips
4️⃣ CHAT - Talk to AI assistant
5️⃣ CONTACT - Emergency contacts
6️⃣ HELP - View all commands

Reply with a number or command to continue.`;
        
        twiml.message(welcomeMsg);
        return res.type('text/xml').send(twiml.toString());
      }

      const words = incoming.split(/\s+/);
      const cmd = words[0].toUpperCase();

      // HELP command
      if (cmd === 'HELP' || incoming === '6') {
        twiml.message(`🆘 CyberCrime Help Service Commands:

📝 REPORT <description> - File a report (attach images)
📊 STATUS <report-id> - Check report status
📚 AWARENESS <topic> - Get cyber safety info
💬 CHAT <message> - Talk to AI assistant
📞 CONTACT - Emergency contacts
🔄 MENU - Show main menu

Example: REPORT I received a phishing email`);
      }

      // Main menu (option 6 or MENU)
      else if (cmd === 'MENU') {
        const menuMsg = `📋 Main Menu:

1️⃣ REPORT - File a cyber crime report
2️⃣ STATUS - Check report status
3️⃣ AWARENESS - Cyber safety tips
4️⃣ CHAT - AI assistant
5️⃣ CONTACT - Emergency contacts
6️⃣ HELP - All commands`;
        
        twiml.message(menuMsg);
      }

      // REPORT command (option 1)
      else if (cmd === 'REPORT' || incoming === '1') {
        if (incoming === '1') {
          twiml.message('📝 To file a report, send:\nREPORT <your description>\n\nYou can also attach images.\n\nExample: REPORT I received a suspicious email asking for my bank details');
        } else {
          const desc = incoming.slice(6).trim() || '(no description provided)';
          const media = [];

          // Collect attached media and upload to Cloudinary
          for (let i = 0; i < numMedia; i++) {
            const url = req.body[`MediaUrl${i}`];
            const contentType = req.body[`MediaContentType${i}`];
            if (url) {
              try {
                // Upload to Cloudinary
                const cloudinaryUrl = await uploadImageFromUrl(url);
                media.push({ 
                  url: cloudinaryUrl, 
                  contentType,
                  uploadedAt: new Date()
                });
              } catch (err) {
                console.error('Cloudinary upload failed:', err);
                media.push({ url, contentType, uploadedAt: new Date() });
              }
            }
          }

          // Use Gemini AI for categorization
          let category = 'Uncategorized';
          try {
            category = await categorizeReport(desc);
          } catch (err) {
            console.error('Categorization failed:', err);
          }

          // Save report to DB with timeline
          const report = await Report.create({ 
            from, 
            description: desc, 
            media, 
            category,
            timeline: [{
              action: 'Report Created',
              description: 'User filed a new report',
              performedBy: 'user',
              timestamp: new Date()
            }],
            conversation: [{
              from: 'user',
              message: desc,
              timestamp: new Date()
            }]
          });

          // Notify Admin
          if (process.env.ADMIN_WHATSAPP) {
            try {
              let adminMsg = `🚨 NEW REPORT\n\nID: ${report._id}\nCategory: ${category}\nFrom: ${from}\n\nDescription: ${desc}`;
              
              if (media.length > 0) {
                adminMsg += `\n\n📷 ${media.length} image(s) attached`;
              }

              await twilioClient.messages.create({
                from: process.env.TWILIO_WHATSAPP_FROM,
                to: process.env.ADMIN_WHATSAPP,
                body: adminMsg,
              });
            } catch (err) {
              console.warn('Admin notify failed:', err.message);
            }
          }

          let userResponse = `✅ Report Received Successfully!\n\n📋 Reference ID: ${report._id}\n📂 Category: ${category}\n⏰ Received: ${new Date().toLocaleString()}\n\n`;
          
          if (media.length > 0) {
            userResponse += `📷 ${media.length} image(s) uploaded\n\n`;
          }
          
          userResponse += `Check status anytime:\nSTATUS ${report._id}\n\nOur team will review your report shortly.`;
          
          twiml.message(userResponse);
        }
      }

      // STATUS command (option 2)
      else if (cmd === 'STATUS' || incoming === '2') {
        if (incoming === '2') {
          twiml.message('📊 To check status, send:\nSTATUS <report-id>\n\nExample: STATUS 6756abc123def456');
        } else {
          const id = words[1];
          if (!id) {
            twiml.message('📊 Usage: STATUS <report-id>\n\nExample: STATUS 6756abc123def456');
          } else {
            const r = await Report.findById(id).lean();
            if (!r) {
              twiml.message(`❌ No report found with ID: ${id}\n\nPlease check the ID and try again.`);
            } else {
              let reply = `📊 REPORT STATUS\n\n`;
              reply += `🆔 ID: ${r._id}\n`;
              reply += `📂 Category: ${r.category}\n`;
              reply += `✅ Status: ${r.status}\n`;
              reply += `📅 Filed: ${new Date(r.createdAt).toLocaleString()}\n`;
              
              if (r.updatedAt) {
                reply += `🔄 Updated: ${new Date(r.updatedAt).toLocaleString()}\n`;
              }
              
              reply += `\n📝 Description:\n${r.description}\n`;
              
              if (r.media && r.media.length) {
                reply += `\n📷 ${r.media.length} image(s) attached`;
              }

              if (r.notes && r.notes.length > 0) {
                reply += `\n\n💬 Latest Update from Support:\n${r.notes[r.notes.length - 1].content}`;
              }
              
              twiml.message(reply);
            }
          }
        }
      }

      // AWARENESS command (option 3)
      else if (cmd === 'AWARENESS' || incoming === '3') {
        if (incoming === '3' || words.length === 1) {
          twiml.message(`📚 CYBER SAFETY AWARENESS

Choose a topic:
1. Phishing
2. Online Fraud
3. Identity Theft
4. Cyberbullying
5. Ransomware
6. Social Media Safety
7. Password Security

Reply: AWARENESS <topic>
Example: AWARENESS Phishing`);
        } else {
          const topic = incoming.slice(9).trim();
          try {
            const info = await getCyberAwareness(topic);
            twiml.message(`📚 ${topic.toUpperCase()}\n\n${info}\n\n💡 Stay safe online!`);
          } catch (err) {
            twiml.message('Unable to fetch information. Please try again later.');
          }
        }
      }

      // CHAT command (option 4) - AI Assistant
      else if (cmd === 'CHAT' || incoming === '4') {
        if (incoming === '4') {
          twiml.message(`💬 AI ASSISTANT

Ask me anything about:
- Cyber safety
- How to protect yourself online
- What to do if you're a victim
- Prevention tips

Example: CHAT How do I protect my passwords?`);
        } else {
          const userMsg = incoming.slice(4).trim();
          
          if (!userMsg) {
            twiml.message('💬 Usage: CHAT <your message>\n\nExample: CHAT How can I identify phishing emails?');
          } else {
            try {
              // Get AI response from Gemini
              const aiResponse = await getAIResponse(userMsg);
              twiml.message(`🤖 AI Assistant:\n\n${aiResponse}\n\n💬 Need more help? Just ask!`);
            } catch (err) {
              twiml.message('AI assistant is currently unavailable. Please try again later.');
            }
          }
        }
      }

      // CONTACT command (option 5)
      else if (cmd === 'CONTACT' || incoming === '5') {
        twiml.message(`📞 EMERGENCY CONTACTS

🚨 National Cyber Crime Helpline:
📱 1930 (India)
🌐 cybercrime.gov.in

⚠️ For immediate emergencies:
📞 Police: 100
🆘 Women Helpline: 1091

💡 SAFETY TIPS:
✓ Never share OTPs or passwords
✓ Preserve all evidence (screenshots, messages)
✓ Report immediately
✓ Don't pay ransoms without consulting police

Stay safe! 🛡️`);
      }

      // Handle image-only messages
      else if (numMedia > 0 && !incoming) {
        const media = [];
        for (let i = 0; i < numMedia; i++) {
          const url = req.body[`MediaUrl${i}`];
          const contentType = req.body[`MediaContentType${i}`];
          if (url) {
            try {
              const cloudinaryUrl = await uploadImageFromUrl(url);
              media.push({ url: cloudinaryUrl, contentType, uploadedAt: new Date() });
            } catch (err) {
              media.push({ url, contentType, uploadedAt: new Date() });
            }
          }
        }

        const category = await categorizeReport('(image evidence)');
        const report = await Report.create({ 
          from, 
          description: '(image evidence only)', 
          media, 
          category,
          timeline: [{
            action: 'Report Created',
            description: 'User submitted image evidence',
            performedBy: 'user',
            timestamp: new Date()
          }]
        });

        if (process.env.ADMIN_WHATSAPP) {
          try {
            await twilioClient.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: process.env.ADMIN_WHATSAPP,
              body: `🚨 NEW IMAGE REPORT\n\nID: ${report._id}\nFrom: ${from}\n${media.length} image(s)`,
            });
          } catch (nerr) {
            console.warn('Admin notify failed:', nerr.message);
          }
        }

        twiml.message(`✅ Image(s) Received!\n\n📋 Report ID: ${report._id}\n📷 ${media.length} image(s) uploaded\n\nPlease send a description:\nREPORT <description>\n\nOr check status:\nSTATUS ${report._id}`);
      }

      // Unknown command
      else {
        twiml.message(`❓ I didn't understand "${incoming}"\n\nSend MENU to see options or HELP for commands.`);
      }
    } catch (err) {
      console.error('Webhook processing failed:', err);
      twiml.message('⚠️ Server error. Please try again in a moment.');
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
