# 📁 Project Structure

## Complete File Tree

```
0000/
│
├── backend/
│   ├── models/
│   │   └── Report.js                 # MongoDB schema with timeline, notes, conversation
│   │
│   ├── services/
│   │   ├── classifier.js             # Original classification service
│   │   ├── cloudinary.js             # Cloudinary image upload service
│   │   └── geminiAI.js               # Google Gemini AI integration
│   │
│   ├── .env                          # Environment variables (not in git)
│   ├── .env.example                  # Environment template
│   ├── db.js                         # MongoDB connection
│   ├── index.js                      # Main server with all endpoints
│   ├── package.json                  # Backend dependencies
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard.jsx         # Admin dashboard with timeline UI
│   │   │
│   │   ├── api.js                    # API helper functions
│   │   ├── App.jsx                   # Main React app
│   │   ├── main.jsx                  # React entry point
│   │   └── styles.css                # Global styles
│   │
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   ├── package-lock.json
│   └── vite.config.js                # Vite configuration
│
├── CHECKLIST.md                      # Configuration checklist
├── FEATURES.md                       # Complete features list
├── README.md                         # Project overview
├── SETUP.md                          # Setup instructions
├── TESTING.md                        # Testing guide
└── USER_GUIDE.md                     # WhatsApp bot user guide
```

## 📄 File Descriptions

### Backend Files

#### `backend/index.js`
**Main server file** with:
- Express server setup
- Twilio WhatsApp webhook handler
- Admin API endpoints
- Comprehensive command routing
- Automated messaging system
- Integration with all services

**Key Features:**
- Welcome message automation
- Menu-based navigation
- Report filing with images
- Status checking
- AI chat integration
- Awareness content delivery
- Emergency contacts
- Admin notification system

#### `backend/models/Report.js`
**MongoDB schema** including:
- Basic report info (from, description, category)
- Media array with Cloudinary URLs
- Status tracking
- Timeline array for activity history
- Notes array for admin communications
- Conversation array for AI chat history

#### `backend/services/cloudinary.js`
**Image management service** with:
- `uploadImageFromUrl()` - Upload from Twilio media URL
- `uploadImageFromBuffer()` - Upload from buffer
- Cloudinary configuration
- Error handling

#### `backend/services/geminiAI.js`
**AI integration service** with:
- `getAIResponse()` - Chat assistant responses
- `getCyberAwareness()` - Educational content
- `categorizeReport()` - Automatic categorization
- Context management
- Error handling

#### `backend/services/classifier.js`
**Legacy classification** (kept for backward compatibility)

#### `backend/db.js`
**Database connection** handling MongoDB setup

#### `backend/.env.example`
**Environment template** with all required variables

### Frontend Files

#### `frontend/src/components/Dashboard.jsx`
**Admin dashboard** featuring:
- Statistics cards
- Reports table
- Detailed report modal
- Timeline visualization
- Notes system
- Image sending capability
- Real-time updates
- Modern UI design

#### `frontend/src/api.js`
**API helper functions:**
- `fetchReports()` - Get all reports
- `updateReport()` - Update status
- `addNote()` - Add admin note
- `sendImage()` - Send image to user

#### `frontend/src/App.jsx`
**Main React component** with Dashboard integration

#### `frontend/src/main.jsx`
**React entry point** with Vite setup

#### `frontend/src/styles.css`
**Global styles** for the application

### Documentation Files

#### `README.md`
Complete project overview with:
- Features list
- Setup instructions
- API documentation
- Database schema
- Technologies used
- Usage examples

#### `SETUP.md`
Step-by-step setup guide with:
- Prerequisites
- Installation steps
- Configuration details
- API key instructions
- Testing procedures
- Troubleshooting

#### `TESTING.md`
Comprehensive testing guide with:
- WhatsApp bot testing
- Admin dashboard testing
- Integration testing
- API testing
- Error handling tests
- Test data samples

#### `FEATURES.md`
Complete features documentation:
- All 150+ features listed
- Feature categories
- Integration details
- Technical specifications

