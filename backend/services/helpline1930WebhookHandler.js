// services/helpline1930WebhookHandler.js
const Complaint = require('../models/Complaint');
const { uploadImageFromUrl } = require('./cloudinary');
const helplineService = require('./helpline1930Service');

// Session management
global.helplineSessions = global.helplineSessions || new Map();

// Fraud type mappings
const financialFraudTypes = {
  '1': 'investment_trading_ipo',
  '2': 'customer_care',
  '3': 'upi_fraud',
  '4': 'apk_fraud',
  '5': 'fake_franchisee',
  '6': 'online_job',
  '7': 'debit_card',
  '8': 'credit_card',
  '9': 'ecommerce',
  '10': 'loan_app',
  '11': 'sextortion',
  '12': 'olx_fraud',
  '13': 'lottery',
  '14': 'hotel_booking',
  '15': 'gaming_app',
  '16': 'aeps_fraud',
  '17': 'tower_installation',
  '18': 'ewallet',
  '19': 'digital_arrest',
  '20': 'fake_website',
  '21': 'ticket_booking',
  '22': 'insurance_maturity',
  '23': 'others'
};

const socialMediaFraudTypes = {
  '1': 'facebook_impersonation',
  '2': 'facebook_fake_account',
  '3': 'facebook_hack',
  '4': 'facebook_obscene',
  '5': 'instagram_impersonation',
  '6': 'instagram_fake_account',
  '7': 'instagram_hack',
  '8': 'instagram_obscene',
  '9': 'x_impersonation',
  '10': 'x_fake_account',
  '11': 'x_hack',
  '12': 'x_obscene',
  '13': 'whatsapp_impersonation',
  '14': 'whatsapp_fake_account',
  '15': 'whatsapp_hack',
  '16': 'whatsapp_obscene',
  '17': 'telegram_impersonation',
  '18': 'telegram_fake_account',
  '19': 'telegram_hack',
  '20': 'telegram_obscene',
  '21': 'gmail_impersonation',
  '22': 'gmail_hack',
  '23': 'gmail_obscene',
  '24': 'fraud_call_sms'
};

const personalDetailsFields = [
  'name', 'fatherSpouseName', 'dateOfBirth', 'phone', 
  'email', 'gender', 'village', 'postOffice', 
  'policeStation', 'district', 'pinCode'
];

