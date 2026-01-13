# Digital Business Card App

## Overview
A mobile-first digital business card application that allows users to create a profile, manage social links, and write their profile URL to an NFC tag.

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
