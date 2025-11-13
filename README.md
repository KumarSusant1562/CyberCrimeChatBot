# 🛡️ CyberCrime Helping Service - Complete System

A comprehensive cyber crime reporting system with WhatsApp integration, AI assistance, image uploads, and admin dashboard.

## ✨ Features

### 📱 WhatsApp Integration (Twilio)
- **Automated Welcome Messages**: Greet users with interactive menu
- **Menu-Based Navigation**: Numbers (1-6) or text commands
- **Real-Time Notifications**: Instant updates to users and admin

### 📋 Report Management
- **Easy Reporting**: Users can report crimes via WhatsApp
- **Image Upload Support**: Cloudinary integration for secure storage
- **AI Categorization**: Gemini AI automatically categorizes reports
- **Status Tracking**: Real-time status updates

### 🤖 AI Assistant
- **Gemini AI Integration**: Intelligent chat assistance
- **Cyber Awareness**: Educational content on cyber safety
- **Contextual Help**: Topic-based information

### 👨‍💼 Admin Dashboard
- **Timeline View**: Complete history of each report
- **Notes System**: Add notes that auto-send to users via WhatsApp
- **Image Sending**: Send reference images to users
- **Real-Time Updates**: Auto-refresh every 30 seconds
- **Status Management**: Update status with WhatsApp notifications

### 🔐 Security Features
- Secure image storage with Cloudinary
- MongoDB for data persistence
- Environment-based configuration

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
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
npm run dev
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure API Base**
Create `.env` in frontend:
```
VITE_API_BASE=http://localhost:3001
```

3. **Start Frontend**
```bash
npm run dev
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
