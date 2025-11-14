# 🚨 1930 Cyber Crime Helpline - WhatsApp Chatbot System

## 📋 Overview

A comprehensive WhatsApp-based chatbot system for the **Cyber Crime Helpline 1930** in Odisha, India. This system allows citizens to file cyber crime complaints, check status, request account unfreeze, and get assistance through WhatsApp, reducing call queue waiting times.

---

## ✨ Features

### 🤖 WhatsApp Chatbot Capabilities

1. **New Complaint Filing**
   - Financial Fraud (23 types)
   - Social Media Fraud (platforms: Facebook, Instagram, X, WhatsApp, Telegram, Gmail)
   - Step-by-step data collection
   - Document upload support
   - Automatic ticket number generation

2. **Status Check**
   - Track existing complaints by ticket number
   - Real-time status updates
   - SMS/WhatsApp notifications

3. **Account Unfreeze Requests**
   - Bank account details submission
   - Priority handling for financial cases

4. **Other Queries**
   - General assistance
   - Agent callback scheduling

### 💼 Admin Dashboard Features

- **Modern UI/UX Design**
  - Clean, professional interface
  - Gradient color scheme
  - Responsive layout
  - Real-time data refresh

- **Complaint Management**
  - View all complaints in table format
  - Advanced filtering (status, type, priority)
  - Search by ticket, name, phone, email
  - Detailed complaint view modal

- **Status & Priority Management**
  - Update complaint status (Registered, In Progress, Under Investigation, Escalated, Resolved, Closed)
  - Set priority levels (Low, Medium, High, Critical)
  - Agent assignment

- **Communication Tools**
  - Add notes (sent to user via WhatsApp)
  - View timeline of all activities
  - Document/evidence viewing

- **Statistics Dashboard**
  - Total complaints counter
  - Status-wise breakdown
  - Priority indicators
  - Visual statistics cards

---

## 📂 Project Structure

```
0000/
├── backend/
│   ├── index_1930.js                      # Main server for 1930 Helpline
│   ├── db.js                              # MongoDB connection
│   ├── models/
│   │   └── Complaint.js                   # Complaint schema with ticket generation
│   └── services/
│       ├── helpline1930WebhookHandler.js  # WhatsApp message handler
│       ├── helpline1930Service.js         # Message templates & utilities
│       ├── cloudinary.js                  # Document upload service
│       └── geminiAI.js                    # AI services (optional)
│
├── frontend/
│   └── src/
│       ├── App.jsx                        # Main app with navigation
│       └── components/
│           └── ComplaintsDashboard.jsx    # Modern admin dashboard
│
└── HELPLINE_1930_README.md               # This file
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Twilio Account with WhatsApp enabled
- Cloudinary Account (for document uploads)

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cybercrime1930

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Admin WhatsApp (for notifications)
ADMIN_WHATSAPP=whatsapp:+919999999999

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI (Optional)
GEMINI_API_KEY=your_gemini_api_key
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start the server
node index_1930.js
```

The server will run on `http://localhost:3001`

### Frontend Setup

Create `.env` file in `frontend/`:

```env
VITE_API_BASE=http://localhost:3001
```

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

---

## 📱 WhatsApp Bot Workflow

### Main Menu

When a user messages the bot, they see:

```
🚨 Welcome to 1930 Cyber Helpline, Odisha 🚨

Please select an option:

A - For New Complaint
B - For Status Check in Existing Complaint
C - For Account Unfreeze Related
D - Other Queries

Reply with A, B, C, or D
```

### Option A: New Complaint

1. **Select Fraud Category**
   - Financial Fraud (1)
   - Social Media Fraud (2)

