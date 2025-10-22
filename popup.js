// Get DOM elements
const jobTitleInput = document.getElementById('jobTitle');
const jobLinkInput = document.getElementById('jobLink');
const saveBtn = document.getElementById('saveBtn');
const setupBtn = document.getElementById('setupBtn');
const authBtn = document.getElementById('authBtn');
const sheetIdInput = document.getElementById('sheetId');
const statusDiv = document.getElementById('status');
// const debug = document.getElementById("debug")

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    jobLinkInput.value = tabs[0].url;
  }
});

// Load saved sheet ID on popup open
chrome.storage.sync.get(['sheetId'], (result) => {
  if (result.sheetId) {
    sheetIdInput.value = result.sheetId;
  }
});

// Save sheet ID
setupBtn.addEventListener('click', () => {
  const sheetId = sheetIdInput.value.trim();
  
  if (!sheetId) {
    showStatus('Please enter a valid Sheet ID', 'error');
    return;
  }
  
  chrome.storage.sync.set({ sheetId }, () => {
    showStatus('Sheet ID saved successfully!', 'success');
  });
});

// Authorize with Google
authBtn.addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      showStatus('Authorization failed: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    
    if (token) {
      chrome.storage.local.set({ authToken: token }, () => {
        showStatus('Authorization successful!', 'success');
      });
    }
  });
});

// Save job to Google Sheet
saveBtn.addEventListener('click', async () => {
  const jobTitle = jobTitleInput.value.trim();
  const jobLink = jobLinkInput.value.trim();
  
  if (!jobTitle || !jobLink) {
    showStatus('Please fill in both fields', 'error');
    return;
  }
  
  saveBtn.disabled = true;
  showStatus('Saving...', 'info');
  
  try {
    await appendToSheet(jobTitle, jobLink);
    showStatus('Job saved successfully!', 'success');
    
    // Clear inputs
    jobTitleInput.value = '';
    jobLinkInput.value = '';
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  } finally {
    saveBtn.disabled = false;
  }
});

// Append data to Google Sheet
async function appendToSheet(jobTitle, jobLink) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['sheetId'], (result) => {
      if (!result.sheetId) {
        reject(new Error('Please set up your Sheet ID first'));
        return;
      }
      
      chrome.storage.local.get(['authToken'], async (authResult) => {
        if (!authResult.authToken) {
          reject(new Error('Please authorize Google Sheets access first'));
          return;
        }

        sheetName = "episode2"
        
        try {
          const timestamp = new Date().toLocaleString();
           // Get current data starting from row 5 to find next empty row
          const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${result.sheetId}/values/${sheetName}!B5:H`;
          const getResponse = await fetch(getUrl, {
            headers: {
              'Authorization': `Bearer ${authResult.authToken}`,
            }
          });
          
          if (!getResponse.ok) {
            const errorData = await getResponse.json();
            reject(new Error(errorData.error?.message || 'Failed to read sheet'));
            return;
          }
          
          const getData = await getResponse.json();
          const rows = getData.values || [];
          
          // Find first empty row (where both B and C are empty)
          let nextRow = 5;
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Check if both name (B) and title (C) are empty
            if (!row || !row[0] || row[0].trim() === '') {
              nextRow = 5 + i;
              break;
            }
            nextRow = 5 + i + 1; // If all rows have data, use next row
          }
          
          // Prepare values: name (B), title (C), date (D)
          const values = [[
            jobTitle,        // B: name
            jobLink,         // C: title
            timestamp        // D: date
          ]];
          
          // Write to the specific row
          const putUrl = `https://sheets.googleapis.com/v4/spreadsheets/${result.sheetId}/values/${sheetName}!B${nextRow}:D?valueInputOption=USER_ENTERED`;
          
          const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${authResult.authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: values
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            
            // If token expired, try to refresh
            if (response.status === 401) {
              chrome.identity.removeCachedAuthToken(
                { token: authResult.authToken },
                () => {
                  reject(new Error('Authorization expired. Please re-authorize.'));
                }
              );
            } else {
              reject(new Error(errorData.error?.message || 'Failed to save to sheet'));
            }
            return;
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

// Show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');
  
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 3000);
  }
}
