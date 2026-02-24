# CIAgent — Project Structure & Documentation

> **Competitive Intelligence Agent** — An AI-powered competitive intelligence platform that monitors competitors, surfaces actionable signals, and generates strategic reports.

---

## 📁 Root Directory Tree

```
CIAgent/
├── AGENT.md                          # 3-layer architecture instructions
├── structure.md                      # ← This file
├── directives/
│   └── project_architecture.md       # Frontend hackathon architecture directive
├── skills/
│   ├── brand-guidelines/
│   │   ├── SKILL.md
│   │   └── LICENSE.txt
│   ├── frontend-design/
│   │   ├── SKILL.md
│   │   └── LICENSE.txt
│   └── skill-creator/
│       ├── SKILL.md
│       ├── LICENSE.txt
│       ├── references/
│       │   ├── output-patterns.md
│       │   └── workflows.md
│       └── scripts/
│           ├── init_skill.py
│           ├── package_skill.py
│           └── quick_validate.py
└── ci-agent-next/                    # Main Next.js application
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── postcss.config.mjs
    ├── public/
    │   ├── LANDING 1/                # Landing animation frames (Set 1)
    │   ├── LANDING 2/                # Landing animation frames (Set 2)
    │   ├── Login 1/                  # Login animation frames (Set 1)
    │   ├── Login 2/                  # Login animation frames (Set 2)
    │   ├── dashboard-frames/         # Dashboard background animation frames
    │   └── dashboard-bg.mp4          # Dashboard background video
    └── src/
        ├── app/
        │   ├── layout.tsx            # Root layout (fonts, metadata)
        │   ├── page.tsx              # Landing page (home)
        │   ├── globals.css           # Global styles & design tokens
        │   ├── favicon.ico
        │   ├── login/
        │   │   └── page.tsx          # Login page with canvas animation
        │   └── dashboard/
        │       ├── layout.tsx        # Dashboard shell (sidebar + topbar)
        │       ├── page.tsx          # Main dashboard overview
        │       ├── competitors/
        │       │   └── page.tsx      # Competitors tracking page
        │       ├── signals/
        │       │   └── page.tsx      # Real-time signals feed
        │       ├── reports/
        │       │   └── page.tsx      # Report generation & history
        │       └── profile/
        │           └── page.tsx      # User profile & settings
        └── components/
            ├── layout/
            │   ├── Navbar.tsx        # Landing page navigation bar
            │   └── Footer.tsx        # Landing page footer
            ├── sections/
            │   ├── Hero.tsx          # Landing hero section
            │   ├── Problem.tsx       # Problem statement section
            │   ├── Workflow.tsx      # How-it-works workflow section
            │   ├── Architecture.tsx  # System architecture diagram section
            │   └── CTA.tsx           # Call-to-action section
            └── ui/
                ├── LandingBackgroundAnimation.tsx  # Frame-sequence background for landing
                └── DashboardBackground.tsx         # Frame-sequence background for dashboard
```

---

## 🛠 Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Framework     | **Next.js 16** (App Router)         |
| Language      | **TypeScript 5**                    |
| Styling       | **Tailwind CSS 4** + Custom Tokens  |
| Animation     | **Framer Motion 12**                |
| Icons         | **Lucide React** + Google Material Symbols |
| Runtime       | **React 19**                        |
| Deployment    | **Vercel** (target)                 |

---

## 🎨 Design System

Defined in `globals.css` with Tailwind `@theme`:

### Color Palette

| Token                | Value       | Usage                              |
|----------------------|-------------|-------------------------------------|
| `--color-primary`    | `#2b2bee`   | Primary brand blue                  |
| `--color-secondary`  | `#2b2bee`   | Secondary accent                    |
| `--color-accent-pink`| `#FF00E5`   | Neon pink for highlights/CTAs       |
| `--color-accent-blue`| `#00F5FF`   | Cyan accents                        |
| `--color-accent-cyan`| `#06b6d4`   | Teal accent for cards               |
| `--color-accent-purple`| `#a855f7` | Purple accent for reports           |
| `--color-background-dark` | `#050505` | Landing page background         |
| `--color-dashboard-bg` | `#020617`  | Dashboard background               |