async function handleHelpline1930Webhook(req, res, twilioClient, from) {
  const incomingMessage = (req.body.Body || '').trim();
  const fromNumber = req.body.From || 'unknown';
  const numMedia = parseInt(req.body.NumMedia || '0', 10);

  console.log('🔵 1930 Helpline webhook:', { from: fromNumber, message: incomingMessage, numMedia });

  // Get or create session
  let session = global.helplineSessions.get(fromNumber);
  
  if (!session) {
    // New session - send welcome menu
    session = {
      step: 'welcome',
      data: {}
    };
    global.helplineSessions.set(fromNumber, session);
    
    await helplineService.sendWelcomeMenu(fromNumber, twilioClient, from);
    return res.status(200).send('');
  }

  try {
    const input = incomingMessage.toUpperCase();

    // Handle welcome menu selection
    if (session.step === 'welcome') {
      if (input === 'A') {
        session.step = 'ask_fraud_category';
        session.data.complaintType = 'new_complaint';
        await helplineService.askFraudCategory(fromNumber, twilioClient, from);
      } else if (input === 'B') {
        session.step = 'status_check_request';
        session.data.complaintType = 'status_check';
        await helplineService.requestStatusCheckDetails(fromNumber, twilioClient, from);
      } else if (input === 'C') {
        session.step = 'account_unfreeze_request';
        session.data.complaintType = 'account_unfreeze';
        await helplineService.requestAccountUnfreezeDetails(fromNumber, twilioClient, from);
      } else if (input === 'D') {
        session.step = 'other_query';
        session.data.complaintType = 'other_query';
        await twilioClient.messages.create({
          from: from,
          to: fromNumber,
          body: '📝 Please describe your query in detail. Our agent will contact you shortly.'
        });
        session.step = 'collect_personal_details';
        session.data.currentField = 0;
        await helplineService.requestPersonalDetails(fromNumber, twilioClient, from, personalDetailsFields[0]);
      } else {
        await helplineService.sendWelcomeMenu(fromNumber, twilioClient, from);
      }
      return res.status(200).send('');
    }

    // Handle fraud category selection
    if (session.step === 'ask_fraud_category') {
      if (input === '1') {
        session.data.fraudCategory = 'financial_fraud';
        session.step = 'select_financial_fraud_type';
        await helplineService.showFinancialFraudTypes(fromNumber, twilioClient, from);
      } else if (input === '2') {
        session.data.fraudCategory = 'social_media_fraud';
        session.step = 'select_social_media_fraud_type';
        await helplineService.showSocialMediaFraudTypes(fromNumber, twilioClient, from);
      } else {
        await helplineService.askFraudCategory(fromNumber, twilioClient, from);
      }
      return res.status(200).send('');
    }

    // Handle financial fraud type selection
    if (session.step === 'select_financial_fraud_type') {
      const fraudType = financialFraudTypes[input];
      if (fraudType) {
        session.data.financialFraudType = fraudType;
        session.step = 'collect_personal_details';
        session.data.currentField = 0;
        await helplineService.requestPersonalDetails(fromNumber, twilioClient, from, personalDetailsFields[0]);
      } else {
        await helplineService.showFinancialFraudTypes(fromNumber, twilioClient, from);
      }
      return res.status(200).send('');
    }

    // Handle social media fraud type selection
    if (session.step === 'select_social_media_fraud_type') {
      const fraudType = socialMediaFraudTypes[input];
      if (fraudType) {
        session.data.socialMediaFraudType = fraudType;
        
        // Provide platform-specific guidance first
        const platform = fraudType.split('_')[0]; // facebook, instagram, x, whatsapp, telegram, gmail, fraud
        if (platform !== 'fraud') {
          await helplineService.provideSocialMediaGuidance(fromNumber, twilioClient, from, platform);
        }
        
        session.step = 'collect_personal_details';
        session.data.currentField = 0;
        await helplineService.requestPersonalDetails(fromNumber, twilioClient, from, personalDetailsFields[0]);
      } else {
        await helplineService.showSocialMediaFraudTypes(fromNumber, twilioClient, from);
      }
      return res.status(200).send('');
    }

    // Collect personal details step by step
    if (session.step === 'collect_personal_details') {
      const currentField = personalDetailsFields[session.data.currentField];
      session.data[currentField] = incomingMessage;
      
      session.data.currentField++;
      
      if (session.data.currentField < personalDetailsFields.length) {
        // Ask next field
        await helplineService.requestPersonalDetails(
          fromNumber, 
          twilioClient, 
          from, 
          personalDetailsFields[session.data.currentField]
        );
      } else {
        // All personal details collected
        if (session.data.fraudCategory === 'financial_fraud') {
          session.step = 'request_documents';
          await helplineService.requestFinancialFraudDocuments(fromNumber, twilioClient, from);
        } else if (session.data.fraudCategory === 'social_media_fraud') {
          session.step = 'collect_documents';
          await twilioClient.messages.create({
            from: from,
            to: fromNumber,
            body: '📎 Please send the required documents as mentioned earlier.\n\nSend one document at a time.\nType *DONE* when finished.'
          });
        } else {
          // For status check, account unfreeze, other queries
          await saveAndConfirmComplaint(fromNumber, session, twilioClient, from);
        }
      }
      return res.status(200).send('');
    }

    // Handle document upload
    if (session.step === 'request_documents' || session.step === 'collect_documents') {
      if (numMedia > 0) {
        // Upload document
        if (!session.data.documents) session.data.documents = [];
        
        for (let i = 0; i < numMedia; i++) {
          const mediaUrl = req.body[`MediaUrl${i}`];
          const contentType = req.body[`MediaContentType${i}`];
          
          try {
            const cloudinaryUrl = await uploadImageFromUrl(mediaUrl);
            session.data.documents.push({
              type: 'other',
              url: cloudinaryUrl,
              contentType: contentType
            });
          } catch (err) {
            console.error('Upload failed:', err);
            session.data.documents.push({
              type: 'other',
              url: mediaUrl,
              contentType: contentType
            });
          }
        }
        
        await twilioClient.messages.create({
          from: from,
          to: fromNumber,
          body: `✅ Document received (${session.data.documents.length} total)\n\nSend more documents or type *DONE* to submit complaint.`
        });
      } else if (input === 'DONE' || input === 'SUBMIT') {
        await saveAndConfirmComplaint(fromNumber, session, twilioClient, from);
      } else if (input === 'SKIP' || input === 'NEXT') {
        await twilioClient.messages.create({
          from: from,
          to: fromNumber,
          body: 'Send next document or type *DONE* to submit.'
        });
      }
      return res.status(200).send('');
    }

    // Handle status check
    if (session.step === 'status_check_request') {
      const ticketOrPhone = incomingMessage.trim();
      
      // Search by ticket number or phone
      const complaint = await Complaint.findOne({
        $or: [
          { ticketNumber: ticketOrPhone.toUpperCase() },
          { phone: ticketOrPhone },
          { whatsappNumber: fromNumber }
        ]
      }).sort({ createdAt: -1 });

      if (complaint) {
        await helplineService.sendComplaintStatus(fromNumber, twilioClient, from, complaint);
      } else {
        await twilioClient.messages.create({
          from: from,
          to: fromNumber,
          body: `❌ No complaint found with ticket number or phone: ${ticketOrPhone}\n\nPlease verify and try again.`
        });
      }
      
      // Reset session
      global.helplineSessions.delete(fromNumber);
      return res.status(200).send('');
    }

    // Handle account unfreeze
    if (session.step === 'account_unfreeze_request') {
      // Parse account details
      const lines = incomingMessage.split('\n');
      session.data.accountNumber = lines[0]?.replace(/account:|Account:/i, '').trim();
      session.data.bankName = lines[1]?.replace(/bank:|Bank:/i, '').trim();
      session.data.ifscCode = lines[2]?.replace(/ifsc:|IFSC:/i, '').trim();
      
      session.step = 'collect_personal_details';
      session.data.currentField = 0;
      await helplineService.requestPersonalDetails(fromNumber, twilioClient, from, personalDetailsFields[0]);
      return res.status(200).send('');
    }

  } catch (error) {
    console.error('❌ Error in 1930 webhook:', error);
    await twilioClient.messages.create({
      from: from,
      to: fromNumber,
      body: '⚠️ System error occurred. Please try again or contact support.'
    });
  }

  return res.status(200).send('');
}

