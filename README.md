# Personal Journal App with Appwrite

## Project Description

This is a full-stack Personal Journal web application built using Next.js and Appwrite. The app allows users to create an account, log in securely, and manage their personal journal entries. Each user can create, view, update, and delete their own entries.

This project demonstrates full-stack development using a Backend-as-a-Service (BaaS) platform, focusing on authentication, database integration, and frontend API interaction.

---

## Technologies Used

- Next.js (App Router)
- TypeScript
- Appwrite
- CSS

---

## Features

### Authentication

- User signup with email and password
- User login
- User logout
- Session-based authentication using Appwrite

### Journal Entry Management (CRUD)

- Create journal entries
- View all personal journal entries
- Edit and update entries
- Delete entries

### Entry Details

Each journal entry includes:

- Title
- Content
- Mood
- Entry date

---

## Appwrite Services Used

- Authentication (Email/Password login system)
- Database (storing journal entries per user)

---

## Local Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd personal-journal-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a file named `.env.local` in the root of the project and add:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your_collection_id
```

Replace the values with your Appwrite project credentials.

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

- 1 database
- 1 collection named `journal_entries`

### Required Attributes

Add these fields to the collection:

- `title` (string, required)
- `content` (string, required)
- `mood` (string, required)
- `entryDate` (string, required)
- `userId` (string, required)

### Platform Setup

Add the following Web Platform URL in Appwrite:

```text
http://localhost:3000
```

---

## API / Function Documentation

This project uses the Appwrite SDK directly in the frontend.

### Authentication Functions

- Create user account
- Create login session
- Get current logged-in user
- Logout (delete current session)

### Journal Entry Functions

- Create document (new journal entry)
- List documents (user-specific entries)
- Update document (edit entry)
- Delete document

All operations are restricted to the authenticated user.

---

## Project Structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── AuthForms.tsx
│   ├── JournalForm.tsx
│   └── JournalList.tsx
└── lib/
    ├── appwrite.ts
    └── journalService.ts
```

---

## Deployment

This project can be deployed using:

- Vercel (recommended)

### Deployment Steps

1. Push project to GitHub
2. Import repository into Vercel
3. Add environment variables in Vercel settings
4. Deploy

---

## Notes

- Each user can only access their own journal entries
- Appwrite handles backend authentication and database services
- The frontend communicates directly with Appwrite using the Appwrite SDK

---

## Future Improvements

- Search journal entries
- Filter by mood
- Dark mode UI
- Rich text editor
- Pagination for many entries