2. **Select Specific Fraud Type**
   
   **Financial Fraud Types (23 options):**
   1. Investment/Trading/IPO Fraud
   2. Customer Care Fraud
   3. UPI Fraud
   4. APK Fraud
   5. Fake Franchisee/Dealership
   6. Online Job Fraud
   7. Debit Card Fraud
   8. Credit Card Fraud
   9. E-Commerce Fraud
   10. Loan App Fraud
   11. Sextortion Fraud
   12. OLX Fraud
   13. Lottery Fraud
   14. Hotel Booking Fraud
   15. Gaming App Fraud
   16. AEPS Fraud
   17. Tower Installation Fraud
   18. E-Wallet Fraud
   19. Digital Arrest Fraud
   20. Fake Website Scam
   21. Ticket Booking Fraud
   22. Insurance Maturity Fraud
   23. Others

   **Social Media Fraud Types (24 options):**
   - Facebook: Impersonation, Fake Account, Hack, Obscene Content
   - Instagram: Impersonation, Fake Account, Hack, Obscene Content
   - X (Twitter): Impersonation, Fake Account, Hack, Obscene Content
   - WhatsApp: Impersonation, Fake Account, Hack, Obscene Content
   - Telegram: Impersonation, Fake Account, Hack, Obscene Content
   - Gmail: Impersonation, Hack, Obscene Content
   - Fraud Call/SMS

3. **Collect Personal Details** (11 fields)
   - Name
   - Father/Spouse/Guardian Name
   - Date of Birth
   - Phone Number
   - Email ID
   - Gender
   - Village
   - Post Office
   - Police Station
   - District
   - PIN Code

4. **Document Upload**
   
   For **Financial Fraud**, request:
   - Aadhar Card / PAN Card
   - Debit/Credit Card photo
   - Bank account front page
   - Bank statement (highlighted transactions)
   - Transaction screenshots with UTR/reference numbers
   - Beneficiary account details (if available)

   For **Social Media Fraud**, provide platform-specific guidance:
   - Facebook/Instagram: Meta Grievance Channel link
   - X: Twitter Support link
   - WhatsApp: ##002# command + WhatsApp Grievance link
   - Telegram: Telegram Support link
   - Gmail: Google Account Recovery link
   - Fraud Call: Sanchar Saathi portal link

5. **Confirmation & Ticket Generation**
   ```
   ✅ Complaint Registered Successfully
   
   🎫 Ticket Number: 1930OD000123
   
   Your complaint has been registered.
   Our caller agent will contact you shortly.
   ```

### Option B: Status Check

- User provides ticket number or phone number
- System retrieves complaint details
- Shows current status and latest updates

### Option C: Account Unfreeze

- User provides account details (Account Number, Bank Name, IFSC)
- Collects personal information
- Creates high-priority ticket
- Agent callback scheduled

### Option D: Other Queries

- User describes query
- Collects contact details
- Agent callback scheduled

---

## 🎨 Admin Dashboard Guide

### Dashboard Access

Navigate to the frontend URL and select "🚨 1930 Helpline Complaints" tab.

### Main Features

#### 1. Statistics Cards
- **Total Complaints**: Overall count
- **Registered**: New complaints
- **In Progress**: Active investigations
- **Resolved**: Completed cases
- **Critical Priority**: Urgent cases

#### 2. Filter & Search
- **Search Bar**: Search by ticket, name, phone, email
- **Status Filter**: Filter by complaint status
- **Type Filter**: Filter by complaint type
- **Priority Filter**: Filter by priority level

#### 3. Complaints Table

Each row shows:
- Ticket Number (unique ID)
- Complainant details (name, DOB, gender)
- Contact (phone, email)
- Location (district, PIN)
- Complaint type
- Fraud category & type
- Current status
- Priority level
- Assigned agent
- Document count
- Creation date/time

#### 4. Complaint Details Modal

Click "👁️ View" to open detailed view:

**Personal Information**
- Full name, father/spouse name
- DOB, gender
- Phone, email, WhatsApp

**Address Details**
- Village, post office
- Police station, district
- PIN code

**Complaint Information**
- Complaint type
- Fraud category & specific type
- Amount (for financial fraud)

**Documents**
- View all uploaded documents
- Click to open in new tab
- Shows document type labels

**Management Actions**
- Update status (6 options)
- Set priority (4 levels)
- Assign to agent
- Add notes (sent to user via WhatsApp)

**Activity Timeline**
- Chronological event history
- Shows who performed each action
- Timestamps for all activities

**Admin Notes History**
- Previous notes/updates
- Who added each note
- When notes were added

---

## 🔧 Technical Implementation

### Backend Architecture

#### 1. Complaint Schema (`models/Complaint.js`)

