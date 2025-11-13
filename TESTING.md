# 🧪 Testing Guide

## WhatsApp Bot Testing

### Basic Commands

#### 1. Welcome/Greeting
```
Input: hi
Expected: Welcome menu with options 1-6
```

#### 2. Help Command
```
Input: HELP
Expected: List of all available commands with examples
```

#### 3. Menu Navigation
```
Input: MENU
Expected: Main menu with numbered options
```

### Reporting Features

#### 4. Text-Only Report
```
Input: REPORT I received a phishing email asking for my bank details
Expected: 
- Confirmation message
- Report ID
- Category (auto-detected by AI)
- Status check instructions
```

#### 5. Report with Image
```
Input: REPORT Suspicious payment request
Attachment: Screenshot image
Expected:
- Image uploaded to Cloudinary
- Report created with media
- Admin notified
```

#### 6. Image-Only Report
```
Input: (no text)
Attachment: Screenshot
Expected:
- Image received confirmation
- Report ID
- Prompt to add description
```

#### 7. Check Status
```
Input: STATUS 6756abc123def456
Expected:
- Report details
- Current status
- Description
- Timestamps
- Latest admin notes (if any)
```

### AI Features

#### 8. Cyber Awareness
```
Input: AWARENESS Phishing
Expected: Educational content about phishing
```

```
Input: AWARENESS
Expected: List of topics to choose from
```

#### 9. AI Chat Assistant
```
Input: CHAT How can I identify phishing emails?
Expected: Detailed AI-generated response about phishing identification
```

```
Input: CHAT What should I do if I'm hacked?
Expected: Step-by-step guidance from AI
```

### Information Commands

#### 10. Emergency Contacts
```
Input: CONTACT
Expected: 
- Helpline numbers
- Safety tips
- Emergency contacts
```

#### 11. Number Shortcuts
```
Input: 1
Expected: Report instruction

Input: 2
Expected: Status check instruction

Input: 3
Expected: Awareness topics

Input: 4
Expected: AI chat prompt

Input: 5
Expected: Contact information

Input: 6
Expected: Help menu
```

## Admin Dashboard Testing

### Dashboard Overview

#### 1. Statistics Cards
- Verify total reports count
- Check "Received" count
- Check "In Progress" count
- Check "Closed" count

#### 2. Reports Table
- All reports visible
- Correct data display
- Images show thumbnails
- Status badges colored correctly

### Report Management

#### 3. Status Update
1. Select new status from dropdown
2. Click to update
3. Verify:
   - Status updated in dashboard
   - User receives WhatsApp notification
   - Timeline entry added

#### 4. View Details
1. Click "View Details" button
2. Verify modal shows:
   - Complete report information
   - Media gallery
   - Timeline
   - Admin notes
   - Action forms

#### 5. Add Note
1. Open report details
2. Enter note in textarea
3. Click "Send Note to User"
4. Verify:
   - Note added to report
   - Timeline updated
   - User receives WhatsApp message
   - Note appears in UI

#### 6. Send Image
1. Open report details
2. Enter image URL
3. Add optional message
4. Click "Send Image to User"
5. Verify:
   - User receives WhatsApp message with image
   - Timeline updated

### Timeline Testing

#### 7. Timeline Entries
Check timeline shows:
- Report created
- Status changes
- Notes added
- Images sent
- Correct timestamps
- Proper performer (user/admin)

## Integration Testing

### End-to-End Flow

#### Scenario 1: Complete Report Cycle
1. **User**: Send "hi" to WhatsApp
2. **Bot**: Sends welcome menu
3. **User**: Send "REPORT Fake job offer scam"
4. **Bot**: Confirms report with ID
5. **Admin**: Views new report in dashboard
6. **Admin**: Updates status to "In Progress"
7. **User**: Receives status update via WhatsApp
8. **Admin**: Adds note "We are investigating"
9. **User**: Receives note via WhatsApp
10. **Admin**: Updates status to "Closed"
11. **User**: Receives closure notification
12. **User**: Send "STATUS <id>"
13. **Bot**: Shows complete report details

