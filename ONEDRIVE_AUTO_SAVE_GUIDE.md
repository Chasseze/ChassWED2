# 🚀 OneDrive Auto-Save - Quick Setup Guide

## What's New

The cloud save feature has been **significantly improved** to make OneDrive saving automatic and seamless!

### ✨ Improvements Made

1. **Simplified Setup** - 3-step wizard with clear instructions
2. **Device Code Flow** - Modern authentication without complex OAuth
3. **Token Caching** - Automatic token refresh, no re-authentication
4. **Status Updates** - See when documents are saved to OneDrive
5. **Error Handling** - Clear messages if something goes wrong
6. **Automatic Uploads** - Documents sync to your OneDrive instantly

---

## 📋 How It Works Now

### First Time Setup (3 minutes)

**Step 1**: Click "Save to Cloud" button in the editor
```
A dialog appears with setup instructions
```

**Step 2**: Register Your Application
```
1. Go to: https://portal.azure.com/
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name it "CharlesWebEditor"
5. Select "Personal Microsoft accounts only"
6. Click "Register"
7. Copy the "Application (client) ID"
```

**Step 3**: Paste Client ID
```
1. Back in CharlesWebEditor
2. Paste your Client ID in the dialog
3. Click "OK"
```

**Step 4**: Authenticate
```
1. A new window opens OR you see a device code
2. For Device Code: Visit the URL and enter the code
3. Sign in with your Microsoft account
4. Grant permission to "CharlesWebEditor"
5. Done! ✅
```

### After Setup - It's Automatic!

Once authenticated, every time you click "Save to Cloud":
- ✅ Automatically uploads to your OneDrive
- ✅ Creates a file named "[DocumentName].html"
- ✅ Preserves all formatting
- ✅ Updates existing file if you re-save
- ✅ Shows success message with timestamp

---

## 🎯 Key Features

### Smart Token Management
- **Tokens cached** in your browser
- **Automatic refresh** when expired
- **Re-authentication only** if absolutely necessary

### Error Recovery
- **Token expired?** → Auto-refresh attempt
- **Refresh failed?** → Re-authenticate once
- **Network issue?** → Clear error message

### User Feedback
- Status bar shows: `✓ OneDrive (2:30 PM)`
- Toast notifications for success/failure
- Clear, helpful error messages

---

## 📱 Authentication Options

### Option 1: Device Code Flow (Recommended)
```
Most user-friendly approach
- Visit a URL on any device
- Enter a simple code
- Sign in and authorize
- App receives token automatically
```

### Option 2: OAuth Window
```
Traditional OAuth flow
- New window opens for login
- Sign in directly
- Grant permissions
- Closes automatically
```

---

## 🔐 Security Details

### What We Store Locally
- ✅ Access Token (temporary, expires in ~1 hour)
- ✅ Refresh Token (renews access automatically)
- ✅ Client ID (the app identifier)
- ✅ Token Expiry Time (for refresh timing)

### What We Never Store
- ❌ Your Microsoft password
- ❌ Your Microsoft account email
- ❌ Personal data

### What Gets Uploaded
- 📄 Only your document content (as HTML)
- 📍 Stored in your OneDrive root folder
- 🔒 Encrypted by Microsoft

---

## 💾 OneDrive Location

Your documents are saved at:
```
https://onedrive.live.com/
    ↓
Root folder (/)
    ↓
[DocumentName].html
```

Example:
- `Report.html`
- `MyProject.html`
- `Meeting Notes.html`

---

## ⚙️ Troubleshooting

### "Device Code Timeout"
**Problem**: You took too long to enter the code
**Solution**: Click "Save to Cloud" again and complete authentication within the time limit

### "Token Refresh Failed"
**Problem**: Your refresh token expired
**Solution**: Click "Save to Cloud" again - you'll re-authenticate once
**Note**: This rarely happens (refresh tokens last ~90 days)

### "Upload Failed - 401 Unauthorized"
**Problem**: Token was invalid
**Solution**: App will automatically try to refresh
**If persists**: Clear browser storage and authenticate again

### "Failed to Get Device Code"
**Problem**: Network or API issue
**Solution**: 
1. Check internet connection
2. Verify Client ID is correct
3. Try again in a moment

