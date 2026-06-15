# Madubana Sadasyaru • Family Heritage Portal

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.2-indigo?logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-11.11-00d8ff?logo=react)](https://reactflow.dev/)

A premium, private web platform designed to preserve, visualize, and celebrate the rich history and lineage of the **Madubana Sadasyaru** family (Est. 2005, Navunda). Built with Next.js (App Router), Prisma, Tailwind CSS, and React Flow, this portal acts as a central digital repository for genealogy, historical milestones, and shared memories.
---

## 🌟 Key Features

### 1. Interactive Family Tree
*   **Visual Lineage mapping**: High-fidelity interactive family tree powered by **React Flow**.
*   **Detailed Node Navigation**: Connects spouses, parents, and children dynamically.
*   **Profile Integration**: Click on any member node to view their full profile.

### 2. Member Directory & Profiles
*   **Biographical Information**: Displays education, occupation, and biography.
*   **Interactive Timeline**: Chronological events detailing milestones (e.g., birth, relocations, retirement).
*   **Achievements & Awards**: Showcases personal achievements with detailed descriptions.
*   **Intergenerational Links**: Clearly mapped parental and spouse connections.

### 3. Media Gallery
*   **Categorized Albums**: Grouped photos by theme (e.g., Functions, Weddings, Birthdays, Festivals, Trips, Recent).
*   **High-Quality Storage**: Cloud-hosted image rendering via **UploadThing**.
*   **Captions & Descriptions**: Contextual details for every single picture.

### 4. Family Book (Chronicles)
*   **Chapter-by-Chapter History**: Markdown-supported stories detailing the origins, migration, and growth of the family.
*   **Rich Layout**: Styled text reader experience for historical accounts.

### 5. Secure Access & Role Management
*   **NextAuth.js Integration**: Supports secure credentials-based login and Google OAuth.
*   **Role-Based Access Control (RBAC)**:
    *   `ADMIN`: Full access to create, modify, and delete family tree nodes, upload photos, and draft historical chapters.
    *   `MEMBER` & `GUEST`: Read-only access to preserve privacy of family photos and details from the public.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4, Framer Motion (micro-animations), Lucide React (icons)
*   **Tree Visualization**: React Flow
*   **Database ORM**: Prisma Client
*   **Database Engine**: PostgreSQL (Production) / SQLite (Development dev.db)
*   **File Uploads**: UploadThing (Cloud CDN)
*   **Authentication**: NextAuth.js
*   **Mailer**: Nodemailer (SMTP configuration for notifications)

---

## 📂 Project Directory Structure

```text
├── app/                  # Next.js App Router (pages, layouts, api routes)
│   ├── admin/            # Administrative dashboard and CRUD tools
│   ├── api/              # API routes (members, auth, albums, etc.)
│   ├── family-book/      # Family Book story reader pages
│   ├── family-tree/      # Interactive React Flow Family Tree page
│   ├── gallery/          # Media Gallery grid and album pages
│   ├── login/            # Authentication login page
│   └── member/           # Member detail and timeline pages
├── components/           # Reusable React components
│   ├── book/             # Components for the family book
│   ├── family/           # Family tree nodes and connectors
│   ├── gallery/          # Photo grids and album carousels
│   ├── home/             # Hero banner and house introduction components
│   ├── layout/           # Shared Navbar, Footer, and Page Shells
│   └── ui/               # Custom design-system UI components
├── prisma/               # Database schemas and seeds
│   ├── schema.prisma     # Prisma schema configuration
│   ├── seed.js           # Database seeder script
│   └── seedData.json     # Initial seed dataset for development
└── public/               # Static assets and icons
```

---

## ⚙️ Environment Configuration

To run this application locally, you must configure the environment variables. Create a `.env` file in the root directory and populate it based on `.env.example`:

```env
# Database Connection URL (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# UploadThing Token for Image Uploads
UPLOADTHING_TOKEN="your-uploadthing-token"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Credentials Configuration
ADMIN_EMAIL="your-admin-email"
ADMIN_PASSWORD="your-admin-password"
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18.x or later) and npm installed on your machine.

### 2. Installation
Clone this repository and install the dependencies:
```bash
npm install
```

### 3. Database Migration & Setup
Generate the Prisma client and seed the local database:
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations (or push schema to local database)
npx prisma db push

# (Optional) Seed database with initial dataset
node prisma/seed.js
```

### 4. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Build for Production
Create an optimized production build:
```bash
npm run build
```

---

## 🔒 Security & Privacy

This portal contains sensitive family information. By default, access to member details, the family tree, and gallery albums is protected behind NextAuth authentication to prevent unauthorized indexing or scraping by public search engines. Please request access credentials from the family administrator.
