// services/geminiAI.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get AI response for cyber crime awareness and assistance
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous conversation context
 * @returns {Promise<string>} - AI response
 */
async function getAIResponse(userMessage, conversationHistory = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // System context for cyber crime assistance
    const systemContext = `You are a helpful assistant for a Cyber Crime Reporting System. Your role is to:
1. Provide cyber safety awareness and tips
2. Help users understand different types of cyber crimes (phishing, online fraud, identity theft, cyberbullying, etc.)
3. Guide users on how to report cyber crimes
4. Offer emotional support and reassurance
5. Provide prevention tips and best practices
6. Never give legal advice, but suggest contacting authorities

Always be empathetic, clear, and helpful. Keep responses concise and actionable.`;

    // Build conversation context
    let prompt = systemContext + '\n\n';
    
    if (conversationHistory.length > 0) {
      prompt += 'Previous conversation:\n';
      conversationHistory.slice(-5).forEach(msg => {
        prompt += `${msg.from === 'user' ? 'User' : 'Assistant'}: ${msg.message}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `User: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI error:', error);
    return 'I apologize, but I am unable to respond at the moment. Please try again or contact our support team.';
  }
}

/**
 * Get cyber awareness information on specific topics
 * @param {string} topic - The cyber crime topic
 * @returns {Promise<string>} - Information about the topic
 */
async function getCyberAwareness(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Provide concise, practical information about: ${topic}
    
Focus on:
- What it is
- Warning signs
- Prevention tips
- What to do if affected

Keep it brief (max 200 words) and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI error:', error);
    return 'Unable to fetch information at the moment.';
  }
}

/**
 * Analyze and categorize cyber crime report
 * @param {string} description - Report description
 * @returns {Promise<string>} - Category
 */
async function categorizeReport(description) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Categorize this cyber crime report into ONE of these categories:
- Phishing
- Online Fraud
- Identity Theft
- Cyberbullying
- Hacking
- Ransomware
- Social Media Crime
- Financial Fraud
- Other

Report: ${description}

Respond with ONLY the category name, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini categorization error:', error);
    return 'Uncategorized';
  }
}

module.exports = {
  getAIResponse,
  getCyberAwareness,
  categorizeReport
};