// Save complaint and send confirmation
async function saveAndConfirmComplaint(fromNumber, session, twilioClient, from) {
  try {
    const complaintData = {
      whatsappNumber: fromNumber,
      complaintType: session.data.complaintType,
      fraudCategory: session.data.fraudCategory,
      financialFraudType: session.data.financialFraudType,
      socialMediaFraudType: session.data.socialMediaFraudType,
      
      // Personal details
      name: session.data.name,
      fatherSpouseName: session.data.fatherSpouseName,
      dateOfBirth: session.data.dateOfBirth,
      phone: session.data.phone,
      email: session.data.email,
      gender: session.data.gender,
      village: session.data.village,
      postOffice: session.data.postOffice,
      policeStation: session.data.policeStation,
      district: session.data.district,
      pinCode: session.data.pinCode,
      
      // Documents
      documents: session.data.documents || [],
      
      // For account unfreeze
      accountNumber: session.data.accountNumber,
      bankName: session.data.bankName,
      ifscCode: session.data.ifscCode,
      
      // Timeline
      timeline: [{
        action: 'Complaint Registered',
        description: 'Complaint filed via WhatsApp',
        performedBy: 'user',
        timestamp: new Date()
      }],
      
      chatHistory: [{
        from: 'user',
        message: 'Complaint submitted via WhatsApp Bot',
        timestamp: new Date()
      }]
    };

    const complaint = await Complaint.create(complaintData);
    
    // Send confirmation to user
    await helplineService.sendComplaintConfirmation(
      fromNumber, 
      twilioClient, 
      from, 
      complaint.ticketNumber
    );
    
    // Notify admin if configured
    if (process.env.ADMIN_WHATSAPP) {
      await helplineService.notifyAdmin(
        process.env.ADMIN_WHATSAPP,
        twilioClient,
        from,
        complaint
      );
    }
    
    // Clear session
    global.helplineSessions.delete(fromNumber);
    
  } catch (error) {
    console.error('❌ Error saving complaint:', error);
    throw error;
  }
}

module.exports = { handleHelpline1930Webhook };
