# Personal Journal App with Appwrite

## Project Description

This is a full-stack Personal Journal web application built with Next.js, TypeScript, and Appwrite. The app allows users to create an account, log in securely, and manage personal journal entries with full CRUD functionality. Appwrite handles authentication and database services, while the frontend communicates directly with Appwrite through the SDK. [web:115][web:191]

This project demonstrates full-stack development with a Backend-as-a-Service workflow, including user authentication, database integration, frontend state management, and deployment preparation. [web:115][web:379]

---

## Technologies Used

- Next.js (App Router)
- TypeScript
- React
- Appwrite
- CSS

---

## Features

### Authentication

- User signup with email and password
- User login
- User logout
- Session-based authentication with Appwrite Accounts [web:115]

### Journal Entry Management (CRUD)

- Create journal entries
- View personal journal entries
- Edit and update entries
- Delete entries
- Persist journal data with Appwrite TablesDB rows instead of browser-only storage [web:158][web:191]

### Entry Details

Each journal entry includes:

- Title
- Content
- Mood
- Created date
- Updated date
- User ID
- Optional collection/notebook ID for organization

### Additional Views

- Dashboard for browsing entries
- Entry detail view
- Collections view
- Analytics view
- Calendar view for journal history

---

## Appwrite Services Used

- **Authentication** for email/password account login and session management [web:115]
- **TablesDB** for storing and querying journal entry rows [web:158][web:191]

---

## Local Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cloud-computing_finals
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a file named `.env.local` in the root of the project and add:

```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID=69d55d8a000ad7a2c915
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=journal-keep
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_DATABASE_ID=69d55fc500021282d087
NEXT_PUBLIC_APPWRITE_TABLE_ID=records
```

These same variables should also be added to your production hosting provider during deployment. Vercel supports adding project environment variables directly in the project settings. [web:412][web:373]

### 4. Run the development server

```bash
npm run dev
```

Open your browser and go to:

```text
http://localhost:3000
```

---

## Appwrite Configuration

### Database Setup

Create:

- 1 Appwrite database
- 1 Appwrite table for journal records

Appwrite’s newer database model uses **tables**, **rows**, and **columns** rather than the older **collections** and **documents** terminology, while remaining conceptually similar. [web:59][web:158]

### Required Columns

Add these fields to the `records` table:

- `userId` (string, required)
- `title` (string, required)
- `content` (string or text, required)
- `mood` (string, required)
- `tags` (optional array or compatible field type)
- `collectionId` (optional string)

Make sure the `userId` string length is large enough to store Appwrite user IDs. Appwrite validates row data against the table schema and rejects unknown fields or values that exceed configured limits. [web:297][web:283]

### Platform Setup

Add the following Web App platform URL in Appwrite for local development:

```text
http://localhost:3000
```

After deployment, also add your production domain or Vercel hostname as a Web App platform so authentication and API requests work correctly in production. [web:115][web:378]

---

## API / Function Documentation

This project uses the Appwrite Web SDK directly in the frontend.

### Authentication Functions

- Create user account
- Create email/password login session
- Get current logged-in user
- Logout by deleting the current session

### Journal Entry Functions

- Create row
- List rows for the current user
- Update row
- Delete row

All journal operations are intended to be scoped to the authenticated user through Appwrite permissions and user-based filtering. [web:191][web:115]

---

## Project Structure

```text
app/
├── page.tsx
├── layout.tsx
├── globals.css
├── appwrite.ts
├── auth.ts
├── functions.ts
├── types/
│   └── index.ts
├── utils/
│   └── index.ts
├── components/
│   ├── Toast.tsx
│   ├── Logo.tsx
│   ├── Avatar.tsx
│   ├── MoodPicker.tsx
│   ├── TagInput.tsx
│   ├── EntryCard.tsx
│   └── AppNav.tsx
└── pages/
    ├── Landing.tsx
    ├── AuthPage.tsx
    ├── Dashboard.tsx
    ├── Editor.tsx
    ├── Detail.tsx
    ├── Settings.tsx
    ├── CalendarPage.tsx
    ├── AnalyticsPage.tsx
    └── CollectionsPage.tsx
```

---

## Deployment

This project can be deployed using:

- **Vercel** (recommended for simplicity with Next.js) [web:379][web:412]

### Deployment Steps

1. Push the project to GitHub. [web:377]
2. Import the repository into Vercel. [web:377]
3. Add the same environment variables from `.env.local` into Vercel project settings. [web:412][web:373]
4. Deploy the application. [web:377]
5. Add the deployed Vercel domain as a Web App platform in Appwrite. [web:115][web:378]

If environment variables are changed after the first deployment, redeploy the project so the new values are included in the production build. [web:412]

---

## Favicon

To avoid `/favicon.ico` 404 errors, add a favicon file to:

```text
public/favicon.ico
```

Next.js App Router also supports metadata icon files directly in the `app/` directory. [web:397][web:426]

---

## Notes

- A `401` request to `/account` before login is typically expected because the app checks for an existing session on startup. [web:228][web:390]
- Appwrite may show a warning about localStorage session handling when using the shared cloud endpoint; this is informational and can later be improved with a custom Appwrite domain. [web:394][web:388]
- The project was refactored into a cleaner file and folder structure to separate pages, components, types, utility functions, and Appwrite logic.

---

## Future Improvements

- Search journal entries
- Filter by mood
- Dark mode UI
- Rich text editor
- Pagination or infinite scroll
- Move collection management fully into Appwrite if desired
- Add production custom domain support for cleaner Appwrite session handling [web:388]

---

## Scripts

```bash
npm run dev
npm run build
npm run start
```