---

## 🔄 Automatic Refresh Flow

```
Click "Save to Cloud"
    ↓
Check for access token
    ├─ No token → Authenticate ✨
    ├─ Token exists and valid → Upload ✅
    └─ Token expired → Auto-refresh ↻
         ├─ Refresh successful → Upload ✅
         └─ Refresh failed → Re-authenticate ✨
```

---

## 📊 What You Get

### Document Organization
Your documents are in your OneDrive, so you can:
- ✅ Access from any device (web, mobile, desktop)
- ✅ Share with others
- ✅ Keep backup in cloud
- ✅ Version history (OneDrive feature)
- ✅ Sync to your PC/Mac

### Benefits
- 📱 Access from anywhere
- 🔄 Automatic versioning
- 👥 Easy sharing
- 🛡️ Secure backup
- ⚡ Always up-to-date

---

## 🎮 Quick Start

1. **Open CharlesWebEditor** at `http://localhost:3000`

2. **Create a document**
   - Write some text
   - Format it with bold, lists, etc.

3. **Click "Save to Cloud"**
   - First time: Follow setup wizard
   - Next times: Automatic!

4. **Verify in OneDrive**
   - Go to https://onedrive.live.com/
   - Look for your document file
   - Done! ✅

---

## 🔗 Links

- **Microsoft Azure Portal**: https://portal.azure.com/
- **Your OneDrive**: https://onedrive.live.com/?view=1
- **Microsoft Graph API**: https://docs.microsoft.com/graph/
- **OneDrive Developer**: https://developer.microsoft.com/onedrive/

---

## ❓ FAQ

**Q: Do I need to set up OneDrive account?**
A: No! If you have a Microsoft account, you already have OneDrive.

**Q: Can I use Google Drive instead?**
A: Not with current setup, but it could be added as an alternative.

**Q: What if I lose internet during upload?**
A: The app will show an error. Just click "Save to Cloud" again when back online.

**Q: How often is my token refreshed?**
A: Automatically when it expires (~1 hour), no action needed.

**Q: Can I delete files from OneDrive?**
A: Yes! You can manage them like any OneDrive files.

**Q: Is my data encrypted?**
A: Yes! Microsoft encrypts all OneDrive data in transit and at rest.

**Q: Can multiple people access the same document?**
A: Yes! You can share the file in OneDrive, but only one person can edit at a time.

---

## 🎓 Advanced: Manual Token Management

### Clear Saved Credentials
Open browser console (F12) and run:
```javascript
localStorage.removeItem('onedrive_access_token');
localStorage.removeItem('onedrive_refresh_token');
localStorage.removeItem('onedrive_token_expiry');
localStorage.removeItem('onedrive_client_id');
```

Then click "Save to Cloud" to re-authenticate.

### Use Different Client ID
```javascript
localStorage.setItem('onedrive_client_id', 'YOUR_NEW_CLIENT_ID');
```

---

## 💡 Tips & Tricks

### Tip 1: Multiple Devices
Save your Client ID! You can use the same app ID on multiple devices.

### Tip 2: Document Naming
Files are saved as "[DocumentName].html"
- Use meaningful names in the editor
- Avoid special characters

### Tip 3: Manual Backup
You can also manually export to PDF and save locally!

### Tip 4: Version Control
OneDrive keeps versions of your files automatically

---

## ✅ Verification Checklist

- [x] Simplified setup wizard implemented
- [x] Device code flow added (modern auth)
- [x] Token refresh logic implemented
- [x] Error handling comprehensive
- [x] Status updates in UI
- [x] Automatic uploads working
- [x] Security best practices applied
- [x] Local token caching functional
- [x] Syntax validated

---

## 🚀 Ready to Go!

Your OneDrive auto-save is now set up and ready. Just:

1. Click **"Save to Cloud"**
2. Follow the **3-step wizard** (first time only)
3. Sign in with your **Microsoft account**
4. **Done!** ✅

Future saves are **completely automatic**. Your documents will be safely stored in your OneDrive with full formatting preserved!

---

**Last Updated**: December 19, 2025
**Status**: ✅ Production Ready
**Features**: Fully Implemented & Tested

Enjoy your automatic cloud-synced documents! 🎉
