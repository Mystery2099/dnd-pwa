# 📖 The Grimar Hermetica: Project Specification

**Version:** 1.0.0
**Status:** Approved for Phase 1 (MVP)
**Stack:** SvelteKit, Bun, SQLite (Drizzle), Tailwind CSS 4
**Deployment:** Self-Hosted Docker (Traefik + Authentik)

-----

## 1\. Executive Summary

**Grimar** is a self-hosted, offline-capable Progressive Web App (PWA) that acts as a unified "Digital Grimoire" for D\&D 5e. It combines a Reference Tool, Character Manager, and Virtual Tabletop into a single **"Local-First"** platform.

It prioritizes the **"Arcane Aero"** aesthetic (glassmorphism/3D depth) and utilizes existing self-hosted infrastructure for identity management, minimizing the need for custom auth logic.

-----

## 2\. Core Features (Phase 1 MVP)

### 2.1 The Compendium (Database)

  * **Data Source:** Hybrid Model.
      * **Seed Data:** Auto-fetched from the Open5e API (SRD content) into our local SQLite database.
      * **Caching:** External API data is cached locally to prevent rate limits and enable offline viewing.
  * **Homebrew:** Users can create custom Spells/Items.
      * **Visibility:** **Public by Default.** All users on the server can see all homebrew items (simplifies MVP schema).
  * **Global Search:** `Cmd+K` command palette to find "Fireball" or "Goblin" instantly from any view.

### 2.2 The Character Sheet

  * **Philosophy:** "Digital Paper."
      * **Flexible Rules:** No strict validation. Users can manually type stats (e.g., "Strength: 25") without the app blocking them.
      * **Calculations:** The app *suggests* modifiers but allows overrides.
  * **Assets:** Custom image uploads for character portraits (stored in local Docker volume).
  * **Offline Mode:** **Read-Only.** Users can view sheets without internet. Edits require a connection to save to the server.

### 2.3 The Forge (Character Creator)

  * **Philosophy:** "Guided Templates."
  * **Workflow:**
    1.  **Basics:** Input Name and upload Portrait.
    2.  **Templates:** Selecting "Elf" or "Wizard" pre-fills fields (Speed, Hit Dice, Proficiencies) but leaves them editable.
    3.  **Ability Scores:** Supports Manual Entry, Point Buy, and Standard Array.
  * **Output:** Creates a new Character entry in SQLite.

### 2.4 Export & Portability

  * **JSON Export:** Raw data dump for backups.
  * **PDF Export:** Generates a standard 5e Character Sheet.
      * **Tech:** Uses `pdf-lib` to map database fields onto a blank, form-fillable PDF template stored in assets.

### 2.5 The Dice Roller

  * **Context-Aware:** Clicking a spell/weapon on the sheet automatically rolls the correct damage (e.g., `8d6` Fire).
  * **Manual Tray:** A sidebar drawer for arbitrary rolls (e.g., `/r 2d20 + 5`).
  * **Visuals:** 3D physics or particle effects (confetti/sparks) on Critical Hits (Nat 20).

### 2.6 Bookmarks

Users can bookmark Compendium entities for quick access.

  * **Scope:** Spells, Items, Monsters (and any other `compendium_items` types).
  * **Ownership:** Per-user.
  * **UI (MVP):** A star/bookmark toggle on Compendium cards and on the detail modal.
  * **Filtering (MVP):** Compendium sidebar includes a "Bookmarked only" toggle.
  * **Persistence:** Stored in SQLite; available across devices/browsers for the same authenticated user.

-----

## 3\. View Architecture (Site Map)

### 3.1 Public Views

  * `/` **Landing:** Redirects to `/dashboard` if logged in (via Authentik headers), otherwise shows a "Log In" prompt (redirects to Traefik auth).

### 3.2 Authenticated Views

#### 🧱 **App Shell (Authenticated Layout)**

