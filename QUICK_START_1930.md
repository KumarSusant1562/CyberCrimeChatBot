# 🚀 Quick Start Guide - 1930 Cyber Crime Helpline

## ⚡ Fast Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install express body-parser cors twilio mongoose dotenv cloudinary

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment

Create `backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/cybercrime1930
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP=whatsapp:+919999999999
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:3001
```

### Step 3: Start MongoDB

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongodb
```

### Step 4: Run Backend

```bash
cd backend
node index_1930.js
```

You should see:
```
✅ Database connected - 1930 Cyber Crime Helpline
🚀 1930 Cyber Crime Helpline - Backend running on port 3001
📱 WhatsApp Bot: whatsapp:+14155238886
```

### Step 5: Run Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 6: Access Dashboard

1. Open browser: `http://localhost:5173`
2. Click on **"🚨 1930 Helpline Complaints"** tab
3. You should see the modern dashboard

---

## 📱 Test WhatsApp Bot

### Setup Twilio Webhook

1. Go to Twilio Console
2. Navigate to: Messaging → Settings → WhatsApp Sandbox
3. Set webhook URL: `https://your-domain.com/webhook`
4. For local testing, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Set Twilio webhook to: https://abc123.ngrok.io/webhook
```

### Test Conversation

1. Join WhatsApp sandbox (send code to Twilio number)
2. Send: `Hi`
3. Bot responds with welcome menu
4. Test the flows:
   - Send `A` for new complaint
   - Send `1` for financial fraud
   - Follow the prompts

---

## 🎯 What's Included

### ✅ Completed Features

**Backend:**
- ✅ Complete WhatsApp bot with conversational flow
- ✅ 23 financial fraud types
- ✅ 24 social media fraud types
- ✅ Step-by-step personal data collection
- ✅ Document upload via Cloudinary
- ✅ Auto ticket generation (1930ODXXXXXX format)
- ✅ Status check functionality
- ✅ Account unfreeze requests
- ✅ Complete API endpoints
- ✅ WhatsApp notifications to users
- ✅ Admin notifications

**Frontend:**
- ✅ Modern, professional UI dashboard
- ✅ Real-time complaint viewing
- ✅ Advanced filters (status, type, priority, search)
- ✅ Statistics cards
- ✅ Detailed complaint modal
- ✅ Status/priority management
- ✅ Agent assignment
- ✅ Note adding (with WhatsApp delivery)
- ✅ Document viewing
- ✅ Activity timeline
- ✅ Dual navigation (1930 + General Reports)

**Database:**
- ✅ Comprehensive complaint schema
- ✅ Auto-incrementing ticket numbers
- ✅ Timeline tracking
- ✅ Admin notes storage
- ✅ Document metadata

**Documentation:**
- ✅ Complete README with all details
- ✅ Quick start guide
- ✅ Workflow diagrams (in text)
- ✅ API documentation
- ✅ Deployment guide

---

## 🧪 Quick Test Checklist

### WhatsApp Bot Tests

- [ ] Send "Hi" → Receive welcome menu
- [ ] Option A → Financial Fraud flow
- [ ] Option A → Social Media Fraud flow
- [ ] Upload document (image)
- [ ] Receive ticket number
- [ ] Option B → Check status with ticket
- [ ] Option C → Account unfreeze request
- [ ] Option D → Other query

### Dashboard Tests

- [ ] View complaints table
- [ ] Use search bar
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Click "View" button
- [ ] Change status (check WhatsApp notification)
- [ ] Set priority
- [ ] Assign agent
- [ ] Add note (check WhatsApp delivery)
- [ ] View documents
- [ ] Check timeline

---

## 📊 Sample Data

Want to test with sample data? Run this in MongoDB:

```javascript
// Connect to MongoDB
use cybercrime1930

// Insert sample complaint
db.complaints.insertOne({
  ticketNumber: "1930OD000001",
  whatsappNumber: "whatsapp:+919999999999",
  name: "Test User",
  fatherSpouseName: "Test Father",
  dateOfBirth: "01/01/1990",
  phone: "9999999999",
  email: "test@example.com",
  gender: "Male",
  village: "Test Village",
  postOffice: "Test PO",
  policeStation: "Test PS",
  district: "Bhubaneswar",
  pinCode: "751001",
  complaintType: "new_complaint",
  fraudCategory: "financial_fraud",
  financialFraudType: "upi_fraud",
  status: "Registered",
  priority: "High",
  documents: [],
  adminNotes: [],
  timeline: [{
    action: "Complaint Registered",
    description: "Sample complaint for testing",
    performedBy: "system",
    timestamp: new Date()
  }],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 🎨 UI Features Highlight

### Dashboard Design
- **Color Scheme:** Purple gradient (#667eea to #764ba2)
- **Typography:** Segoe UI, modern sans-serif
- **Layout:** Card-based, responsive grid
- **Icons:** Emoji-based for better visibility

### User Experience
- **Auto-refresh:** Every 30 seconds
- **Real-time updates:** Instant status changes
- **WhatsApp integration:** Notes sent immediately
- **Responsive design:** Works on mobile/tablet/desktop

### Visual Elements
- **Statistics Cards:** Color-coded borders
- **Status Badges:** Color-coded backgrounds
- **Priority Indicators:** Red (Critical) to Gray (Low)
- **Document Grid:** Hover effects, click to open
- **Timeline:** Vertical line with dots
- **Modal:** Full-screen overlay, smooth animations

---

## 🔧 Troubleshooting

### Backend won't start

```bash
# Check if port 3001 is available
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend build errors

```bash
# Clear cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

### WhatsApp not responding

1. Check Twilio console for webhook errors
2. Verify ngrok is running (for local testing)
3. Check backend logs for errors
4. Ensure TWILIO_WHATSAPP_FROM is correct

### Database connection failed

```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB service
# Windows:
net start MongoDB

# Mac/Linux:
sudo systemctl start mongodb
```

---

## 📞 Support

If you encounter issues:

1. Check `HELPLINE_1930_README.md` for detailed docs
2. Review backend console logs
3. Check browser DevTools console
4. Verify all environment variables
5. Test API endpoints with curl/Postman

---

## 🎉 Success Indicators

Your system is working if:

✅ Backend shows: "Database connected"
✅ Backend shows: "Backend running on port 3001"
✅ Frontend loads without errors
✅ Dashboard shows statistics cards
✅ WhatsApp bot responds to "Hi"
✅ Complaints table loads (even if empty)
✅ Modal opens when clicking "View"
✅ Status changes trigger WhatsApp notifications

---

## 🚀 Next Steps

1. **Get Twilio Account**
   - Sign up at twilio.com
   - Enable WhatsApp sandbox
   - Get credentials

2. **Setup MongoDB Atlas**
   - Create free cluster
   - Get connection string
   - Update MONGODB_URI

3. **Setup Cloudinary**
   - Sign up at cloudinary.com
   - Get API credentials
   - Update .env

4. **Deploy to Production**
   - Backend: Heroku/AWS/DigitalOcean
   - Frontend: Vercel/Netlify
   - Database: MongoDB Atlas

5. **Go Live**
   - Configure Twilio webhook
   - Test end-to-end
   - Train staff on dashboard
   - Monitor and iterate

---

**Ready to handle cyber crime complaints at scale! 🚨**
