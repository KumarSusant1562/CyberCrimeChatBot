// services/whatsappService.js
const twilio = require('twilio');

/**
 * Send interactive list message with buttons
 */
async function sendInteractiveMenu(to, from, twilioClient) {
  const message = `⬛ Hello! Welcome to CyberCrime Help Service.

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
    console.log('📤 Attempting to send menu to:', to);
    console.log('📤 From number:', from);
    const result = await twilioClient.messages.create({
      from: from,
      to: to,
      body: message
    });
    console.log('✅ Message sent successfully! SID:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
}

/**
 * Send business category selection
 */
async function sendBusinessCategories(to, from, twilioClient) {
  const message = `⬛ Select Business Category

━━━━━━━━━━━━━━━━━━━━━
⿡ E-COMMERCE - Online shopping fraud
⿢ BANKING - Financial fraud
⿣ SOCIAL MEDIA - Account hacking
⿤ INVESTMENT - Investment scams
⿥ JOB PORTAL - Fake job offers
⿦ REAL ESTATE - Property fraud
⿧ EDUCATION - Fake certificates
⿨ HEALTHCARE - Medical scams
⿩ OTHER - Other business types

━━━━━━━━━━━━━━━━━━━━━
Reply with number or type category name`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Send awareness topics menu
 */
async function sendAwarenessMenu(to, from, twilioClient) {
  const message = `⬛ Cyber Safety Awareness Topics

━━━━━━━━━━━━━━━━━━━━━
⿡ PHISHING - Email scams
⿢ FRAUD - Online fraud protection
⿣ IDENTITY THEFT - Protect your identity
⿤ CYBERBULLYING - Online harassment
⿥ RANSOMWARE - Malware protection
⿦ SOCIAL MEDIA - Safe social networking
⿧ PASSWORDS - Password security
⿨ TWO-FACTOR - 2FA authentication
⿩ DATA PRIVACY - Protect your data

━━━━━━━━━━━━━━━━━━━━━
Reply with number or topic name`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Send report confirmation
 */
async function sendReportConfirmation(to, from, twilioClient, reportData) {
  const message = `⬛ Report Received Successfully!

━━━━━━━━━━━━━━━━━━━━━
⬛ REPORT DETAILS

Reference ID: ${reportData.reportId}
Category: ${reportData.category}
${reportData.subCategory ? `Business Type: ${reportData.subCategory}` : ''}
Filed: ${new Date(reportData.createdAt).toLocaleString()}
${reportData.media && reportData.media.length > 0 ? `\n⬛ ${reportData.media.length} evidence file(s) uploaded` : ''}

━━━━━━━━━━━━━━━━━━━━━
⬛ NEXT STEPS

⿡ Check status: STATUS ${reportData.reportId}
⿢ Our team will review your case
⿣ You'll receive updates via WhatsApp

━━━━━━━━━━━━━━━━━━━━━
Thank you for reporting. We're here to help.`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Send status update to user
 */
async function sendStatusUpdate(to, from, twilioClient, reportId, status, note) {
  let message = `⬛ Report Status Update

━━━━━━━━━━━━━━━━━━━━━
Report ID: ${reportId}
Status: ${status}
Updated: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━`;

  if (note) {
    message += `\n⬛ MESSAGE FROM SUPPORT TEAM\n\n${note}\n\n━━━━━━━━━━━━━━━━━━━━━`;
  }

  message += `\n\nReply STATUS ${reportId} for full details`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Send admin notification
 */
async function sendAdminNotification(to, from, twilioClient, reportData) {
  const message = `⬛ NEW REPORT FILED

━━━━━━━━━━━━━━━━━━━━━
Report ID: ${reportData.reportId}
Category: ${reportData.category}
${reportData.subCategory ? `Business: ${reportData.subCategory}` : ''}
From: ${reportData.from}

Description:
${reportData.description.substring(0, 200)}${reportData.description.length > 200 ? '...' : ''}

${reportData.media && reportData.media.length > 0 ? `\nEvidence: ${reportData.media.length} file(s)` : ''}
━━━━━━━━━━━━━━━━━━━━━
Filed: ${new Date(reportData.createdAt).toLocaleString()}`;

  return await twilioClient.messages.create({
    from: from,
    to: to,
    body: message
  });
}

/**
 * Format report status message
 */
function formatStatusMessage(report) {
  let message = `⬛ REPORT STATUS

━━━━━━━━━━━━━━━━━━━━━
⬛ REPORT INFORMATION

Report ID: ${report.reportId}
Category: ${report.category}
${report.subCategory ? `Business Type: ${report.subCategory}\n` : ''}Status: ${report.status}
Filed: ${new Date(report.createdAt).toLocaleString()}
${report.updatedAt ? `Last Updated: ${new Date(report.updatedAt).toLocaleString()}` : ''}

━━━━━━━━━━━━━━━━━━━━━
⬛ DESCRIPTION

${report.description}

━━━━━━━━━━━━━━━━━━━━━`;

  if (report.media && report.media.length > 0) {
    message += `\n⬛ EVIDENCE\n${report.media.length} file(s) attached\n\n━━━━━━━━━━━━━━━━━━━━━`;
  }

  if (report.notes && report.notes.length > 0) {
    const latestNote = report.notes[report.notes.length - 1];
    message += `\n⬛ LATEST UPDATE FROM SUPPORT\n\n${latestNote.content}\n${new Date(latestNote.addedAt).toLocaleString()}\n\n━━━━━━━━━━━━━━━━━━━━━`;
  }

  if (report.timeline && report.timeline.length > 0) {
    message += `\n⬛ ACTIVITY TIMELINE\n\n`;
    report.timeline.slice(-3).forEach(t => {
      message += `⬛ ${t.action}\n${new Date(t.timestamp).toLocaleString()}\n\n`;
    });
    message += `━━━━━━━━━━━━━━━━━━━━━`;
  }

  return message;
}

module.exports = {
  sendInteractiveMenu,
  sendBusinessCategories,
  sendAwarenessMenu,
  sendReportConfirmation,
  sendStatusUpdate,
  sendAdminNotification,
  formatStatusMessage
};
