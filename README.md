Folio Journal
A reflective journaling web app built with Next.js and Appwrite. Folio Journal lets users create an account, write and edit journal entries, organize entries into collections, review activity in a calendar view, and see simple writing analytics. The live deployment is available at https://myfolio.appwrite.network/.

Live Demo
https://myfolio.appwrite.network/

Features
User authentication with Appwrite email/password accounts and sessions

Create, read, update, and delete journal entries

Rich journal editor with mood picker, tags, and collection assignment

Entry detail view for reviewing and deleting saved entries

Dashboard view for browsing saved entries

Calendar view with journal activity history

Analytics page for reviewing writing activity trends

Collections page for organizing entries into notebook-style groups

Toast feedback for save and delete operations

Technologies Used
Frontend
Next.js (App Router)

React

TypeScript

CSS / global styling

Backend / Cloud Services
Appwrite Authentication

Appwrite Databases / TablesDB for journal entry storage

Appwrite Sites for hosting and deployment

Tooling
npm

GitHub

Project Structure
text
app/
├── page.tsx
├── layout.tsx
├── globals.css
├── appwrite.ts
├── auth.ts
├── functions.ts
├── types/
├── components/
└── pages/
Local Setup
Prerequisites
Node.js 18 or newer

npm

An Appwrite project

1. Clone the repository
   bash
   git clone <https://github.com/valientjuno/cloud-computing_finals
   cd cloud-computing_finals
2. Install dependencies
   bash
   npm install
3. Create environment variables
   Create a .env.local file in the project root and add your Appwrite values:

text
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_TABLE_ID=your_table_id
If your project uses different variable names in app/appwrite.ts, use the exact names required there.

4. Configure Appwrite
   In Appwrite, make sure you have:

A Web platform for your local URL, such as http://localhost:3000

A Web platform or site/domain configured for your deployed URL

Authentication enabled for email/password login

A database/table or collection for journal entries

Matching required fields for each entry record, such as title, content, mood, tags, userId, and collectionId if used

Correct permissions so authenticated users can create, read, update, and delete their own entries

5. Run the app locally
   bash
   npm run dev
   Then open:

text
http://localhost:3000

6. Create a production build locally
   bash
   npm run build
   npm start
   API / Backend Documentation
   This project uses Appwrite instead of a custom Express or Node REST API. The frontend communicates with Appwrite through helper functions in app/auth.ts, app/appwrite.ts, and app/functions.ts.

Authentication Functions
getCurrentUser()
Returns the currently logged-in Appwrite account if a session exists.

registerUser(...)
Creates a new Appwrite account for a user.

loginUser(...)
Creates an email/password session for an existing user.

logoutUser()
Ends the current user session.

Entry Data Functions
fetchEntries(userId)
Loads journal entries for a specific user from Appwrite.

Used by: dashboard, refresh flow after login, and page reload state restoration.

addEntry(data)
Creates a new journal entry row/document in Appwrite.

Expected fields:

userId

title

content

mood

tags

collectionId (optional)

updateEntry(id, data)
Updates an existing journal entry in Appwrite using its saved row/document ID.

deleteEntry(id)
Deletes an existing journal entry from Appwrite.

Typical User Flow
User signs up or logs in.

The app checks for an existing Appwrite session.

The dashboard loads the user's saved entries from Appwrite.

The user creates a new entry in the editor.

The app saves the first entry to Appwrite and stores the returned row ID.

Future saves update the same entry instead of creating duplicates.

The user can view, edit, and delete entries from the dashboard or detail page.

Deployment Notes
This project is deployed through Appwrite Sites:

Live URL: https://myfolio.appwrite.network/

To keep deployment working correctly:

Add all required NEXT*PUBLIC*\* environment variables in the Appwrite Sites deployment settings

Make sure the site/domain is allowed in Appwrite platform settings if needed for auth and API access

Verify database/table permissions in production

Test login, create entry, edit entry, refresh, and delete entry after each deployment

Appwrite Sites supports deployed domains and HTTPS-enabled Appwrite network domains for production usage.

Current Limitations / Notes
Some non-entry data, such as collections, may still rely on local browser storage depending on the current project version

If collections are stored locally, they may not sync across devices or browsers

The project currently focuses on Appwrite-backed authentication and journal entry CRUD as its primary backend functionality

Submission Checklist
Frontend project code in GitHub

Backend integration through Appwrite

Live deployed demo

README with setup instructions

README with backend/API usage notes

Author
Jesse Doake - Tooele Technical College Student

License
This project was created for a cloud computing course submission.