The App Shell is a universal, persistent frame for all authenticated views. It establishes the "magical instrument" vibe of the app and provides consistent navigation across routes.

* **Background:** The Deep Weave spotlight (`bg.app`).
* **Primary Persistent Element:** A universal global header.
* **Main Content Frame:** Use a subtle full-width "grimoire frame" (Arcane Glass edge) that hugs the viewport to separate the app content from the Deep Weave background.
    * **Desktop:** Full-width frame with rounded inner corners, faint border, and soft inner highlight (a thin aero rim). Main content inside the frame still uses comfortable padding.
    * **Mobile:** Reduce or remove the frame so content can use the full width.

##### Global Header (Universal)
* **Material:** Obsidian (`surface.canvas`), slightly transparent with high `backdrop-blur`, fixed to top, subtle border.
* **Vibe:** Glossy "aero" shine line across the top edge, subtle gem accents on active/focused elements (no constant neon).
* **Active Route Accent:** The current route gets a restrained gem accent (underline, small left border, or glow tick) rather than changing the whole header color.
* **Desktop Layout (md+ / lg):**
    * **Left:** Logo/Title linking to `/dashboard`.
    * **Center:** Omnibar (search input) as the visual centerpiece.
    * **Right:** Compact action cluster (e.g., navigation links and/or user affordances).
* **Mobile Layout (sm):**
    * **Left:** Hamburger button opening a navigation drawer.
    * **Center:** Compact title/logo.
    * **Right:** Search button that opens the Omnibar.

##### Mobile Navigation Drawer
* **Behavior:** Hamburger opens a drawer overlay.
* **Material:** Obsidian (`surface.canvas`) for the drawer, with a modal overlay backdrop (`surface.overlay`).
* **Contents (MVP):** Dashboard, Compendium, Settings.

#### 🏠 **Dashboard** (`/dashboard`)

  * **Layout:** Grid view of the user's Characters and Campaigns.
  * **Visual:** Large "Crystal Card" styling for each character showing Portrait, Name, Level, and Class.

#### 📖 **Compendium** (`/compendium`)

  * **Layout:** Masonry Grid or Master-Detail list.
  * **Tabs:** Spells | Items | Monsters.
  * **Sidebar:** Faceted filters (Class, Level, School, Rarity).
  * **Actions:** "Create Homebrew" button (Opens modal).

#### 🧙‍♂️ **Character Sheet** (`/characters/[id]`)

  * **Header:** Portrait (uploadable), Name, Class/Level, Rest Buttons (Short/Long).
  * **Tab 1: Main Stats:** Ability Scores, Skills list (clickable), Vitals (HP, AC, Speed).
  * **Tab 2: Combat & Spells:**
      * **Mana Gems:** Interactive glass icons for Spell Slots (click to expend).
      * **Attack List:** Clickable weapons.
  * **Tab 3: Inventory:** Equipment list with encumbrance calculation.
  * **Tab 4: Notes:** Markdown editor for backstory and session notes.

#### ⚙️ **Settings** (`/settings`)

  * **Theme:** Toggle Light/Dark/System.
  * **Dice Config:** Custom dice colors/skins.
  * **Admin:** "Re-sync SRD Data" button (refreshes Open5e cache).

### 3.3 Compendium Design (`/compendium`)

#### Design Concept: "The Crystal Index"
The Compendium should feel like a deep, organized library of magical knowledge. It is split into a static control panel on the left and a dynamic, searchable grid on the right.

* **Aesthetic:** The main content area uses a **Masonry Grid** (staggered layout) of small, distinct cards that appear like "shards" of knowledge.
* **Search Bar:** Uses the "Omnibar" style: highly visible, central, and framed with a subtle glow, highlighting the `⌘K` keyboard shortcut.

#### Components

