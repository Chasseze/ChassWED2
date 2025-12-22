# Google Drive Integration Guide - CharlesWebEditor

## 🎯 Overview

This guide will walk you through setting up Google Drive cloud storage for CharlesWebEditor. Once configured, you'll be able to automatically save your documents to Google Drive with a single click.

---

## ⚠️ Important Notice

**Google OAuth for Client-Side Applications**

Google Drive integration in CharlesWebEditor uses OAuth 2.0 authentication. Due to security requirements, there are some limitations:

1. **Client Secret Not Required**: For browser-based apps, Google allows OAuth without a client secret
2. **Redirect URI**: Must match exactly what you configure in Google Cloud Console
3. **First-Time Setup**: You'll need to create a Google Cloud Project and enable the Drive API

---

## 📋 Prerequisites

- A Google Account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your CharlesWebEditor running (either locally or deployed)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter a project name (e.g., "CharlesWebEditor")
5. Click **"Create"**
6. Wait for the project to be created (this may take a few seconds)

### Step 2: Enable Google Drive API

1. Make sure your new project is selected in the dropdown
2. Click the **☰ menu** → **"APIs & Services"** → **"Library"**
3. In the search bar, type **"Google Drive API"**
4. Click on **"Google Drive API"** from the results
5. Click the **"Enable"** button
6. Wait for the API to be enabled

### Step 3: Configure OAuth Consent Screen