### Typography

- **Display Font:** `Space Grotesk` (sans-serif)

### Custom Utilities

| Utility          | Description                                    |
|------------------|------------------------------------------------|
| `glass`          | Frosted glass effect — blur(20px), 3% white bg |
| `glass-card`     | Deep glass card — blur(40px), heavy shadow      |
| `glass-panel`    | Subtle glass panel — blur(24px)                 |
| `neon-border`    | Animated gradient border (cyan → blue → purple) |
| `bg-gradient-mesh` | Multi-radial gradient mesh background         |
| `vibrant-active` | Active sidebar item with blue glow              |
| `vibrant-gradient` | Pink → purple → blue gradient                 |
| `neon-glow`      | Blue box-shadow glow effect                     |
| `text-glow`      | Blue text-shadow glow                           |
| `gradient-btn`   | Pink-to-blue gradient button with hover effect  |
| `grid-overlay`   | Dotted grid pattern overlay                     |
| `workflow-icon`  | Material Symbols filled icon settings           |

### Animations

| Animation | Duration | Description                |
|-----------|----------|----------------------------|
| `pulse`   | 2s       | Pulsing opacity animation  |
| `float`   | 6s       | Vertical floating motion   |
| `glow`    | 4s       | Opacity + blur glow cycle  |

---

## 📄 Pages & Features

### 1. Landing Page (`/`)

The marketing homepage that introduces CIAgent.

**Components rendered in order:**
1. `LandingBackgroundAnimation` — Full-screen canvas frame-sequence animation (LANDING 1 → LANDING 2 loop)
2. `Navbar` — Top navigation with logo + links + "Access Dashboard" CTA
3. `Hero` — Headline, subtext, CTA buttons with Framer Motion animations
4. `Problem` — Pain points in competitive intelligence
5. `Workflow` — Step-by-step how CIAgent works
6. `Architecture` — System architecture visual breakdown
7. `CTA` — Final call-to-action section
8. `Footer` — Links, branding, social icons

---

### 2. Login Page (`/login`)

Authentication gate before dashboard access.

**Features:**
- Full-screen canvas `BackgroundAnimation` (Login 1 → Login 2 frame loop)
- Email + password form with client-side validation
- Error messages for invalid input
- Hardcoded credentials check (demo mode)
- Framer Motion entrance animations
- Redirects to `/dashboard` on success
- Link back to landing page

---

### 3. Dashboard (`/dashboard`)

The main application shell for intelligence monitoring.

**Layout (`dashboard/layout.tsx`):**
- Collapsible sidebar with navigation links (Overview, Competitors, Signals, Reports)
- Top bar with search, notifications, and profile dropdown
- "Add Competitor" floating action button with toast notification
- `DashboardBackground` frame-sequence animation behind content
- Active route highlighting
- Logout functionality (redirects to `/login`)

**Sub-pages:**

#### 3a. Overview (`/dashboard`)
- **Stat Cards:** High Risk Score (84), Active Competitors (12), Signals This Week (47), Reports Generated (8)
- **Recent Signals Feed:** Latest competitor moves with impact levels (High / Med / Low)
- **Reports Summary:** Monthly report cards with icons
- Framer Motion staggered entrance animations

#### 3b. Competitors (`/dashboard/competitors`)
- **Competitor Cards:** Name, industry, threat level, market share, recent change, last signal
- **Track New** button with toast notification
- **Filter** toggle with animation
- Threat level color coding (High = pink, Med = yellow)
- Trend direction indicators (up/down arrows)

#### 3c. Signals (`/dashboard/signals`)
- **Signal Feed:** Real-time intelligence signals with type, impact, timestamp, description
- Signal types: Pricing Shift, New Hire, Tech Patent, Acquisition, Product Launch
- **Mark All Read** button with toast
- **Configure Alerts** modal with notification preferences
- Signal detail expansion on click

