// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Twilio = require('twilio');
const mongoose = require('mongoose');
const connectDB = require('./db');
const Report = require('./models/Report');
const { categorizeReport, getCyberAwareness } = require('./services/geminiAI'); // if available

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Twilio sends x-www-form-urlencoded
app.use(bodyParser.json());

global.userSessions = new Map(); // in-memory session store (simple)

const PORT = process.env.PORT || 3001;
const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

// ---------- Helper: find report by id ----------
async function findReportById(id) {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
  if (isValidObjectId) {
    return Report.findOne({ $or: [{ _id: id }, { reportId: id }] });
  } else {
    return Report.findOne({ reportId: id });
  }
}

// ---------- Utility: send message (safe wrapper) ----------
async function sendMessage(toWhatsApp, payload) {
  // toWhatsApp should be like 'whatsapp:+91xxxxxxxxxx'
  try {
    console.log('📤 Sending message to:', toWhatsApp);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const msg = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: toWhatsApp,
      ...payload
    });
    
    console.log('✅ Message sent successfully! SID:', msg.sid);
    return msg;
  } catch (err) {
    console.error('❌ Twilio send error:', err && err.message ? err.message : err);
    console.error('❌ Full error:', err);
    throw err;
  }
}

// ---------- Compose interactive menu (buttons) ----------
async function sendInteractiveMenu(toWhatsApp) {
  // Send simple plain text menu that works reliably
  const plainBody = `⬛ Hello! Welcome to CyberCrime Help Service.

━━━━━━━━━━━━━━━━━━━━━
⬛ How can we assist you today?

⿡ REPORT - File a cyber crime report
⿢ STATUS - Check report status
⿣ AWARENESS - Cyber safety tips
⿤ CHAT - Talk to AI assistant
⿥ CONTACT - Emergency contacts
⿦ HELP - View all commands

━━━━━━━━━━━━━━━━━━━━━
Reply with a number (1-6) or command to continue.`;

  try {
    console.log('📤 Sending plain text menu...');
    return await sendMessage(toWhatsApp, { body: plainBody });
  } catch (err) {
    console.error('❌ Failed to send menu:', err.message);
    // Fallback to even simpler message
    return await sendMessage(toWhatsApp, { 
      body: 'Welcome! Reply with:\n1 - File Report\n2 - Check Status\n3 - Get Help' 
    });
  }
}