##### 1. Sidebar: The "Control Panel"
* **Material:** **Obsidian** (`surface.canvas`), darker and less blurry than the main content area, providing visual separation.
* **Elements:** Filter groups use small, inset inputs (Spec 5.2) and custom toggles (Spec 5.3) for a tactile feel.
* **Key Filters:** Class, Spell Level (slider), School (checkboxes), Components (check-boxes), Homebrew/SRD toggle.

##### 2. Main Content: The "Shards" Grid
* **Layout:** Responsive Masonry/Grid of `SpellCard.svelte` or `ItemCard.svelte`.
* **Material:** **Arcane Glass** (`surface.card`).
* **Card Design:**
    * **Border:** The card border glows subtly with the **Spell School Color** (e.g., Ruby for Evocation), providing visual context at a glance.
    * **Hover State:** Uses the **Ether** effect (subtle background change + hover lift) and displays the "View Details" overlay.
    * **Bookmarking:** A small star/bookmark affordance is available per card.

##### 3. Detail View (Modal)
* **Behavior:** Clicking a card opens a **Modal Overlay** (`surface.overlay`) displaying the full text and mechanics.
* **Aesthetic:** The modal should have high `backdrop-blur` to clearly separate the knowledge (modal) from the archive (grid).
* **Bookmarking:** The modal includes the same star/bookmark toggle so users can bookmark while reading.

-----

#### Implementation Snippet Highlights

| Element | Specification Rule Applied | Tailwind Classes (Concept) |
| :--- | :--- | :--- |
| **Container** | `surface.canvas` | `bg-gray-950/40 backdrop-blur-sm border border-white/5` |
| **Spell Card** | `surface.card` + School Accent | `bg-gray-800/60 backdrop-blur-md border-[school-color]` |
| **Search Bar** | `input (Insets)` + `brand.glow` | `bg-gray-900/50 shadow-2xl focus:ring-purple-500` |
| **Filter Select** | `input (Insets)` | `input-etched` (from Style Guide 6.4) |
| **Homebrew Toggle**| `Toggle (Skeuomorphic)` | Custom CSS/Svelte for a physical switch look |

### 3.4 Character Sheet Design (`/characters/[id]`)

#### Design Concept: "The Adventurer's Prism"
The Character Sheet should feel like a personal, living artifact: a crystalline dossier that prioritizes speed-of-use at the table. The information hierarchy is designed around quick scanning (Vitals, Core Stats, Actions) with deep detail one click away.

* **Primary Structure:** Tabbed view for mental separation of domains (Stats vs Combat vs Inventory vs Notes).
* **Responsive Layout:**
    * **Small screens:** single-column flow.
    * **Large screens:** two-column layout with a stable "Core" column and a context-sensitive "Details" column.

#### Layout

##### 1. Page Shell
* **Background:** Deep Weave spotlight.
* **Primary Container Material:** Arcane Glass (`surface.card`) for the sheet body.
* **Grid:**
    * **Mobile:** `grid-cols-1`.
    * **Desktop:** `lg:grid-cols-[minmax(360px,420px)_1fr]`.
    * **Desktop Scrolling:** The left "Core" column is sticky; the right "Details" column scrolls.

##### 2. Header (Always Visible)
* **Left:** Portrait (uploadable) with an Arcane Glass frame.
* **Center:** Character name + Class/Level, with minimal holo-glow on headings.
* **Right:** Rest controls (Short/Long) as gem buttons; include a compact status area for conditions.

##### 3. Tabs (Primary Navigation)
* **Tabs:** Main Stats | Combat & Spells | Inventory | Notes.
* **Behavior:** Sticky on mobile (below the header) to keep navigation accessible.
* **Material:** Obsidian (`surface.canvas`) strip with a subtle shine; active tab uses Ether state.

#### Tab Specifications

##### Tab 1: Main Stats
* **Desktop 2-Column:**
    * **Left (Core):** Vitals + Ability Scores + Saves.
    * **Right (Details):** Skills list + Proficiencies/Traits.