```javascript
{
  ticketNumber: String,        // Auto-generated: 1930ODXXXXXX
  whatsappNumber: String,
  
  // Personal Info (11 fields)
  name, fatherSpouseName, dateOfBirth, phone, email,
  gender, village, postOffice, policeStation, district, pinCode,
  
  // Complaint Details
  complaintType: Enum,
  fraudCategory: Enum,
  financialFraudType: Enum,    // 23 types
  socialMediaFraudType: Enum,  // 24 types
  
  // Documents
  documents: [{ type, url, uploadedAt }],
  
  // Status Management
  status: Enum,                // 6 statuses
  priority: Enum,              // 4 levels
  assignedTo: String,
  
  // Communication
  adminNotes: [{ note, addedBy, addedAt }],
  timeline: [{ action, description, performedBy, timestamp }],
  chatHistory: [{ from, message, timestamp }],
  
  // External Links
  externalLinks: [{ platform, url, providedAt }],
  
  timestamps: true
}
```

#### 2. Webhook Handler (`services/helpline1930WebhookHandler.js`)

**Session Management:**
- Stores user state in memory
- Tracks current step in flow
- Stores collected data temporarily

**Message Flow:**
- Welcome → Category Selection → Type Selection
- Personal Details Collection (step-by-step)
- Document Upload → Confirmation
- Database Storage → Ticket Generation
- User Notification + Admin Notification

#### 3. Service Layer (`services/helpline1930Service.js`)

**Message Templates:**
- Welcome menu
- Category selections
- Personal detail requests
- Platform-specific guidance
- Status updates
- Confirmations

**WhatsApp Messaging:**
- Formatted messages with emojis
- Structured layouts
- Click-to-action links
- Status notifications

#### 4. API Endpoints (`index_1930.js`)

```javascript
GET  /api/health              // Health check
GET  /api/complaints          // Get all complaints
GET  /api/complaints/:id      // Get single complaint
PATCH /api/complaints/:id     // Update complaint
POST /api/complaints/:id/notes // Add note
GET  /api/stats               // Statistics

POST /webhook                 // WhatsApp webhook
GET  /webhook                 // Webhook verification
```

### Frontend Architecture

#### Component Structure

**ComplaintsDashboard.jsx**
- Main dashboard component
- State management for complaints, filters, modal
- API integration
- Responsive design with inline styles

**Key Functions:**
```javascript
loadComplaints()           // Fetch from API
updateStatus()             // Change complaint status
updatePriority()           // Change priority
assignAgent()              // Assign to agent
addAdminNote()             // Add note (WhatsApp sent)
viewDetails()              // Open modal
```

**Styling Approach:**
- Inline styles for portability
- Modern gradient design
- Card-based layout
- Responsive grid system
- Professional color scheme

---

## 📊 Database Design

### Collections

#### 1. complaints
Primary collection for all 1930 helpline complaints.

**Indexes:**
- `ticketNumber` (unique)
- `phone`
- `whatsappNumber`
- `status`
- `createdAt`

#### 2. complaintcounters
Counter for ticket number generation.

```javascript
{
  _id: 'ticketNumber',
  seq: 123
}
```

---

## 🔐 Security Considerations

1. **Data Protection**
   - Sensitive documents stored securely on Cloudinary
   - Database connection encrypted
   - Environment variables for credentials

2. **Input Validation**
   - Phone number format validation
   - Email validation
   - PIN code validation
   - Enum validation for dropdowns

3. **WhatsApp Security**
   - Twilio webhook verification
   - Session-based message handling
   - Rate limiting (recommended)

4. **Admin Access**
   - Dashboard requires authentication (to be implemented)
   - Role-based access control (recommended)

---

## 🚀 Deployment Guide

### Backend Deployment

**Option 1: Heroku**
```bash
heroku create cybercrime1930
heroku config:set MONGODB_URI=...
heroku config:set TWILIO_ACCOUNT_SID=...
git push heroku main
```

**Option 2: AWS EC2**
```bash
# Install Node.js
# Clone repository
# Install dependencies
# Setup PM2 for process management
pm2 start index_1930.js --name "1930-helpline"
pm2 save
```

