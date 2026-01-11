# Job Tracker Chrome Extension

A Chrome extension that allows you to quickly save job titles and links directly to a Google Sheet.



https://github.com/user-attachments/assets/a2992ef8-1d52-4c19-827a-ee51078192cf



## Features

- ✅ Simple popup interface to input job title and link
- ✅ Automatically appends data to your Google Sheet
- ✅ Adds timestamp for each entry
- ✅ OAuth2 authentication with Google Sheets API
- ✅ Stores your sheet ID for easy reuse

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required fields (app name, user support email, developer email)
   - Add scope: `https://www.googleapis.com/auth/spreadsheets`
   - Add your email as a test user
4. Create OAuth client ID:
   - Application type: **Chrome Extension**
   - Name: Job Tracker Extension
   - Copy the **Client ID** (you'll need this)

### Step 3: Update the Extension

1. Open `manifest.json`
2. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID:
   ```json
   "oauth2": {
     "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/spreadsheets"
     ]
   }
   ```

### Step 4: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Make sure the first sheet is named "Sheet1" (or update the code)
4. Optional: Add headers in the first row:
   - Column A: Job Title
   - Column B: Job Link
   - Column C: Timestamp
5. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Copy the `SPREADSHEET_ID` part

### Step 5: Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `job-tracker-extension` folder
5. The extension should now appear in your extensions list

### Step 6: Configure the Extension

1. Click the extension icon in Chrome toolbar
2. In the popup:
   - Enter your Google Sheet ID in the "Google Sheet ID" field
   - Click "Save Sheet ID"
   - Click "Authorize Google Sheets" and sign in with your Google account
   - Grant the necessary permissions

## Usage

1. Click the extension icon
2. Enter the job title (e.g., "Software Engineer")
3. Enter the job link (e.g., "https://example.com/job")
4. Click "Save to Google Sheet"
5. The data will be appended to your Google Sheet with a timestamp

## File Structure

```
job-tracker-extension/
├── manifest.json       # Extension configuration
├── popup.html          # User interface
├── popup.js            # Main functionality
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

## Troubleshooting

### "Please set up your Sheet ID first"
- Make sure you've entered and saved your Google Sheet ID in the extension popup

### "Please authorize Google Sheets access first"
- Click the "Authorize Google Sheets" button and complete the OAuth flow

### "Authorization expired"
- Click "Authorize Google Sheets" again to refresh your access token

### "Failed to save to sheet"
- Verify your Sheet ID is correct
- Make sure the sheet is named "Sheet1" or update the code to match your sheet name
- Check that the Google Sheets API is enabled in your Google Cloud project

### Extension not appearing
- Make sure Developer mode is enabled in `chrome://extensions/`
- Try reloading the extension

## Customization

### Change Sheet Name
In `popup.js`, modify this line to match your sheet name:
```javascript
`https://sheets.googleapis.com/v4/spreadsheets/${result.sheetId}/values/Sheet1!A:C:append?valueInputOption=USER_ENTERED`
```

### Add More Fields
1. Add input fields in `popup.html`
2. Update the `values` array in `popup.js`:
```javascript
const values = [[jobTitle, jobLink, timestamp, additionalField]];
```

### Change Column Range
Update the range in the API URL (currently `Sheet1!A:C`):
```javascript
/values/Sheet1!A:D:append  // For columns A through D
```

## Privacy & Security

- This extension only requests permission to access Google Sheets API
- Your authentication token is stored locally in Chrome's storage
- No data is sent to any third-party servers
- All data goes directly from the extension to your Google Sheet

## License

This project is provided as-is for personal use.