#### Scenario 2: Image Upload Flow
1. **User**: Send image with "REPORT Check this screenshot"
2. **System**: Uploads to Cloudinary
3. **Bot**: Confirms with report ID
4. **Admin**: Views image in dashboard (Cloudinary URL)
5. **Admin**: Clicks image to view full size

#### Scenario 3: AI Assistance Flow
1. **User**: Send "CHAT How to protect my passwords?"
2. **System**: Calls Gemini AI
3. **Bot**: Returns AI-generated advice
4. **User**: Send "AWARENESS Ransomware"
5. **System**: Calls Gemini AI
6. **Bot**: Returns educational content

## API Testing

### Using Postman/curl

#### Get All Reports
```bash
curl http://localhost:3001/api/reports
```

#### Update Report Status
```bash
curl -X PATCH http://localhost:3001/api/reports/REPORT_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'
```

#### Add Note
```bash
curl -X POST http://localhost:3001/api/reports/REPORT_ID/notes \
  -H "Content-Type: application/json" \
  -d '{"note": "Investigation started"}'
```

#### Send Image
```bash
curl -X POST http://localhost:3001/api/reports/REPORT_ID/send-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg", "message": "Please review"}'
```

## Error Handling Testing

### Invalid Commands
```
Input: INVALID_COMMAND
Expected: "I didn't understand... Send MENU"
```

### Invalid Status Check
```
Input: STATUS invalid_id
Expected: "No report found with ID: invalid_id"
```

### Empty Report
```
Input: REPORT
Expected: "(no description provided)" saved
```

### Network Errors
- Disconnect internet
- Attempt to load dashboard
- Verify error message displayed

## Performance Testing

### Load Testing
1. Create 50+ test reports
2. Check dashboard loads smoothly
3. Verify auto-refresh works
4. Test modal with large timeline

### Image Testing
1. Upload large images (5MB+)
2. Verify Cloudinary handles compression
3. Check thumbnail generation
4. Test multiple images per report

## Security Testing

### Environment Variables
- Verify .env not committed to git
- Check credentials not exposed in logs
- Validate API keys are secure

### Input Validation
- Test with special characters
- Try SQL injection patterns
- Test XSS attempts in notes

## Automated Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] Database connection established
- [ ] Twilio webhook responds
- [ ] Cloudinary uploads work
- [ ] Gemini AI responds
- [ ] WhatsApp messages send
- [ ] Dashboard loads correctly
- [ ] Status updates work
- [ ] Notes system works
- [ ] Image sending works
- [ ] Timeline displays correctly
- [ ] Auto-refresh functions
- [ ] Modal opens/closes properly

## Common Issues & Solutions

### Issue: Bot not responding
**Solution**: 
- Check webhook URL in Twilio
- Verify ngrok is running
- Check backend logs

### Issue: Images not uploading
**Solution**:
- Verify Cloudinary credentials
- Check image URL accessibility
- Review Cloudinary quota

### Issue: AI not working
**Solution**:
- Check Gemini API key
- Verify API quota
- Review request/response logs

### Issue: WhatsApp not sending
**Solution**:
- Check Twilio credentials
- Verify phone number format
- Check Twilio balance

### Issue: Dashboard not updating
**Solution**:
- Clear browser cache
- Check API connection
- Verify backend is running

## Test Data

### Sample Reports
```javascript
{
  description: "I received a phishing email",
  category: "Phishing",
  status: "Received"
}

{
  description: "Fake payment link sent",
  category: "Online Fraud",
  status: "In Progress"
}

{
  description: "Identity theft attempt",
  category: "Identity Theft",
  status: "Closed"
}
```

### Sample Awareness Topics
- Phishing
- Ransomware
- Social Engineering
- Password Security
- Two-Factor Authentication
- Cyberbullying

### Sample Chat Questions
- "How to identify fake emails?"
- "What is ransomware?"
- "How to protect my social media?"
- "What to do if hacked?"

---

**Testing Complete? ✅**

All features working as expected!
