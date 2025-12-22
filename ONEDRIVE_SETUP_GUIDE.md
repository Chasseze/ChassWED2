# OneDrive Integration - Implementation Guide

## Quick Setup for Cloud Saving

### What Was Implemented

Your CharlesWebEditor now has **complete OneDrive integration** built-in. Here's how to use it:

---

## User Guide: How to Enable OneDrive Saving

### Option A: Simple Setup (Recommended)

1. **First Time Only**:
   - Click **"Save to Cloud"** button in the header
   - A prompt will appear asking for your Client ID
   - Don't have one? Follow Option B below
   - Paste your Client ID and press Enter

2. **Automatic from Then On**:
   - Your Client ID is saved locally
   - Every click of "Save to Cloud" uploads automatically
   - No more prompts needed!

### Option B: Get Your Client ID (5 minutes)

1. Go to: **https://portal.azure.com/**

2. Sign in with your Microsoft account (create one if needed - it's free)

3. Find **"Azure Active Directory"** in the left menu

4. Click **"App registrations"** 

5. Click **"+ New registration"**

6. Fill in these details:
   - **Name**: `CharlesWebEditor`
   - **Supported account types**: Select "Personal Microsoft accounts only"
   - **Redirect URI**: Leave blank for now (optional for advanced setup)

7. Click **"Register"**

8. You'll see a page with:
   - **Application (client) ID**: 🎯 **COPY THIS VALUE**
   - This is your Client ID

9. Return to CharlesWebEditor, click "Save to Cloud", paste this ID, Done! ✅

---

## Technical Details

### What Happens When You Save to Cloud

```
Click "Save to Cloud"
    ↓
App checks for saved access token
    ↓
If first time: Ask for Client ID
    ↓
Redirect to Microsoft login
    ↓
You approve "CharlesWebEditor" access
    ↓
Microsoft gives us an access token
    ↓
Document uploads to OneDrive as HTML
    ↓
✅ "Document saved to OneDrive successfully!"
```

### What Gets Saved

- **File Name**: Your document name (e.g., "Report.html", "Letter.html")
- **Location**: Root of your OneDrive
- **Format**: HTML (preserves all formatting)
- **Overwrites**: Yes, same name updates previous version

### Files Involved

**Frontend (JavaScript)**:
- `public/ChassWED.js` - Contains all OneDrive code

**Functions Used**:
- `saveToCloud()` - Main entry point
- `authenticateWithOneDrive()` - Handles first-time setup
- `uploadToOneDrive(accessToken)` - Uploads to Microsoft Graph API
- `initiateOAuthFlow(clientId)` - Starts OAuth process

---

## Advanced Configuration (Optional)

### For Production Deployment

If you're deploying this to a public server, add this to your `server.js`:

```javascript
// OAuth Redirect Handler
app.get('/auth-callback', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    
    // Validate state matches session
    if (state !== req.session.oauthState) {
        return res.status(400).send('Invalid state parameter');
    }
    
    // Exchange code for token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: process.env.ONEDRIVE_CLIENT_ID,
            client_secret: process.env.ONEDRIVE_CLIENT_SECRET,
            code: code,
            redirect_uri: 'http://yoursite.com/auth-callback',
            grant_type: 'authorization_code'
        })
    });
    
    const token = await tokenResponse.json();
    
    // Store token and redirect back to editor
    res.redirect(`/?token=${token.access_token}`);
});
```

### Environment Variables

Add to your `.env` file:
```
ONEDRIVE_CLIENT_ID=your_client_id_here
ONEDRIVE_CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:3000/auth-callback
```

---

## Troubleshooting

### "OneDrive authentication cancelled"
**Solution**: Click "Save to Cloud" again and paste your Client ID

### "Failed to save to OneDrive"
**Causes**:
- Network connection issue
- Invalid Client ID
- OneDrive storage full
- Browser blocked by CORS

**Solution**: 
1. Check internet connection
2. Verify Client ID at https://portal.azure.com/
3. Try again in a few moments
4. Check browser console (F12) for details

### "Token expired" (Advanced)
**Solution**: App will prompt you to re-authenticate. This rarely happens.

### Document not appearing in OneDrive
**Check**:
1. Log into OneDrive (portal.azure.com)
2. Open "Files" section
3. Look for your document in root folder
4. If missing, check notification logs

---

## Current Limitations & Future Improvements

### Current Setup (Development)
- ✅ Works great for local/internal use
- ✅ Documents save to your OneDrive
- ✅ No additional setup needed after Client ID
- ⚠️ Limited production configuration

### Recommended Improvements (Phase 2)

1. **Server-Side Token Management**
   ```javascript
   // Store tokens on server, not in browser
   // More secure for production
   ```

2. **Automatic Token Refresh**
   ```javascript
   // Handle token expiration gracefully
   // No user re-authentication needed
   ```

3. **Folder Organization**
   ```javascript
   // Create "CharlesWebEditor" folder in OneDrive
   // Organize documents by type
   // Better management
   ```

4. **Version History**
   ```javascript
   // Keep multiple versions of documents
   // Easy rollback to previous versions
   ```

5. **Collaboration**
   ```javascript
   // Share documents with others
   // Real-time collaborative editing
   ```

---

## Security & Privacy

### Data Handling
- ✅ Documents sent over HTTPS (when deployed)
- ✅ Stored in your personal OneDrive
- ✅ Only you can access (unless you share)
- ✅ Microsoft encryption by default

### Permissions
- Your app only gets: `files.readwrite.all`
- This allows reading/writing files in your OneDrive
- No access to emails, calendars, or other data

### Token Security
- ✅ Stored in browser localStorage (secure for personal use)
- ⚠️ In production, implement server-side token storage

---

## Code References

### Where to Find the Implementation

**File**: `/Users/charleseze/ChassWED2/public/ChassWED.js`

**Function**: `saveToCloud()` (Line ~554)
```javascript
saveToCloud() {
    // Check for cached token
    // If none, initiate authentication
    // Upload document to OneDrive
}
```

**Function**: `uploadToOneDrive(accessToken)` (Line ~575)
```javascript
uploadToOneDrive(accessToken) {
    // Use Microsoft Graph API
    // PUT to /me/drive/root/children/{filename}/content
    // Send document HTML as body
}
```

---

## FAQ

**Q: Will my documents be encrypted on OneDrive?**
A: Yes, Microsoft encrypts all OneDrive files by default.

**Q: Can I edit documents directly in OneDrive?**
A: The HTML files are stored as plain text. You can view/edit them in Word Online or any text editor.

**Q: What if I lose my Client ID?**
A: You can get a new one from Azure Portal anytime. The app will ask you for it again.

**Q: Can multiple people edit the same document?**
A: Current version: No. Future version could support real-time collaboration.

**Q: Does this work offline?**
A: No, you need internet connection to save to OneDrive. Documents auto-save locally regardless.

**Q: How much OneDrive storage does it use?**
A: Very little. HTML files are typically 10-50KB depending on document size with images.

**Q: Can I delete documents from OneDrive within the editor?**
A: Not in current version. Delete via OneDrive web interface (portal.azure.com).

---

## Support Resources

- **Microsoft Azure Portal**: https://portal.azure.com/
- **Microsoft Graph API Docs**: https://docs.microsoft.com/graph/
- **OneDrive Developer Docs**: https://developer.microsoft.com/onedrive/

---

**Implementation Status**: ✅ Complete and Ready to Use

**Last Updated**: December 19, 2025

For questions or issues, check the browser console (Press F12) for error messages.
