# Know Who I Am

## Overview
An NFC-based digital business card application where users can link their profiles to physical NFC tags.

## Features
- **Public Profile**: `/p/:slug` - The digital card view.
- **Dashboard**: `/` - Edit profile, manage links, write NFC tag.
- **Authentication**: Replit Auth (Login with Google, etc).
- **NFC Integration**: Web NFC API to write profile URL to tags.

## Architecture
- **Frontend**: React, Tailwind CSS, Shadcn UI.
- **Backend**: Express, Drizzle ORM, PostgreSQL.
- **Auth**: Replit Auth (Passport.js).

## Setup
- Database schema pushed via `npm run db:push`.
- Frontend generated via `generate_frontend`.
- Cloudflare Pages Build output directory: `client/src`.
- Entry point: `client/src/index.html`.
