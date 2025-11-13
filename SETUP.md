# 🚀 Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or Atlas)
- Twilio Account with WhatsApp Sandbox
- Cloudinary Account
- Google Gemini API Key

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Create `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/cybercrime-db
PORT=3001

# Get from https://www.twilio.com/console
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP=whatsapp:+1234567890

# Get from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIza...
```

### 3. Configure Frontend Environment

Create `frontend/.env` file:

```env
VITE_API_BASE=http://localhost:3001
```

### 4. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas and update connection string
```

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on http://localhost:3001

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

### 7. Configure Twilio WhatsApp Webhook

1. Go to Twilio Console
2. Navigate to WhatsApp Sandbox
3. Set webhook URL to: `https://your-ngrok-url/webhook`
4. For local testing, use ngrok: `ngrok http 3001`

## Testing WhatsApp Integration

### Using Twilio Sandbox

1. Send WhatsApp message to Twilio Sandbox number
2. Join with code (e.g., "join <your-code>")
3. Start testing:
   - Send "hi"
   - Send "REPORT Test report"
   - Send "STATUS <report-id>"
   - Send "CHAT How to stay safe?"

### Test Commands

```
hi
1
REPORT I received a phishing email
AWARENESS Phishing
CHAT What is ransomware?
STATUS 6756abc123def456
CONTACT
HELP
```

## Admin Dashboard Access

1. Open browser: http://localhost:5173
2. View all reports
3. Click "View Details" on any report
4. Update status (user gets notified)
5. Add notes (sent to WhatsApp)
6. Send images to users

## Quick Troubleshooting

### Backend not starting?
- Check MongoDB is running
- Verify .env file exists and has correct values
- Check port 3001 is not in use

### WhatsApp not working?
- Verify Twilio credentials
- Check webhook URL is publicly accessible
- Ensure WhatsApp number is joined to sandbox
- Check Twilio logs for errors

### Frontend not loading?
- Check backend is running
- Verify VITE_API_BASE in .env
- Clear browser cache

### Images not uploading?
- Verify Cloudinary credentials
- Check image URL is accessible
- Review Cloudinary dashboard for errors

### AI not responding?
- Verify Gemini API key
- Check API quota limits
- Review backend logs

## Getting API Keys

### Twilio (WhatsApp)
1. Sign up at https://www.twilio.com/try-twilio
2. Go to Console Dashboard
3. Get Account SID and Auth Token
4. Enable WhatsApp Sandbox
5. Get sandbox number

### Cloudinary (Image Storage)
1. Sign up at https://cloudinary.com/users/register/free
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret

### Google Gemini (AI)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key

### MongoDB
1. Local: Install MongoDB Community Edition
2. Cloud: Sign up at https://www.mongodb.com/cloud/atlas
3. Create free cluster
4. Get connection string

## Production Deployment

### Backend
- Deploy to Heroku, Railway, or AWS
- Set environment variables
- Update webhook URL in Twilio

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Update VITE_API_BASE to production URL

## Support

If you encounter issues:
1. Check logs in terminal
2. Verify all environment variables
3. Test API endpoints with Postman
4. Review Twilio debugger logs
5. Check MongoDB connection

---

**Ready to go! 🎉**

Send "hi" to your WhatsApp bot and start reporting cyber crimes!
