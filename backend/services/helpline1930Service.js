// services/helpline1930Service.js - WhatsApp messages for 1930 Cyber Crime Helpline

/**
 * Send welcome menu
 */
async function sendWelcomeMenu(to, twilioClient, from) {
  const message = `🚨 *Welcome to 1930 Cyber Helpline, Odisha* 🚨

Please select an option:

*A* - For New Complaint
*B* - For Status Check in Existing Complaint
*C* - For Account Unfreeze Related
*D* - Other Queries

Reply with *A*, *B*, *C*, or *D*`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Ask fraud category for new complaint
 */
async function askFraudCategory(to, twilioClient, from) {
  const message = `📋 *Select Complaint Category*

Is your complaint related to:

*1* - Financial Fraud
*2* - Social Media Fraud

Reply with *1* or *2*`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Show financial fraud types
 */
async function showFinancialFraudTypes(to, twilioClient, from) {
  const message = `💰 *Types of Financial Fraud*

Select the type that matches your case:

*1* - Investment/Trading/IPO Fraud
*2* - Customer Care Fraud
*3* - UPI Fraud (UPI/IMPS/INB/NEFT/RTGS)
*4* - APK Fraud
*5* - Fake Franchisee/Dealership Fraud
*6* - Online Job Fraud
*7* - Debit Card Fraud
*8* - Credit Card Fraud
*9* - E-Commerce Fraud
*10* - Loan App Fraud
*11* - Sextortion Fraud
*12* - OLX Fraud
*13* - Lottery Fraud
*14* - Hotel Booking Fraud
*15* - Gaming App Fraud
*16* - AEPS Fraud (Aadhar Enabled Payment)
*17* - Tower Installation Fraud
*18* - E-Wallet Fraud
*19* - Digital Arrest Fraud
*20* - Fake Website Scam Fraud
*21* - Ticket Booking Fraud
*22* - Insurance Maturity Fraud
*23* - Others

Reply with the number (1-23)`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Show social media fraud types
 */
async function showSocialMediaFraudTypes(to, twilioClient, from) {
  const message = `📱 *Type of Social Media Fraud*

Select the platform and issue:

*FACEBOOK*
*1* - Impersonation Account
*2* - Fake Account
*3* - Account Hacked
*4* - Obscene Content Spread

*INSTAGRAM*
*5* - Impersonation Account
*6* - Fake Account
*7* - Account Hacked
*8* - Obscene Content Spread

*X (Twitter)*
*9* - Impersonation Account
*10* - Fake Account
*11* - Account Hacked
*12* - Obscene Content Spread

*WHATSAPP*
*13* - Impersonation Account
*14* - Fake Account
*15* - Account Hacked
*16* - Obscene Content Spread

*TELEGRAM*
*17* - Impersonation Account
*18* - Fake Account
*19* - Account Hacked
*20* - Obscene Content Spread

*GMAIL/YOUTUBE*
*21* - Impersonation Account
*22* - Account Hacked
*23* - Obscene Content Spread

*24* - Fraud Call/SMS

Reply with the number (1-24)`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Request personal details
 */
async function requestPersonalDetails(to, twilioClient, from, field) {
  const messages = {
    name: '👤 Please provide your *Full Name*',
    fatherSpouseName: '👨‍👩‍👦 Please provide your *Father/Spouse/Guardian Name*',
    dateOfBirth: '📅 Please provide your *Date of Birth* (DD/MM/YYYY)',
    phone: '📱 Please provide your *Phone Number*',
    email: '📧 Please provide your *Email ID*',
    gender: '⚧ Please provide your *Gender* (Male/Female/Other)',
    village: '🏘️ Please provide your *Village* name',
    postOffice: '📮 Please provide your *Post Office* name',
    policeStation: '🚓 Please provide your *Police Station* name',
    district: '🏛️ Please provide your *District* name',
    pinCode: '📍 Please provide your *PIN Code*'
  };

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: messages[field] || 'Please provide the requested information'
  });
}

/**
 * Request documents for financial fraud
 */
async function requestFinancialFraudDocuments(to, twilioClient, from) {
  const message = `📎 *Please Submit the Following Documents*

Send the following as images/photos:

1️⃣ *Aadhar Card* / PAN Card
2️⃣ *Debit Card / Credit Card* photo (hide CVV)
3️⃣ *Bank Account* front page
4️⃣ *Bank Statement* highlighting fraudulent transactions with reference numbers
5️⃣ If statement not available: *Screenshot of debit messages* showing transaction reference number with date and time
6️⃣ *UPI Transactions Screenshot* showing UTR number with date and time
7️⃣ For Credit Card fraud: *Credit Card statement* or screenshots of spent message reference number
8️⃣ *Beneficiary account details* with amount and transaction reference number (if available)

*Send one document at a time*
After each upload, type *NEXT* to continue
Type *SKIP* if you don't have a particular document`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Provide platform-specific guidance for social media fraud
 */
async function provideSocialMediaGuidance(to, twilioClient, from, platform) {
  const guidance = {
    facebook: {
      message: `📘 *Facebook Fraud - Next Steps*

*Step 1:* Register complaint in Meta India Grievance Channel
🔗 https://help.meta.com/requests/1371776380779082/

*Step 2:* Prepare the following documents:
1️⃣ Request Letter
2️⃣ Aadhar Card / Any Govt. Issue ID
3️⃣ Disputed Screenshots
4️⃣ Alleged URL (page/profile link)
5️⃣ For Fake/Impersonation: Provide your original ID screenshot with URL

*Step 3:* Send all documents here after registering on Meta`
    },
    instagram: {
      message: `📷 *Instagram Fraud - Next Steps*

*Step 1:* Register complaint in Meta India Grievance Channel
🔗 https://help.meta.com/requests/1371776380779082/

*Step 2:* Prepare the following documents:
1️⃣ Request Letter
2️⃣ Aadhar Card / Any Govt. Issue ID
3️⃣ Disputed Screenshots
4️⃣ Alleged URL (profile link)
5️⃣ For Fake/Impersonation: Provide your original ID screenshot with URL

*Step 3:* Send all documents here after registering on Meta`
    },
    x: {
      message: `🐦 *X (Twitter) Fraud - Next Steps*

*Step 1:* Register complaint in X India Grievance Channel
🔗 https://help.x.com/en/forms/account-access

*Step 2:* Prepare the following documents:
1️⃣ Request Letter
2️⃣ Aadhar Card / Any Govt. Issue ID
3️⃣ Disputed Screenshots
4️⃣ Alleged URL (profile/tweet link)

*Step 3:* Send all documents here after registering on X`
    },
    whatsapp: {
      message: `💬 *WhatsApp Hacked - Immediate Action Required*

*Step 1:* Dial ##002# from your hacked number
This will remove call forwarding

*Step 2:* Register complaint in WhatsApp India Grievance Channel
🔗 https://www.whatsapp.com/contact/forms/1534459096974129

*Step 3:* Prepare the following documents:
1️⃣ Request Letter
2️⃣ Aadhar Card / Any Govt. Issue ID
3️⃣ Disputed Screenshots with the hacked number

*Step 4:* Send all documents here after registering with WhatsApp`
    },
    telegram: {
      message: `✈️ *Telegram Fraud - Next Steps*

*Step 1:* Register complaint in Telegram India Grievance Channel
🔗 https://telegram.org/support

*Step 2:* Prepare the following documents:
1️⃣ Request Letter
2️⃣ Aadhar Card / Any Govt. Issue ID
3️⃣ Disputed Screenshots with hacked number/ID

*Step 3:* Send all documents here after registering with Telegram`
    },
    gmail: {
      message: `📧 *Gmail/YouTube Hacked - Account Recovery*

*Step 1:* Visit Google Account Recovery
🔗 https://accounts.google.com/v3/signin/recoveryidentifier

*Step 2:* Follow the recovery process

*Step 3:* If unable to recover, submit:
1️⃣ Request Letter
2️⃣ Aadhar Card / Govt. ID
3️⃣ Screenshots of the issue

*Step 4:* Send all documents here`
    },
    fraud_call: {
      message: `📞 *Fraud Call/SMS - Report Now*

*Step 1:* Visit Sanchar Saathi Portal to report
🔗 https://www.sancharsaathi.gov.in/sfc/Home/sfc-complaint.jsp

*Step 2:* File your complaint on the portal

*Step 3:* Share the complaint number here for tracking

Our agent will call or message you shortly to assist further.`
    }
  };

  const msg = guidance[platform] || guidance.fraud_call;
  
  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: msg.message
  });
}

/**
 * Send complaint confirmation
 */
async function sendComplaintConfirmation(to, twilioClient, from, ticketNumber) {
  const message = `✅ *Complaint Registered Successfully*

━━━━━━━━━━━━━━━━━━━━━
🎫 *Ticket Number:* ${ticketNumber}

Your complaint has been registered with the 1930 Cyber Crime Helpline.

📋 *Next Steps:*
• Our caller agent will contact you shortly
• Keep your ticket number safe for tracking
• You will receive updates on WhatsApp

*To check status:* Reply with *B* and provide this ticket number

━━━━━━━━━━━━━━━━━━━━━
*Stay Safe Online!*`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Request status check details
 */
async function requestStatusCheckDetails(to, twilioClient, from) {
  const message = `🔍 *Check Complaint Status*

Please provide your:

*Acknowledgement/Ticket Number*
OR
*Mobile Number* used during registration

Example: 1930OD000123`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Send complaint status
 */
async function sendComplaintStatus(to, twilioClient, from, complaint) {
  const message = `📊 *Complaint Status*

━━━━━━━━━━━━━━━━━━━━━
🎫 *Ticket Number:* ${complaint.ticketNumber}
📋 *Status:* ${complaint.status}
📅 *Filed On:* ${new Date(complaint.createdAt).toLocaleDateString('en-IN')}
👤 *Name:* ${complaint.name}
📞 *Contact:* ${complaint.phone}

${complaint.fraudCategory === 'financial_fraud' ? `💰 *Type:* Financial Fraud` : ''}
${complaint.fraudCategory === 'social_media_fraud' ? `📱 *Type:* Social Media Fraud` : ''}

${complaint.adminNotes && complaint.adminNotes.length > 0 ? `
📝 *Latest Update:*
${complaint.adminNotes[complaint.adminNotes.length - 1].note}
` : ''}

━━━━━━━━━━━━━━━━━━━━━
Our team is working on your complaint.
You will be contacted shortly.`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Request account unfreeze details
 */
async function requestAccountUnfreezeDetails(to, twilioClient, from) {
  const message = `🏦 *Account Unfreeze Request*

Please provide:

1️⃣ *Account Number*
2️⃣ *Bank Name*
3️⃣ *IFSC Code*

Send them in this format:
Account: 1234567890
Bank: State Bank of India
IFSC: SBIN0001234`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Send admin notification
 */
async function notifyAdmin(adminNumber, twilioClient, from, complaint) {
  const message = `🚨 *NEW COMPLAINT - 1930 Helpline*

━━━━━━━━━━━━━━━━━━━━━
🎫 *Ticket:* ${complaint.ticketNumber}
👤 *Name:* ${complaint.name}
📞 *Phone:* ${complaint.phone}
📧 *Email:* ${complaint.email || 'Not provided'}

📍 *Location:* ${complaint.district}, ${complaint.pinCode}

📋 *Type:* ${complaint.complaintType}
${complaint.fraudCategory ? `💰 *Category:* ${complaint.fraudCategory}` : ''}
${complaint.fraudType ? `⚠️ *Fraud Type:* ${complaint.fraudType}` : ''}

⏰ *Filed:* ${new Date(complaint.createdAt).toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━
*Action Required:* Review and assign agent`;

  return await twilioClient.messages.create({
    from: from,
    to: adminNumber,
    body: message
  });
}

/**
 * Send status update notification to user
 */
async function sendStatusUpdateNotification(to, twilioClient, from, complaint, newStatus, note) {
  const message = `🔔 *Complaint Status Updated*

━━━━━━━━━━━━━━━━━━━━━
🎫 *Ticket:* ${complaint.ticketNumber}

🔄 *New Status:* ${newStatus}

${note ? `📝 *Update Note:*\n${note}\n` : ''}

⏰ *Updated:* ${new Date().toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━
For queries, reply with your ticket number.`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

module.exports = {
  sendWelcomeMenu,
  askFraudCategory,
  showFinancialFraudTypes,
  showSocialMediaFraudTypes,
  requestPersonalDetails,
  requestFinancialFraudDocuments,
  provideSocialMediaGuidance,
  sendComplaintConfirmation,
  requestStatusCheckDetails,
  sendComplaintStatus,
  requestAccountUnfreezeDetails,
  notifyAdmin,
  sendStatusUpdateNotification
};
