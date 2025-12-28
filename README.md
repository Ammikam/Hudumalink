# Hudumalink – Kenya's Premier Interior Design Marketplace 🇰🇪

Hudumalink is a full-stack web platform connecting clients with verified interior designers across Kenya. Clients post projects, get personalized proposals, book calls, and pay securely via milestone escrow. Designers showcase portfolios, receive invites, and manage bookings.

Built as a final-year university project — now evolving into a real startup idea.

## 🚀 Features

- **Client Flow**
  - Interactive quote calculator with instant price range
  - Multi-step project posting with photo uploads and previews
  - Real-time before/after portfolio sliders
  - Direct messaging and 15-min discovery call booking via Calendly
  - Milestone-based project tracking (coming soon)

- **Designer Flow**
  - Premium profile with portfolio grid, reviews, stats
  - Super Verified badge system
  - Response time and rating display
  - Direct client invites and messaging

- **Tech Highlights**
  - Beautiful, responsive UI with dark mode support
  - Real Calendly integration for booking calls
  - Client-side photo previews (drag & drop)
  - Mock data with 6 Kenyan designers and real-looking projects

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion (animations)
- Lucide React icons
- React Router DOM

**Backend (In Progress)**
- Node.js + Express
- MongoDB Atlas
- Cloudinary (image uploads)
- Planned: Clerk auth, M-PESA escrow

**Deployment**
- Frontend: Vercel / Netlify
- Backend: Render / Railway


## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Ammikam/Hudumalink.git
cd hudumalink

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:5173