1. Click **☰ menu** → **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `CharlesWebEditor` (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
7. Find and select:
   - `.../auth/drive.file` (View and manage Google Drive files created by this app)
8. Click **"Update"** then **"Save and Continue"**
9. On the **Test users** page, click **"Add Users"**
10. Add your Google email address
11. Click **"Save and Continue"**
12. Review and click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Click **☰ menu** → **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** at the top
3. Select **"OAuth 2.0 Client ID"**
4. Select **Application type**: **"Web application"**
5. Enter a name (e.g., "CharlesWebEditor Client")
6. Under **"Authorized JavaScript origins"**, click **"+ Add URI"**
   - If running locally: `http://localhost:3000` (or your port)
   - If deployed: `https://yourdomain.com`
7. Under **"Authorized redirect URIs"**, click **"+ Add URI"**
   - Enter the SAME URI as above (without any path)
   - Example: `http://localhost:3000` or `https://yourdomain.com`
8. Click **"Create"**
9. A popup will appear with your credentials

### Step 5: Copy Your Client ID

1. From the popup, **copy the Client ID** (it looks like: `123456789-abcdefgh.apps.googleusercontent.com`)
2. You can ignore the Client Secret (it's not needed for browser apps)
3. Click **"OK"** to close the popup
4. ✅ Keep this Client ID handy - you'll need it in the next step

---

## 🔧 Using Google Drive in CharlesWebEditor

### First-Time Authentication

1. Open CharlesWebEditor in your browser
2. Click the **"Google Drive"** button in the header toolbar
3. A dialog will appear asking for your Client ID
4. Paste the Client ID you copied earlier
5. Click **"OK"**
6. A new window will open asking you to sign in to Google
7. Select your Google account
8. Click **"Allow"** to grant permissions
9. The authentication window will close automatically
10. You'll see a success message: "✅ Google Drive authentication successful!"

### Saving Documents to Google Drive

Once authenticated, saving is simple:

1. Edit your document in CharlesWebEditor
2. Click the **"Google Drive"** button in the header
3. Your document will be uploaded automatically
4. You'll see: "✅ Document saved to Google Drive successfully!"

The document will be saved as an HTML file in your Google Drive.

---

## 🔑 Token Management

CharlesWebEditor stores authentication tokens in your browser's localStorage:

- **Access Token**: Valid for 1 hour
- **Refresh Token**: Used to get new access tokens automatically
- **Token Expiry**: Tracks when the access token expires

When the access token expires, the app will automatically:
1. Use the refresh token to get a new access token
2. Upload your document without requiring re-authentication

---

## 🗂️ Where Are My Files Stored?

Your documents are saved to your Google Drive root directory with the filename format:
```
[Document Name].html
```

For example, if your document is named "My Essay", it will be saved as `My Essay.html`.

You can view and download these files from [Google Drive](https://drive.google.com/).

---

## 🔒 Security & Privacy

### What Data Is Stored?

- **Client ID**: Stored in browser localStorage (not sensitive)
- **Access Token**: Stored in browser localStorage (expires after 1 hour)
- **Refresh Token**: Stored in browser localStorage (used to renew access)

### What Permissions Does the App Have?

The app requests the `drive.file` scope, which means:
- ✅ Can create new files
- ✅ Can update files it created
- ❌ Cannot access files created by other apps
- ❌ Cannot access your entire Google Drive
- ❌ Cannot delete files

### Is My Data Secure?

- All authentication happens through Google's official OAuth flow
- Tokens are stored locally in your browser (never sent to a server)
- The app uses HTTPS for all API calls to Google
- Your document content is only uploaded when you click "Save to Google Drive"

---

## 🐛 Troubleshooting

### "Authentication failed. Please try again."

**Possible causes:**
1. Client ID was entered incorrectly
2. OAuth consent screen not configured properly
3. Redirect URI doesn't match

**Solutions:**
- Double-check your Client ID
- Ensure redirect URI in Google Console matches your app's URL exactly
- Clear browser localStorage and try again:
  ```javascript
  // Open browser console (F12) and run:
  localStorage.removeItem('gdrive_client_id');
  localStorage.removeItem('gdrive_access_token');
  localStorage.removeItem('gdrive_refresh_token');
  ```

### "Failed to save to Google Drive. Check console for details."

**Possible causes:**
1. Access token expired and refresh failed
2. Network connectivity issues
3. Google Drive API disabled

**Solutions:**
- Check browser console (F12) for detailed error messages
- Re-authenticate by clicking the Google Drive button again
- Verify Google Drive API is enabled in Cloud Console

### "This app isn't verified"

When using OAuth with an "External" app in testing mode, Google shows a warning screen.

**To proceed:**
1. Click "Advanced"
2. Click "Go to [Your App Name] (unsafe)"
3. Click "Allow"

**To remove this warning (optional):**
1. Submit your app for Google's verification process
2. Or use "Internal" user type if you have Google Workspace

### Authentication Window Closes Immediately

**Possible causes:**
1. Popup blocker is preventing the window from opening
2. Redirect URI mismatch

**Solutions:**
- Allow popups for CharlesWebEditor in your browser
- Check that redirect URI in Google Console matches exactly

### Token Expired Messages

If you see frequent token expiration messages:

**Solutions:**
- This is normal behavior (tokens expire after 1 hour)
- The app should automatically refresh - if not, re-authenticate
- Ensure refresh token is being stored properly

---

## 🔄 Re-authentication

If you need to re-authenticate (e.g., after clearing browser data):

1. Click the **"Google Drive"** button
2. The setup dialog will appear again
3. Enter your Client ID (or it may be remembered)
4. Complete the authentication flow again

---

## 🗑️ Removing Google Drive Integration

To disconnect Google Drive from CharlesWebEditor:

1. Open browser console (F12)
2. Run these commands:
   ```javascript
   localStorage.removeItem('gdrive_client_id');
   localStorage.removeItem('gdrive_access_token');
   localStorage.removeItem('gdrive_refresh_token');
   localStorage.removeItem('gdrive_token_expiry');
   localStorage.removeItem('gdrive_oauth_state');
   ```
3. Reload the page
4. (Optional) Revoke app access in your [Google Account settings](https://myaccount.google.com/permissions)

---

## 📝 Notes & Limitations

### Client-Side OAuth Limitations

Since this is a client-side application:
- **No Client Secret**: Browser apps don't use client secrets (this is normal)
- **CORS**: All requests go directly to Google's APIs (no proxy needed)
- **Token Storage**: Tokens stored in localStorage (cleared when you clear browser data)

### File Format

Documents are saved as HTML files, which means:
- ✅ Preserves all formatting (bold, italic, colors, etc.)
- ✅ Can be opened in any web browser
- ❌ Not in Microsoft Word format (.docx)
- 💡 Use the "Export to DOCX" feature for Word-compatible files

### Rate Limits

Google Drive API has rate limits:
- **Queries per day**: 1,000,000,000 (extremely high)
- **Queries per 100 seconds per user**: 1,000
- For normal use, you won't hit these limits

---

## 🆘 Getting Help

If you're still having issues:

1. **Check Browser Console**: Press F12 and look for error messages
2. **Verify Setup**: Go through each step of the setup guide again
3. **Test Credentials**: Make sure the Client ID is copied correctly
4. **Check Google Cloud Console**: Ensure APIs are enabled and credentials are active

---

## 🎓 Advanced: Server-Side Implementation

For production use, consider implementing server-side OAuth:

**Benefits:**
- More secure token handling
- Can use client secret
- Better error handling
- Token refresh more reliable

**Implementation:**
1. Create a backend endpoint to handle OAuth
2. Store tokens server-side (encrypted)
3. Proxy Google Drive API calls through your server
4. Return results to the client

---

## ✅ Quick Reference

### Required Information
- **Client ID**: From Google Cloud Console
- **Redirect URI**: Your app's URL (must match exactly)
- **Scope**: `https://www.googleapis.com/auth/drive.file`

### Key Files
- All code in: `public/main.js`
- Functions: `saveToCloud()`, `authenticateWithGoogleDrive()`, `uploadToGoogleDrive()`

### localStorage Keys
```
gdrive_client_id          - Your OAuth Client ID
gdrive_access_token       - Current access token
gdrive_refresh_token      - Refresh token (for renewing access)
gdrive_token_expiry       - When access token expires
gdrive_oauth_state        - Security state parameter
gdrive_file_[docId]       - Google Drive file IDs
```

---

## 🎉 Success!

Once set up correctly, you should see:
- ✅ "Google Drive" button in the header
- ✅ Click once to save
- ✅ Success message after upload
- ✅ Files appear in your Google Drive
- ✅ Automatic re-authentication when needed

Happy editing and saving! 🚀

---

**Last Updated**: 2024  
**Version**: 1.1.0  
**Author**: CharlesWebEditor Team