#### 3d. Reports (`/dashboard/reports`)
- **Report History:** Past reports with date, status, page count, description
- **Report Templates:** Custom Report, Market Synopsis, Competitor Deep Dive
- **Generate Report** button with progress toast
- **Share / Download / Template** action buttons per report

#### 3e. Profile (`/dashboard/profile`)
- User profile form (name, email, role, company)
- Notification preferences
- Save settings with toast confirmation

---

## 🏗 Architecture (3-Layer System)

Defined in `AGENT.md`:

```
┌─────────────────────────────────┐
│  Layer 1: DIRECTIVES            │  → SOPs, goals, constraints
│  (directives/)                  │
├─────────────────────────────────┤
│  Layer 2: ORCHESTRATION         │  → Decision-making, routing, state management
│  (Agent / AI)                   │
├─────────────────────────────────┤
│  Layer 3: EXECUTION             │  → Deterministic code, components, UI modules
│  (ci-agent-next/src/)           │
└─────────────────────────────────┘
```

**Key Principles:**
- Probabilistic reasoning (AI) separated from deterministic execution (code)
- State-gated workflow: Exploration → Preview → Approval → Implementation → Optimization
- Tool-Check-First: Reuse existing modules before creating new ones
- Self-anneal on errors: diagnose → fix → test → update directive
- Performance protection: never degrade Lighthouse scores

---

## 🎬 Animation Assets

All stored in `ci-agent-next/public/`:

| Folder             | Frames | Usage                            |
|--------------------|--------|----------------------------------|
| `LANDING 1/`       | 240    | Landing page animation (phase 1) |
| `LANDING 2/`       | 240    | Landing page animation (phase 2, loops) |
| `Login 1/`         | 240    | Login page animation (phase 1, 2x speed) |
| `Login 2/`         | 240    | Login page animation (phase 2, loops) |
| `dashboard-frames/`| varies | Dashboard background frames      |
| `dashboard-bg.mp4` | —      | Dashboard background video (~10MB) |

**Implementation:** HTML5 Canvas rendering with `requestAnimationFrame` for smooth frame-by-frame playback. Images are preloaded, then drawn cover-fit onto the canvas.

---

## 📦 Skills System

Located in `skills/`:

| Skill               | Description                                       |
|----------------------|---------------------------------------------------|
| `brand-guidelines`   | Brand identity rules and visual consistency guide  |
| `frontend-design`    | Frontend design patterns and layout guidelines     |
| `skill-creator`      | Meta-skill for creating new skills (includes scripts for init, package, validation) |

---

## 📋 Development Log (Conversation History)

| Date       | Milestone                                            |
|------------|------------------------------------------------------|
| Feb 19     | Migrated HTML prototype to Next.js App Router        |
| Feb 20     | Created login page + connected navigation flows      |
| Feb 20     | Landing page polish — Hero animations, Architecture fix |
| Feb 20     | Button connections, validation, smooth scrolling     |
| Feb 21     | Login page canvas animation (frame-sequence)         |
| Feb 21     | Dashboard button handlers, toast notifications       |
| Feb 21     | Animation transition fixes (no blinking/pauses)      |
| Feb 22     | Dashboard background readability improvements        |
| Feb 22     | Cleaned unused files and folders                     |

---

## 🚀 Running the Project

```bash
# Navigate to the Next.js app
cd ci-agent-next

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Default URL:** `http://localhost:3000`

---

## 📝 Key Configuration Files

| File                  | Purpose                              |
|-----------------------|--------------------------------------|
| `package.json`        | Dependencies & npm scripts           |
| `tsconfig.json`       | TypeScript compiler options          |
| `next.config.ts`      | Next.js configuration                |
| `eslint.config.mjs`   | ESLint rules                         |
| `postcss.config.mjs`  | PostCSS + Tailwind plugin            |
| `globals.css`         | Design tokens, utilities, base styles |
| `AGENT.md`            | AI agent operating instructions      |