#### `CHECKLIST.md`
Configuration checklist:
- Environment setup
- Service configuration
- Security checks
- Deployment verification
- Testing checklist

#### `USER_GUIDE.md`
WhatsApp bot user manual:
- Command reference
- Usage examples
- Workflows
- Pro tips
- Quick reference

## 🔧 Configuration Files

### Backend Configuration
- `.env` - Environment variables
- `package.json` - Dependencies and scripts
- Database connection in `db.js`

### Frontend Configuration
- `.env` - API base URL
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite settings

## 🚀 Entry Points

### Backend
```bash
npm start        # Production
npm run dev      # Development with nodemon
```
**Entry:** `backend/index.js`
**Port:** 3001 (configurable)

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
```
**Entry:** `frontend/src/main.jsx`
**Port:** 5173 (default)

## 📦 Dependencies

### Backend Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",
  "axios": "^1.4.0",
  "body-parser": "^1.20.3",
  "cloudinary": "^2.8.0",
  "cors": "^2.8.5",
  "dotenv": "^16.6.1",
  "express": "^4.21.2",
  "mongoose": "^7.8.7",
  "multer": "^2.0.2",
  "twilio": "^4.23.0"
}
```

### Frontend Dependencies
```json
{
  "axios": "^1.4.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^5.0.0"
}
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /public/health` - Health check
- `POST /webhook` - Twilio WhatsApp webhook

### Admin Endpoints
- `GET /api/health` - Internal health check
- `GET /api/reports` - Fetch all reports
- `PATCH /api/reports/:id` - Update report status
- `POST /api/reports/:id/notes` - Add admin note
- `POST /api/reports/:id/send-image` - Send image to user

## 🗄️ Database Collections

### reports
```javascript
{
  _id: ObjectId,
  from: String,
  description: String,
  category: String,
  media: Array,
  status: String,
  timeline: Array,
  notes: Array,
  conversation: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Environment Variables

### Backend Required
- `MONGODB_URI`
- `PORT`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `ADMIN_WHATSAPP`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GEMINI_API_KEY`

### Frontend Required
- `VITE_API_BASE`

## 📊 Data Flow

### User Report Flow
```
User (WhatsApp) 
  → Twilio 
  → Backend Webhook 
  → Cloudinary (images) 
  → Gemini AI (categorization)
  → MongoDB 
  → Admin Notification
```

### Admin Action Flow
```
Admin (Dashboard) 
  → Backend API 
  → MongoDB Update 
  → Twilio WhatsApp 
  → User Notification
```

### AI Chat Flow
```
User (WhatsApp)
  → Backend
  → Gemini AI
  → Response
  → User (WhatsApp)
```

## 🎨 UI Components

### Dashboard Components
- Statistics Cards
- Reports Table
- Detail Modal
- Timeline Visualization
- Notes Form
- Image Upload Form

### Styling Approach
- Inline CSS with JavaScript objects
- Modern gradient design
- Responsive layout
- Color-coded badges
- Professional typography

## 🔄 Update Flow

### Real-Time Updates
1. Auto-refresh every 30 seconds
2. Manual refresh on action
3. Immediate feedback
4. WhatsApp notifications

## 📱 WhatsApp Integration

### Supported Messages
- Text messages
- Images (via Cloudinary)
- Commands (text-based)
- Automated responses

### Command Types
- Single word (HELP, MENU)
- With parameters (REPORT, STATUS, CHAT, AWARENESS)
- Numbers (1-6)
- Greetings (hi, hello)

## 🛠️ Service Architecture

### Modular Design
- Separate service files
- Independent functionality
- Easy to extend
- Error isolation

### Services
- Twilio (WhatsApp)
- Cloudinary (Images)
- Gemini AI (Intelligence)
- MongoDB (Data)
- Express (API)
- React (UI)

---

**Project Structure: Complete & Organized! 📁**

All files are properly organized and documented for easy navigation and maintenance.
