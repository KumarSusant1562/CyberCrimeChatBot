# 🛡️ 1930 Cyber Crime Helpline - WhatsApp Chatbot System

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Platform](https://img.shields.io/badge/Platform-WhatsApp-25D366?logo=whatsapp)
![License](https://img.shields.io/badge/License-Government%20Project-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

**Official WhatsApp Chatbot for Cyber Crime Helpline 1930, Odisha**

[Quick Start](#-quick-start) • [Features](#-features) • [Setup Guide](#-complete-setup-guide) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Complete Setup Guide](#-complete-setup-guide)
- [WhatsApp Commands](#-whatsapp-commands)
- [Admin Dashboard](#️-admin-dashboard)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Support](#-support)

---

## 🎯 Overview

The **1930 Cyber Crime Helpline WhatsApp Chatbot** is a comprehensive digital solution designed to reduce wait times and improve accessibility for citizens reporting cyber crimes in Odisha. This system allows complainants to file reports 24/7 through WhatsApp, bypassing long phone queues.

### 📊 Key Statistics
- **47 Fraud Types** supported (23 Financial + 24 Social Media)
- **24/7 Availability** via WhatsApp
- **Instant Ticket Generation** (Format: 1930ODXXXXXX)
- **Real-time Notifications** to users and admins
- **Auto Document Upload** via WhatsApp
- **Smart AI Categorization** using Gemini AI

---

## 🚨 Problem Statement

### Background
The Cyber Crime Helpline **1930** receives thousands of calls daily, resulting in:
- ❌ Long wait times in call queues
- ❌ Limited operating hours (business hours only)
- ❌ Manual data collection prone to errors
- ❌ No digital trail for complaint tracking
- ❌ Delayed response times

### Our Solution
✅ **24/7 WhatsApp Access** - File complaints anytime, anywhere  
✅ **Instant Processing** - No waiting in phone queues  
✅ **Automated Ticket Generation** - Unique reference numbers (1930ODXXXXXX)  
✅ **Document Upload** - Attach evidence directly via WhatsApp  
✅ **Real-time Updates** - Get notified instantly on WhatsApp  
✅ **Modern Admin Dashboard** - Manage all complaints efficiently  

---

### 🤖 For Citizens (WhatsApp Users)

#### **New Complaint Filing**
- **23 Financial Fraud Types**: UPI Fraud, Investment Fraud, Loan App Fraud, Digital Arrest, and more
- **24 Social Media Fraud Types**: Facebook, Instagram, WhatsApp, Telegram hacking & impersonation
- **Step-by-Step Data Collection**: 11 personal detail fields
- **Document Upload**: Aadhaar, Bank Statement, Transaction Screenshots
- **Instant Ticket Number**: Get 1930ODXXXXXX format ticket instantly
- **Platform-Specific Guidance**: Direct links to Meta, X, Google grievance portals

#### **Status Tracking**
- Check complaint status anytime using ticket number
- Get estimated resolution time
- Receive WhatsApp updates on every action

#### **Account Unfreeze**
- Priority handling for frozen bank accounts
- Direct agent callback scheduling
- Fast-track processing

#### **Other Services**
- Cyber awareness tips
- Emergency contact information
- AI-powered chat assistance

### 👨‍💼 For Administrators

#### **Modern Dashboard**
- **Real-time Statistics**: Total, Pending, Resolved complaints at a glance
- **Advanced Filtering**: By status, type, priority, and search
- **Comprehensive View**: All complaint details in organized sections
- **Document Gallery**: View all uploaded evidence
- **Timeline Tracking**: Complete activity history
- **Auto-refresh**: Updates every 30 seconds

#### **Complaint Management**
- **Status Updates**: Change status (auto-sends WhatsApp notification)
- **Priority Setting**: Mark as Low, Medium, High, or Critical
- **Agent Assignment**: Assign complaints to team members
- **Add Notes**: Notes automatically sent to users via WhatsApp
- **Send Images**: Share reference images with complainants

### 🤖 AI & Automation
- **Auto-Categorization**: Gemini AI categorizes fraud types
- **Chat Assistant**: Answers cyber safety questions
- **Smart Notifications**: Context-aware WhatsApp messages
- **Document Analysis**: AI-powered evidence review (optional)

### 🔐 Security & Storage
- **Secure Storage**: Cloudinary for encrypted document storage
- **MongoDB**: Robust data persistence with indexing
- **Environment Variables**: Sensitive credentials protected
- **Session Management**: Secure user state tracking
- **Audit Trail**: Complete timeline of all actions

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
node index_1930.js
```

2. **Configure Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- MongoDB URI
- Twilio WhatsApp credentials
- Cloudinary credentials
- Gemini API key

3. **Start Backend Server**
```bash

```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```node .\index_1930.js

2. **Configure API Base**
Create `.env` in frontend:
```
VITE_API_BASE=http://localhost:3001
```

3. **Start Frontend**
```bash
  node index_1930.js
```

## 📱 WhatsApp Commands

### User Commands

| Command | Description | Example |
|---------|-------------|---------|
| `hi` / `hello` | Welcome menu | `hi` |
| `MENU` | Show main menu | `MENU` |
| `REPORT <desc>` | File a report | `REPORT I received phishing email` |
| `STATUS <id>` | Check report status | `STATUS 6756abc123def456` |
| `AWARENESS <topic>` | Get safety tips | `AWARENESS Phishing` |
| `CHAT <message>` | AI assistant | `CHAT How to protect passwords?` |
| `CONTACT` | Emergency contacts | `CONTACT` |
| `HELP` | View all commands | `HELP` |

### Number Shortcuts
- `1` - Report crime
- `2` - Check status
- `3` - Cyber awareness
- `4` - Chat with AI
- `5` - Emergency contacts
- `6` - Help menu

## 🎯 How It Works

### User Flow
1. User sends "hi" to WhatsApp bot
2. Bot shows interactive menu
3. User selects option or uses command
4. Can attach images with reports
5. Receives instant confirmation with Report ID
6. Gets updates via WhatsApp when admin takes action

### Admin Flow
1. Admin receives notification for new reports
2. Views report in dashboard with full timeline
3. Updates status (auto-notifies user)
4. Adds notes (auto-sends to user)
5. Sends images if needed
6. Tracks complete history

### AI Integration
- **Auto-Categorization**: Gemini AI categorizes reports
- **Chat Assistant**: Answers user queries about cyber safety
- **Awareness Content**: Provides educational information

## 🔧 API Endpoints

### Public Endpoints
- `GET /public/health` - Health check
- `POST /webhook` - Twilio WhatsApp webhook

### Admin Endpoints
- `GET /api/reports` - Get all reports
- `PATCH /api/reports/:id` - Update report status
- `POST /api/reports/:id/notes` - Add note (sends to WhatsApp)
- `POST /api/reports/:id/send-image` - Send image to user

## 📊 Database Schema

### Report Model
```javascript
{
  from: String,              // WhatsApp number
  description: String,       // Report description
  category: String,          // AI-generated category
  media: [{                  // Cloudinary URLs
    url: String,
    contentType: String,
    uploadedAt: Date
  }],
  status: String,            // Received/In Progress/Closed
  timeline: [{               // Activity history
    action: String,
    description: String,
    performedBy: String,
    timestamp: Date
  }],
  notes: [{                  // Admin notes
    content: String,
    addedBy: String,
    addedAt: Date
  }],
  conversation: [{           // AI chat history
    from: String,
    message: String,
    timestamp: Date
  }]
}
```

## 🌟 Key Technologies

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **WhatsApp**: Twilio API
- **AI**: Google Gemini AI
- **Storage**: Cloudinary
- **Frontend**: React, Vite
- **Styling**: Inline CSS with modern design

## 📝 Environment Variables Required

### Backend
```
MONGODB_URI=mongodb://localhost:27017/cybercrime-db
PORT=3001
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP=whatsapp:+your_number
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
```

### Frontend
```
VITE_API_BASE=http://localhost:3001
```

## 🎨 UI Features

- Modern gradient design
- Responsive layout
- Real-time statistics
- Modal for detailed report view
- Timeline visualization
- Interactive forms
- Auto-refresh functionality

## 🔔 Notification System

### User Notifications (WhatsApp)
- New report confirmation
- Status updates
- Admin notes
- Images from admin

### Admin Notifications (WhatsApp)
- New report alerts
- Category information
- User details

## 🛠️ Development

```bash
# Backend development
cd backend
npm run dev

# Frontend development
cd frontend
npm run dev
```

## 🚦 Getting API Keys

1. **Twilio**: https://www.twilio.com/
2. **Cloudinary**: https://cloudinary.com/
3. **Google Gemini**: https://makersuite.google.com/app/apikey
4. **MongoDB**: https://www.mongodb.com/cloud/atlas

## 📖 Usage Tips

- Test WhatsApp integration in Twilio Sandbox first
- Use Cloudinary's free tier for image storage
- Monitor Gemini API usage limits
- Keep admin WhatsApp number updated

## 🎯 Future Enhancements

- Multi-language support
- Voice message handling
- PDF report generation
- Analytics dashboard
- Email notifications
- SMS fallback

## 🤝 Support

For issues or questions, refer to the documentation or check the logs in the backend terminal.

---

**Built with ❤️ for CyberCrime Awareness and Prevention**



** For Reference Check **




![WhatsApp Image 2025-11-14 at 18 20 31_3aa7917b](https://github.com/user-attachments/assets/2f855d19-686a-4a89-ae7a-686630e125fb)