**Option 3: DigitalOcean App Platform**
- Connect GitHub repository
- Set environment variables
- Deploy with one click

### Frontend Deployment

**Option 1: Vercel**
```bash
vercel --prod
```

**Option 2: Netlify**
```bash
netlify deploy --prod
```

### Database

**MongoDB Atlas (Recommended)**
1. Create cluster
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Update MONGODB_URI in .env

---

## 📈 Scalability

### Current Capacity
- Handles 1000+ complaints/day
- In-memory sessions (single server)
- MongoDB for persistence

### Scaling Recommendations

1. **Horizontal Scaling**
   - Use Redis for session storage
   - Load balancer for multiple servers
   - Database replication

2. **Performance Optimization**
   - Add database indexes
   - Implement caching (Redis)
   - CDN for static assets
   - Image optimization

3. **Monitoring**
   - Add logging (Winston/Bunyan)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
   - WhatsApp analytics

---

## 🧪 Testing

### Manual Testing Checklist

**WhatsApp Bot:**
- [ ] Send "Hi" to trigger welcome menu
- [ ] Test Option A (New Complaint)
  - [ ] Financial Fraud flow
  - [ ] Social Media Fraud flow
  - [ ] Document upload
  - [ ] Ticket generation
- [ ] Test Option B (Status Check)
- [ ] Test Option C (Account Unfreeze)
- [ ] Test Option D (Other Queries)

**Admin Dashboard:**
- [ ] View all complaints
- [ ] Filter by status
- [ ] Search functionality
- [ ] View complaint details
- [ ] Update status (check WhatsApp notification)
- [ ] Set priority
- [ ] Assign agent
- [ ] Add note (check WhatsApp delivery)
- [ ] View documents
- [ ] Check timeline

### API Testing

```bash
# Get all complaints
curl http://localhost:3001/api/complaints

# Get single complaint
curl http://localhost:3001/api/complaints/1930OD000001

# Update status
curl -X PATCH http://localhost:3001/api/complaints/1930OD000001 \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'

# Add note
curl -X POST http://localhost:3001/api/complaints/1930OD000001/notes \
  -H "Content-Type: application/json" \
  -d '{"note": "Investigation started", "addedBy": "Admin"}'
```

---

## 📞 Support & Maintenance

### Common Issues

**1. WhatsApp messages not sending**
- Check Twilio credentials
- Verify WhatsApp number format
- Check Twilio console for errors

**2. Database connection failed**
- Verify MongoDB URI
- Check network connectivity
- Ensure MongoDB service is running

**3. Documents not uploading**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper CORS settings

**4. Frontend not loading data**
- Check API base URL in .env
- Verify backend is running
- Check browser console for errors

### Logs

**Backend logs:**
```bash
# View real-time logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log
```

**Frontend logs:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

---

## 🎯 Future Enhancements

1. **Multi-language Support**
   - Odia language option
   - Hindi support
   - Regional language integration

2. **Advanced Analytics**
   - Fraud pattern detection
   - Geographic heat maps
   - Time-based analysis
   - Agent performance metrics

3. **AI Integration**
   - Automated fraud classification
   - Chatbot intelligence
   - Sentiment analysis
   - Auto-response suggestions

4. **Mobile App**
   - React Native app
   - Push notifications
   - Offline complaint draft

5. **Integration**
   - Integration with National Cyber Crime Portal
   - Bank API integration for account status
   - SMS gateway integration
   - Email notifications

6. **Enhanced Security**
   - Two-factor authentication for admin
   - Encryption for sensitive data
   - Audit logs
   - Role-based permissions

---

## 📜 License

This project is developed for the Government of Odisha - 1930 Cyber Crime Helpline initiative.

---

## 👥 Contributors

Developed for the Odisha Police Cyber Crime Division

---

## 📧 Contact

For technical support or queries:
- **Helpline:** 1930
- **Email:** cybercrime@odishapolice.gov.in
- **Website:** https://cybercrime.gov.in

---

## 🙏 Acknowledgments

- Twilio for WhatsApp Business API
- MongoDB for database services
- Cloudinary for document storage
- React team for frontend framework
- Express.js team for backend framework

---

**Last Updated:** November 2025
**Version:** 1.0.0