* **Vitals Module:**
    * **HP:** Glass tube bar (Style Guide 8: Character HP Bar) with editable current/max.
    * **AC / Speed / Initiative:** Engraved stat tiles (`panel-inset`).
* **Ability Scores:**
    * Display as a grid of 6 crystal tiles with Score + Mod.
    * Clicking a tile opens a detail modal for temporary buffs/notes.
* **Skills:**
    * Scrollable list; each row is a glass slat with a proficiency indicator.
    * Clicking a skill opens a quick roll/action affordance (future: dice).

##### Tab 2: Combat & Spells
* **Desktop 2-Column:**
    * **Left (Core):** Attacks + Actions + Resources.
    * **Right (Details):** Spells panel with slots and prepared list.
* **Mana Gems (Spell Slots):**
    * Interactive glass icons per slot level.
    * State: available (subtle glow), spent (dim + etched), hovering shows tooltip.
* **Attack List:**
    * Weapon rows as glass slats; primary action opens a small overlay with attack/damage breakdown.
* **Concentration / Conditions:**
    * A compact engraved panel showing active conditions; quick toggles for common states.

##### Tab 3: Inventory
* **Desktop 2-Column:**
    * **Left (Core):** Equipped items + quick-use consumables.
    * **Right (Details):** Full inventory list + encumbrance.
* **Encumbrance:**
    * Glass tube bar with thresholds.
* **Item Rows:**
    * Glass slats with rarity/accent intensity.
    * Clicking opens a detail modal (description, mechanics, notes).

##### Tab 4: Notes
* **Single Primary Column:** (even on desktop) for focus.
* **Editor:** Markdown editor inside Arcane Glass with inset input styling.
* **Sections:** Backstory, Session Notes, NPCs/Clues.

#### Global Interactions

##### 1. Edit Controls
* Inputs should use inset styling (Style Guide 5.2).
* Prefer inline edits for small fields (HP current, temp HP, spell slots) with clear focus ring.

##### 2. Detail Modals
* **Surface:** `surface.overlay`.
* **Backdrop:** high blur; modal uses Arcane Glass.
* **Content:** Always include a close affordance, and support `Esc`.

##### 3. Keyboard Shortcuts
* `⌘K`: open Omnibar (global).
* `1`-`4`: switch Character Sheet tabs when focus is within the sheet.

-----

### 3.5 Dashboard Design (`/dashboard`)

#### Design Concept: "The Hall of Heroes"
The Dashboard is the landing space for ongoing play. It should be optimized for fast re-entry into a character sheet. Characters are the primary focus; campaigns are a secondary, optional module.

* **Primary Content:** Character Grid.
* **Secondary Content:** Campaigns module (can be minimal or omitted in MVP).

#### Layout

##### 1. Top Strip (Within the App Frame)
* **Greeting (Optional):** Short welcome line using the Authentik username.
* **Primary Call To Action:** "Create Character" as a gem button.
* **Secondary Actions (Optional/MVP-light):** Import/Export entry points can be deferred.

##### 2. Character Grid (Primary)
* **Layout:** Responsive grid of large Crystal Cards.
* **Card Material:** Arcane Glass (`surface.card`) with Aero shine.
* **Hover State:** Ether hover + subtle lift.
* **Card Contents (MVP):** Portrait, Name, Class/Level.
* **Card Contents (Deferred):** Quick-scan small engraved tiles (HP/AC) are intentionally omitted in MVP to keep the dashboard clean.

##### 3. Campaigns Module (Secondary / Optional)
* **Priority:** Visually de-emphasized versus the Character Grid.
* **Form:** Small strip or compact list below characters.
* **MVP Note:** This section can be hidden entirely if there are no campaigns.

#### States

##### 1. Empty State (No Characters)
* The page should strongly feature the "Create Character" CTA and briefly explain what the dashboard is for.

##### 2. Loading State
* Skeleton Crystal Cards (same size as final cards) to preserve layout stability.

##### 3. Error State
* Non-blocking error panel in Arcane Glass; allow retry.

