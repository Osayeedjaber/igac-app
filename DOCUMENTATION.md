# IGAC Website Documentation

Welcome to the technical and content documentation for the IGAC website. This guide explains the project structure, how to manage content, and the design system used across the site.

## 🚀 Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)

---

## 📂 Project Structure

### 1. Pages (`src/app`)
Each folder correlates to a URL on the website.
- `/` (`page.tsx`): The landing page.
- `/about`: Our story, mission, and FAQ.
- `/team`: Complete list of governing body, core panel, and regional heads.
- `/regions/ctg`: Dedicated page for the Chattogram Division.
- `/events`: Full archive of past conferences.
- `/join`: Membership application details.
- `/contact`: Communication portal.

### 2. Components (`src/components`)
- `sections/`: Reusable page sections (e.g., `Hero.tsx`, `About.tsx`).
- `ui/`: Atom-level components (Buttons, Cards, Profile cards).
- `motion/`: Animation wrappers (e.g., `Reveal.tsx` for scroll animations).

---

## ✍️ How to Edit Content

Most of the website's text and data is centralized in **one file** to make updating easy without touching code logic.

### **Primary Config File**: `src/config/site-data.ts`

**What you can edit here:**
- **Navigation Links**: Change the menu items in `navLinks`.
- **Team Members**: Add or update members in `teamData` (Governing Body, Core Panel, Regional Heads).
- **Events**: Add new conferences to the `eventsArchive` array.
- **Home/About Content**: Update headings, descriptions, and paragraphs for the main pages.
- **CTG Data**: Manage the specific content for the Chattogram division.

### **Images**
All images are stored in the `/public` directory. When adding a new image:
1. Place it in `/public` (or a subfolder like `/public/corepanel`).
2. Reference it in `site-data.ts` using the path starting from root (e.g., `"/corepanel/member.jpg"`).

---

## 🎨 Page-by-Page Breakdown (Homepage)

The homepage (`src/app/page.tsx`) is built from the following "locked" sections:

1. **Hero**: The opening cinematic intro.
2. **About**: Sticky scroll section ("Forging the Diplomats...").
3. **Community**: Stats and values grid.
4. **President Message**: A premium showcase of the President's vision.
5. **Governing Body**: Highlight of the top leadership.
6. **Core Panel Carousel**: An infinite rolling list of the operations team.
7. **Regional Presence (CTG)**: The "Gateway Division" showcase (Emerald themed).
8. **Impact**: Final CTA and global stats.

---

## 🛠️ Development & Deployment

### Local Development
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

---

## ⚠️ Important Notes
- **Locked Homepage**: The homepage sections are logically ordered to provide a specific narrative flow. Do not rearrange them without consulting the design plan.
- **Sticky Effects**: Vertical sections use `position: sticky`. If these break, ensure no parent container has `overflow: hidden` (use `overflow: clip` instead).
- **Animations**: Most reveals happen automatically via the `<Reveal />` component. Simply wrap new content in it to match the site's feel.
