
# World Class Title Scheduling System

A custom-built scheduling experience for WCT integrated with Google Calendar.

## Setup Instructions

### 1. Google Cloud Configuration
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Calendar API**, **Places API**, and **Maps JavaScript API**.
3. Create a **Service Account**:
   - Go to IAM & Admin > Service Accounts.
   - Click "Create Service Account".
   - Create a JSON key and download it.
4. Enable **Domain-Wide Delegation (DWD)**:
   - Select the service account > Details > Show Domain Wide Delegation.
   - Note the **Client ID**.

### 2. Google Workspace Admin Console
1. Go to [Admin Console](https://admin.google.com/).
2. Security > API Controls > Manage Domain Wide Delegation.
3. Add New Client:
   - Client ID: (From step 1.4)
   - OAuth Scopes: `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/calendar.events`

### 3. Google Places setup
1. Enable **Maps JavaScript API** AND **Places API** in Google Cloud.
2. Ensure **Billing** is enabled for the project.
3. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel environment variables.
4. **CRITICAL: Restrict the key** under Google Cloud Credentials:
   - **Application restrictions**: HTTP referrers
   - **Allowed referrers**: 
     - `http://localhost:3000/*`
     - `https://wct-scheduler.vercel.app/*`
     - `https://*.vercel.app/*`
     - `https://worldclasstitle.com/*`
     - `https://www.worldclasstitle.com/*`
   - **API restrictions**: Restrict key to **Maps JavaScript API** and **Places API**.

### 4. Google Maps troubleshooting
If autocomplete fails to load, check these common causes:
- □ **Billing enabled**: The project MUST have a valid billing account linked.
- □ **Maps JavaScript API enabled**: Required for the frontend loader.
- □ **Places API enabled**: Required for the autocomplete search.
- □ **Referrer restriction**: Ensure the exact domain you are using is in the allowed list (including `https://*.vercel.app/*` for previews).
- □ **Redeployed**: After changing environment variables in Vercel, you MUST trigger a new deployment for changes to take effect.
- □ **Technical Diagnostic**: Click the "Show technical diagnostic info" link in the UI during a failure for real-time error messages.

### 5. Local Development
```bash
npm run dev
```