#### Interactions

* **Open Character:** Clicking a Crystal Card navigates to `/characters/[id]`.
* **Create Character:** CTA navigates to the Forge flow.
* **Campaign Entry (If present):** Clicking a campaign opens campaign details (future scope).

-----

-----

## 4\. Technical Architecture

### 4.1 Stack Strategy

  * **Framework:** SvelteKit (Single Container Monolith).
  * **Runtime:** Bun (Native SQLite support, fast startup).
  * **Database:** SQLite (via `bun:sqlite`) + Drizzle ORM.
  * **Styling:** Tailwind CSS 4 ("Arcane Aero" System).

### 4.2 Data Schema

**Table: `users`**

  * `username` (PK, Text) - *From Authentik Header*
  * `settings` (JSON)

**Table: `compendium_items`**

  * `id` (PK)
  * `source` (Enum: "SRD", "Homebrew")
  * `type` (Enum: "Spell", "Weapon", "Item", "Monster")
  * `data` (JSON) - *Full definition object*
  * `created_by` (FK -\> users.username, Nullable)

**Table: `characters`**

  * `id` (PK)
  * `owner` (FK -\> users.username)
  * `name` (Text)
  * `portrait_url` (Text)
  * `stats` (JSON) - *Includes race\_template, class\_template, str, dex, etc.*
  * `inventory` (JSON) - *List of item IDs*
  * `spells` (JSON) - *List of prepared spell IDs*

### 4.3 Authentication Hooks (The "Bypass")

  * **File:** `src/hooks.server.ts`
  * **Logic:**
    1.  **Dev Check:** If `import.meta.env.DEV` is true and `VITE_MOCK_USER` is set in `.env`, inject that username as the active user.
    2.  **Prod Check:** If not in dev, look for `X-Authentik-Username` header from Traefik.
    3.  **Sync:** Check if the username exists in the local SQLite `users` table. If not, auto-create it (Upsert).
    4.  **Session:** Populate `event.locals.user` for the rest of the app to use.

### 4.4 PWA Configuration

  * **Service Worker:** Generated via `vite-plugin-pwa`.
  * **Strategy:**
      * **Stale-While-Revalidate:** For Compendium/Static data.
      * **Network-Only:** For User Data (to prevent overwrite conflicts).
  * **Manifest:** configured for "Standalone" display to hide browser UI on Android/Windows.

### 4.5 Image Handling

  * **Storage:** Images are saved to `/app/data/uploads/[uuid].webp` (Docker Volume).
  * **Serving:** SvelteKit creates a route `/uploads/[file]` to serve these static assets with long-term caching headers.

-----

## 5\. Deployment Configuration

### 5.1 Dockerfile

```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production Runner
FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=build /app/build ./
COPY --from=build /app/package.json ./

# Persistence
VOLUME /app/data
ENV DATABASE_URL="file:/app/data/grimar.sqlite"

EXPOSE 3000
CMD ["bun", "./index.js"]
```

### 5.2 Docker Compose (Snippet)

```yaml
  grimar:
    build: .
    container_name: grimar
    restart: unless-stopped
    volumes:
      - ./grimar-data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grimar.rule=Host(`grimar.mar.lan`)"
      - "traefik.http.routers.grimar.middlewares=authentik@docker"
```

-----

## 6\. Development Checklist

1.  **Init:** `bun create svelte@latest grimar` (Skeleton + TypeScript).
2.  **Design:** Install Tailwind + Copy "Arcane Aero" tokens from Style Guide.
3.  **Auth:** Implement `hooks.server.ts` with the Dev Bypass logic.
4.  **DB:** Set up Drizzle + SQLite and write the Open5e seed script.
5.  **Compendium:** Build the Grid View and Filters.
6.  **Character:** Build the Sheet Layout and Image Upload API.
7.  **Export:** Implement `pdf-lib` mapping.
8.  **PWA:** Add manifest and service worker config.