// ---------- Start DB and server ----------
(async () => {
  try {
    await connectDB();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }

  // Health
  app.get('/public/health', (req, res) => res.json({ ok: true, service: 'Cyber Crime Support Bot' }));

  // Webhook for incoming WhatsApp messages
  app.post('/webhook', async (req, res) => {
    // Twilio sends "From" like "whatsapp:+9199..." and "Body" with text.
    const from = req.body.From; // e.g., 'whatsapp:+919876543210'
    const rawBody = (req.body.Body || '').trim();
    const incomingText = rawBody.toLowerCase();
    console.log('🔔 Incoming webhook:', { from, rawBody, bodyKeys: Object.keys(req.body) });

    // Initialize session if new
    if (!global.userSessions.has(from)) {
      // create session template with reporting step flow
      const session = {
        stage: 'menu_shown', // we've shown menu
        // For reporting flow we will keep stepIndex and answers
        flow: null // will be set after user chooses an option
      };
      global.userSessions.set(from, session);

      // Send interactive menu (buttons)
      try {
        await sendInteractiveMenu(from);
        return res.status(200).send('menu sent');
      } catch (err) {
        console.error('Failed to send initial menu', err);
        // still respond ok to Twilio
        return res.status(200).send('ok');
      }
    }

    // If session exists, handle the reply
    const session = global.userSessions.get(from);

    // Detect interactive reply ID/title if present (Twilio often sends the chosen label as Body)
    // So if user pressed a button titled "Report Cybercrime", incomingText will contain that.
    // We'll accept both the button titles and simple keywords.
    // Normalize detection:
    const chosen =
      incomingText.includes('report') ? 'report' :
      incomingText.includes('track') ? 'track' :
      incomingText.includes('help') || incomingText.includes('info') || incomingText.includes('awareness') ? 'awareness' :
      null;

    // If stage is 'menu_shown' and user has chosen an option -> initialize appropriate flow
    if (session.stage === 'menu_shown') {
      // If user typed the option name or pressed button
      if (chosen === 'report') {
        // Start report flow: ask line-by-line
        session.flow = {
          name: 'report',
          stepIndex: 0,
          answers: {}
        };
        session.stage = 'in_flow';
        // Define the steps/questions sequence for reporting
        session.flow.steps = [
          { key: 'crimeType', question: '📝 Please tell the *Type of cybercrime* (e.g., phishing, fraud, harassment, hacking).' },
          { key: 'description', question: '📝 Now describe the incident briefly. Include what happened and how.' },
          { key: 'datetime', question: '📅 When did it happen? (date and time or approximate)' },
          { key: 'evidence', question: '📎 Do you have any evidence (screenshots, links, files)? If yes, please send them now or type "none".' },
          { key: 'confirm', question: '✅ Do you want to submit this report now? Reply with *Yes* to submit or *No* to cancel.' }
        ];

        // Ask first question
        const q = session.flow.steps[session.flow.stepIndex].question;
        await sendMessage(from, { body: q });
        return res.status(200).send('asked crimeType');
      }

      if (chosen === 'track') {
        session.stage = 'tracking';
        await sendMessage(from, { body: '🔍 Please send your *Report ID* (for example: CYB000001) to check status.' });
        return res.status(200).send('asked report id');
      }

      if (chosen === 'awareness') {
        session.stage = 'awareness';
        // If you have a service to get tips, use it; fallback to static tips
        let tips = '1) Do not share OTP/passwords.\n2) Verify links before clicking.\n3) Use strong unique passwords.\n4) Report phishing to relevant portals.';
        try {
          if (typeof getCyberAwareness === 'function') {
            const aiTips = await getCyberAwareness();
            if (aiTips) tips = aiTips;
          }
        } catch (e) {
          console.warn('getCyberAwareness error:', e.message || e);
        }
        await sendMessage(from, { body: `🧠 *Cyber Awareness Tips*\n\n${tips}\n\nIf you want more help, type *menu* to see options again.` });
        // keep session at menu_shown so user can continue
        session.stage = 'menu_shown';
        return res.status(200).send('sent tips');
      }

      // If no recognized choice, prompt to use button or type the option name
      await sendMessage(from, { body: '⚠️ Please choose one of the options by tapping the buttons or by typing: "Report Cybercrime", "Track My Report", or "Help & Info".' });
      return res.status(200).send('asked to choose proper option');
    }

    // ---------- Tracking flow ----------
    if (session.stage === 'tracking') {
      const candidateId = rawBody.trim().toUpperCase();
      try {
        const report = await findReportById(candidateId);
        if (!report) {
          await sendMessage(from, { body: `❌ No report found with ID: *${candidateId}*. Please recheck the ID.` });
          return res.status(200).send('report not found');
        }
        const latestNote = (report.notes && report.notes.length) ? report.notes[report.notes.length - 1].content : 'No updates available';
        await sendMessage(from, {
          body: `✅ Report Found\n\n🆔 Report ID: ${report.reportId || report._id}\n📅 Created: ${report.createdAt}\n📌 Status: ${report.status}\n🗒️ Latest note: ${latestNote}`
        });
        session.stage = 'menu_shown'; // back to menu
        return res.status(200).send('sent report status');
      } catch (err) {
        console.error('Error finding report:', err);
        await sendMessage(from, { body: '❌ Error fetching report. Please try again later.' });
        return res.status(200).send('error');
      }
    }

    // ---------- In-flow (reporting) processing ----------
    if (session.stage === 'in_flow' && session.flow && session.flow.name === 'report') {
      const stepIndex = session.flow.stepIndex;
      const currentStep = session.flow.steps[stepIndex];

      // Save the user's response for current step
      const answer = rawBody || ''; // text user sent or "none"
      session.flow.answers[currentStep.key] = answer;

      // Advance to next step
      session.flow.stepIndex = stepIndex + 1;

      // If there is a next step, ask it
      if (session.flow.stepIndex < session.flow.steps.length) {
        const nextQ = session.flow.steps[session.flow.stepIndex].question;
        await sendMessage(from, { body: nextQ });
        return res.status(200).send(`asked step ${session.flow.stepIndex}`);
      }

      // If we've reached confirm step (last), process submit if user confirmed
      const confirmation = (session.flow.answers.confirm || '').toLowerCase();
      if (confirmation === 'yes' || confirmation === 'y') {
        // Prepare report object to save
        try {
          const newReportData = {
            from,
            description: session.flow.answers.description || 'No description provided',
            category: session.flow.answers.crimeType || 'Unspecified',
            occurredAt: session.flow.answers.datetime || null,
            evidence: session.flow.answers.evidence || null,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // If you have a Report.create method
          const created = await Report.create(newReportData);

          await sendMessage(from, {
            body: `✅ Your report has been submitted successfully.\n\n🆔 Report ID: ${created.reportId || created._id}\nWe will review and contact you shortly.\n\nType "menu" to see options again.`
          });

          // Reset session to menu
          session.stage = 'menu_shown';
          session.flow = null;
          return res.status(200).send('report submitted');
        } catch (err) {
          console.error('Error saving report:', err);
          await sendMessage(from, { body: '❌ Failed to submit your report. Please try again later.' });
          // keep session at menu or let user retry
          session.stage = 'menu_shown';
          session.flow = null;
          return res.status(200).send('save error');
        }
      } else {
        // If user said No or anything else, cancel
        await sendMessage(from, { body: '❌ Your report was not submitted. If you want to start over, tap "Report Cybercrime" again or type "Report".' });
        session.stage = 'menu_shown';
        session.flow = null;
        return res.status(200).send('report cancelled');
      }
    }

    // ---------- Fallbacks & helper commands ----------
    if (incomingText === 'menu' || incomingText === 'start') {
      // Re-send menu
      await sendInteractiveMenu(from);
      session.stage = 'menu_shown';
      session.flow = null;
      return res.status(200).send('menu resent');
    }

    // If none matched: send guidance
    await sendMessage(from, { body: 'Sorry, I did not understand. Type "menu" to see options or tap a button if shown. For immediate help call 1930.' });
    return res.status(200).send('fallback handled');
  });

  // Simple admin endpoint (list reports)
  app.get('/api/reports', async (req, res) => {
    try {
      const reports = await Report.find().sort({ createdAt: -1 }).lean();
      res.json({ ok: true, count: reports.length, reports });
    } catch (err) {
      console.error('Error fetching reports', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Start
  app.listen(PORT, () => console.log(`🚀 Cyber Crime Bot listening on ${PORT}`));
})();
