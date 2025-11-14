// Enhanced webhook handler with professional formatting
const { uploadImageFromUrl } = require('./cloudinary');
const { getAIResponse, getCyberAwareness, categorizeReport } = require('./geminiAI');
const whatsappService = require('./whatsappService');

// Business categories mapping
const businessCategories = {
  '1': 'E-Commerce',
  '2': 'Banking',
  '3': 'Social Media',
  '4': 'Investment',
  '5': 'Job Portal',
  '6': 'Real Estate',
  '7': 'Education',
  '8': 'Healthcare',
  '9': 'Other'
};

// Awareness topics mapping  
const awarenessTopics = {
  '1': 'Phishing',
  '2': 'Online Fraud',
  '3': 'Identity Theft',
  '4': 'Cyberbullying',
  '5': 'Ransomware',
  '6': 'Social Media Safety',
  '7': 'Password Security',
  '8': 'Two-Factor Authentication',
  '9': 'Data Privacy'
};

async function handleWebhook(req, res, Report, twilioClient) {
  const incomingRaw = (req.body.Body || '').trim();
  const incoming = incomingRaw;
  const from = req.body.From || 'unknown';
  const numMedia = parseInt(req.body.NumMedia || '0', 10);

  console.log('🔄 Processing message:', { incoming, from, numMedia });

  const Twilio = require('twilio');
  const MessagingResponse = Twilio.twiml.MessagingResponse;
  const twiml = new MessagingResponse();

  // Get user session
  const userSessions = global.userSessions || new Map();
  const session = userSessions.get(from) || {};

  try {
    // Handle greetings - Show professional menu
    const greetings = ['hi', 'hello', 'hey', 'hola', 'namaste', 'start'];
    if (greetings.includes(incoming.toLowerCase()) || (!incoming && numMedia === 0)) {
      console.log('✅ Sending interactive menu to:', from);
      await whatsappService.sendInteractiveMenu(from, process.env.TWILIO_WHATSAPP_FROM, twilioClient);
      return res.status(200).send('');
    }

    const words = incoming.split(/\s+/);
    const cmd = words[0].toUpperCase();

    // MENU command
    if (cmd === 'MENU') {
      await whatsappService.sendInteractiveMenu(from, process.env.TWILIO_WHATSAPP_FROM, twilioClient);
      return res.status(200).send('');
    }

    // HELP command
    if (cmd === 'HELP' || incoming === '6') {
      const helpMsg = `⬛ CYBERCRIME HELP SERVICE COMMANDS

━━━━━━━━━━━━━━━━━━━━━
⬛ AVAILABLE COMMANDS

⿡ REPORT <description>
   File a cyber crime report
   Example: REPORT Phishing email received

⿢ STATUS <report-id>
   Check your report status
   Example: STATUS CYB000123

⿣ AWARENESS <topic>
   Get cyber safety information
   Example: AWARENESS Phishing

⿤ CHAT <message>
   Talk to AI assistant
   Example: CHAT How to stay safe?

⿥ CONTACT
   Emergency contact information

⿦ MENU
   Show main menu

━━━━━━━━━━━━━━━━━━━━━
Reply with command or number (1-6)`;
      
      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: from,
        body: helpMsg
      });
      return res.status(200).send('');
    }

    // REPORT command - Enhanced with business category selection
    else if (cmd === 'REPORT' || incoming === '1') {
      if (incoming === '1') {
        // Ask for business category first
        session.step = 'SELECT_CATEGORY';
        userSessions.set(from, session);
        await whatsappService.sendBusinessCategories(from, process.env.TWILIO_WHATSAPP_FROM, twilioClient);
        return res.status(200).send('');
      } else {
        const desc = incoming.slice(6).trim() || '(no description provided)';
        const media = [];

        // Collect attached media and upload to Cloudinary
        for (let i = 0; i < numMedia; i++) {
          const url = req.body[`MediaUrl${i}`];
          const contentType = req.body[`MediaContentType${i}`];
          if (url) {
            try {
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

        // Save report to DB
        const report = await Report.create({ 
          from, 
          description: desc, 
          media, 
          category,
          subCategory: session.businessCategory || null,
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

        // Clear session
        userSessions.delete(from);

        // Notify Admin
        if (process.env.ADMIN_WHATSAPP) {
          try {
            await whatsappService.sendAdminNotification(
              process.env.ADMIN_WHATSAPP,
              process.env.TWILIO_WHATSAPP_FROM,
              twilioClient,
              report
            );
          } catch (err) {
            console.warn('Admin notify failed:', err.message);
          }
        }

        // Send confirmation to user
        await whatsappService.sendReportConfirmation(
          from,
          process.env.TWILIO_WHATSAPP_FROM,
          twilioClient,
          report
        );
        
        return res.status(200).send('');
      }
    }

    // Handle business category selection
    else if (session.step === 'SELECT_CATEGORY') {
      const categoryNum = incoming.trim();
      const selectedCategory = businessCategories[categoryNum] || incoming.toUpperCase();
      
      session.businessCategory = selectedCategory;
      session.step = 'REPORT_DESCRIPTION';
      userSessions.set(from, session);

      const msg = `⬛ Business Category Selected: ${selectedCategory}

━━━━━━━━━━━━━━━━━━━━━
⬛ FILE YOUR REPORT

Please provide details:
REPORT <your description>

You can also attach images/screenshots as evidence.

━━━━━━━━━━━━━━━━━━━━━
Example:
REPORT I received a fake payment link on WhatsApp claiming to be from Amazon`;

      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: from,
        body: msg
      });
      return res.status(200).send('');
    }

    // STATUS command - Support custom report IDs
    else if (cmd === 'STATUS' || incoming === '2') {
      if (incoming === '2') {
        const msg = `⬛ CHECK REPORT STATUS

━━━━━━━━━━━━━━━━━━━━━
Usage: STATUS <report-id>

Example: STATUS CYB000123

━━━━━━━━━━━━━━━━━━━━━
Your report ID was provided when you filed the report.`;
        
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: from,
          body: msg
        });
        return res.status(200).send('');
      } else {
        const id = words[1];
        if (!id) {
          await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: from,
            body: `⬛ Please provide report ID\n\n━━━━━━━━━━━━━━━━━━━━━\nUsage: STATUS <report-id>\nExample: STATUS CYB000123`
          });
          return res.status(200).send('');
        } else {
          // Search by reportId or _id
          const r = await Report.findOne({ $or: [{ reportId: id.toUpperCase() }, { _id: id }] }).lean();
          if (!r) {
            await twilioClient.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: from,
              body: `⬛ Report Not Found\n\n━━━━━━━━━━━━━━━━━━━━━\nNo report found with ID: ${id}\n\nPlease verify the ID and try again.`
            });
            return res.status(200).send('');
          } else {
            const statusMsg = whatsappService.formatStatusMessage(r);
            await twilioClient.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: from,
              body: statusMsg
            });
            return res.status(200).send('');
          }
        }
      }
    }

    // AWARENESS command
    else if (cmd === 'AWARENESS' || incoming === '3') {
      if (incoming === '3' || words.length === 1) {
        await whatsappService.sendAwarenessMenu(from, process.env.TWILIO_WHATSAPP_FROM, twilioClient);
        return res.status(200).send('');
      } else {
        const topicNum = words[1];
        const topic = awarenessTopics[topicNum] || incoming.slice(9).trim();
        
        try {
          const info = await getCyberAwareness(topic);
          const msg = `⬛ ${topic.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━
${info}

━━━━━━━━━━━━━━━━━━━━━
⬛ Stay informed. Stay safe.`;
          
          await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: from,
            body: msg
          });
          return res.status(200).send('');
        } catch (err) {
          await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: from,
            body: `⬛ Unable to fetch information\n\n━━━━━━━━━━━━━━━━━━━━━\nPlease try again later or contact support.`
          });
          return res.status(200).send('');
        }
      }
    }

    // CHAT command - AI Assistant
    else if (cmd === 'CHAT' || incoming === '4') {
      if (incoming === '4') {
        const msg = `⬛ AI ASSISTANT

━━━━━━━━━━━━━━━━━━━━━
⬛ ASK ME ANYTHING ABOUT

▸ Cyber safety and security
▸ How to protect yourself online
▸ What to do if you're a victim
▸ Prevention and safety tips
▸ Understanding cyber threats

━━━━━━━━━━━━━━━━━━━━━
Usage: CHAT <your question>

Example: CHAT How do I create strong passwords?`;
        
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: from,
          body: msg
        });
        return res.status(200).send('');
      } else {
        const userMsg = incoming.slice(4).trim();
        
        if (!userMsg) {
          await twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: from,
            body: `⬛ Please provide your question\n\n━━━━━━━━━━━━━━━━━━━━━\nUsage: CHAT <question>\nExample: CHAT What is phishing?`
          });
          return res.status(200).send('');
        } else {
          try {
            const aiResponse = await getAIResponse(userMsg);
            const msg = `⬛ AI ASSISTANT RESPONSE

━━━━━━━━━━━━━━━━━━━━━
${aiResponse}

━━━━━━━━━━━━━━━━━━━━━
⬛ Need more help? Just ask another question!`;
            
            await twilioClient.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: from,
              body: msg
            });
            return res.status(200).send('');
          } catch (err) {
            await twilioClient.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: from,
              body: `⬛ AI Assistant temporarily unavailable\n\n━━━━━━━━━━━━━━━━━━━━━\nPlease try again in a moment.`
            });
            return res.status(200).send('');
          }
        }
      }
    }

    // CONTACT command
    else if (cmd === 'CONTACT' || incoming === '5') {
      const msg = `⬛ EMERGENCY CONTACTS

━━━━━━━━━━━━━━━━━━━━━
⬛ CYBER CRIME HELPLINE

National Helpline: 1930 (India)
Website: cybercrime.gov.in
Email: complaints@cybercrime.gov.in

━━━━━━━━━━━━━━━━━━━━━
⬛ EMERGENCY SERVICES

Police Emergency: 100
Women Helpline: 1091
Child Helpline: 1098

━━━━━━━━━━━━━━━━━━━━━
⬛ SAFETY TIPS

▸ Never share OTPs or passwords
▸ Preserve all evidence (screenshots, emails)
▸ Report immediately
▸ Don't pay ransoms before consulting authorities
▸ Block suspicious accounts
▸ Enable two-factor authentication

━━━━━━━━━━━━━━━━━━━━━
⬛ Available 24/7 for assistance`;
      
      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: from,
        body: msg
      });
      return res.status(200).send('');
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
          await whatsappService.sendAdminNotification(
            process.env.ADMIN_WHATSAPP,
            process.env.TWILIO_WHATSAPP_FROM,
            twilioClient,
            report
          );
        } catch (nerr) {
          console.warn('Admin notify failed:', nerr.message);
        }
      }

      const msg = `⬛ Evidence Received

━━━━━━━━━━━━━━━━━━━━━
Report ID: ${report.reportId}
Files: ${media.length} image(s) uploaded

━━━━━━━━━━━━━━━━━━━━━
⬛ NEXT STEP

Please provide description:
REPORT <details about the incident>

Or check status:
STATUS ${report.reportId}

━━━━━━━━━━━━━━━━━━━━━`;

      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: from,
        body: msg
      });
      return res.status(200).send('');
    }

    // Unknown command
    else {
      const msg = `⬛ Command Not Recognized

━━━━━━━━━━━━━━━━━━━━━
I didn't understand: "${incoming}"

Send MENU to see all options
Send HELP for command list

━━━━━━━━━━━━━━━━━━━━━`;
      
      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: from,
        body: msg
      });
      return res.status(200).send('');
    }

  } catch (err) {
    console.error('Webhook processing failed:', err);
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: from,
      body: `⬛ System Error\n\n━━━━━━━━━━━━━━━━━━━━━\nTemporary issue occurred. Please try again in a moment.`
    }).catch(e => console.error('Failed to send error message:', e));
    return res.status(200).send('');
  }
}

module.exports = { handleWebhook };
