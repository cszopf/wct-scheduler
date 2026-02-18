
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
1. Enable **Places API** and **Maps JavaScript API** in Google Cloud.
2. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel environment variables.
3. Restrict the key to your specific domains (`https://*.vercel.app/*`, etc.) under Google Cloud Credentials.
4. (Optional) Set `GOOGLE_PLACES_SERVER_KEY` for server-side details lookup if implemented.

### 4. Environment Variables
Set the following variables in your Vercel deployment:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Client-side key for Places Autocomplete.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Full JSON string from your key file.
- `GOOGLE_DELEGATED_USER_EMAIL`: The workspace email to impersonate.
- `GOOGLE_CALENDAR_ID_DEFAULT`: Primary calendar ID for bookings.
- `DATABASE_URL`: Postgres connection string.
- `RESEND_API_KEY`: For email notifications.
- `FROM_EMAIL`: Authorized sender email.
- `BASE_URL`: Deployment URL for manage links.

### 5. Database Setup
```bash
npx prisma migrate dev
npx prisma db seed
```

### 6. Local Development
```bash
npm run dev
```
