// services/classifier.js
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ENABLE_AI = process.env.ENABLE_AI === 'true';

async function classifyText(text) {
  if (!ENABLE_AI || !OPENAI_API_KEY) {
    return 'Uncategorized';
  }
  try {
    // Lightweight classification using OpenAI chat completions
    const prompt = `Classify the following cyber incident into one of: Phishing, Scam, Financial Fraud, Account Takeover, Doxing, Harassment, Malware, Other.
Text: "${text.trim()}"\nReturn only the category single word.`;
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini', // if unavailable, use 'gpt-4o' or 'gpt-4o-mini'
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    }, {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    });

    const out = resp.data.choices?.[0]?.message?.content?.trim();
    // sanitize/normalize first word
    if (!out) return 'Uncategorized';
    const cat = out.split('\n')[0].split(/[.,]/)[0].trim();
    return cat || 'Uncategorized';
  } catch (err) {
    console.warn('AI classify failed', err?.message || err);
    return 'Uncategorized';
  }
}

module.exports = { classifyText };
