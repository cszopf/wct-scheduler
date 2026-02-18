
# World Class Title Scheduling System

A custom-built scheduling experience for WCT integrated with Google Calendar.

## Setup Instructions

### 1. Google Cloud Configuration
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Calendar API**.
3. Create a **Service Account**:
   - Go to IAM & Admin > Service Accounts.
   - Click "Create Service Account".
   - Grant it no specific roles during creation (not needed for DWD).
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

### 3. Environment Variables
Set the following variables in your Vercel deployment:
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Full JSON string from your key file.
- `GOOGLE_DELEGATED_USER_EMAIL`: The workspace email to impersonate (usually the main office calendar owner).
- `GOOGLE_CALENDAR_ID_DEFAULT`: Primary calendar ID for bookings.
- `DATABASE_URL`: Postgres connection string (Neon/Supabase).
- `RESEND_API_KEY`: For email notifications.
- `FROM_EMAIL`: Authorized sender email.
- `BASE_URL`: Deployment URL for manage links.

### 4. Database Setup
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Local Development
```bash
npm run dev
```
