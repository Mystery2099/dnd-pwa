# 📖 Compendium Page Specifications

The Compendium pages serve two primary functions: efficient filtering/browsing (Index) and immersive data presentation (Detail).

## 1. The Index Page (The Browser)

**Route:** `/compendium/[type]` (e.g., `/compendium/spells`)

This page uses a **fixed split-pane layout** inspired by your previous spellbook. 

### 1.1 Layout (`CompendiumShell.svelte`)

| Section | Size/Behavior | Material/Component | Rationale |
| :--- | :--- | :--- | :--- |
| **Left Sidebar** | Fixed width (e.g., 350px). | **Obsidian** surface (`surface.canvas`). Contains `CompendiumSidebar.svelte`. | Dedicated space for filtering, always visible. |
| **Right Content** | Remaining width. | **Deep Weave** background (content floats on the background). Contains the `DetailView` slot. | Displays either the results grid or the detail modal/view. |

### 1.2 The Filtering Sidebar (`CompendiumSidebar.svelte`)

This is the power center for filtering and searching.

* **Primary Search:** A prominent, full-width `InputCrystal` at the top for name search.
* **Filter Groups:** Uses collapsible/expandable `FilterGroup` components.
    * **Control Type:** Filters use the `Select` primitive or `Toggle` switches, all adhering to the **Crystal Input** aesthetic.
    * **Example Filters (Spells):** Level, School, Class, Components (V, S, M).
* **View Toggle:** A prominent button to switch the list view between "Full Index" and **"Your Bookmarks"**.

### 1.3 The Results List

The main content area lists the filtered results when a detail view is not active.

* **Result Item:** Each item is a clickable **Lozenge/Pill Button** to signal interactivity.
* **Accent:** The hover state highlights the item using the type's specific **Gemstone Accent** color (e.g., **Amethyst** for spells).
* **Click Action:** Clicking a list item loads the full details into the adjacent right content panel, creating a continuous browsing experience.

## 2. 📝 The Detail View (The Tome Entry)

**Route:** Nested view or modal within `/compendium/[type]`

When an item is selected from the list, the full entry loads into the right panel.

### 2.1 Display Type

* **For Desktop:** The detail view loads directly into the adjacent right pane, replacing the empty state. It uses the `SurfaceCard` material.
* **For Mobile:** It may be required to open as a full-screen **Modal** (`SurfaceOverlay` material) due to screen constraints.

### 2.2 Layout Structure

The detail view uses a clear **Two-Column structure** to present data, mirroring a stat block or book entry.

| Section | Content | Styling and Components |
| :--- | :--- | :--- |
| **Header** | Item Name, Bookmark Toggle, Close Button. | Uses the Type's Accent Color (e.g., Amethyst for Spells) for the header bar/line. Includes the `BookmarkToggle.svelte`. |
| **Left Column** | **Attributes Table:** Lists fixed, concise data points (e.g., AC, HP, Speed, CR for Monsters; Casting Time, Range, Duration for Spells). | Uses `Divider` components to separate data fields. Key values are emphasized with bolding and the accent color. |
| **Right Column** | **Description & Lore:** The long-form text, flavor, and rules explanation (the "Tome" entry). | Text is highly readable. Implements **Dynamic Linking**: All references to other Compendium items (e.g., "Fireball," "Poisoned Condition") are automatically hyperlinked to their detail view. |

### 2.3 Key Detail Components

* `CompendiumDetailModal.svelte`: The overall container for the display.
* `BookmarkToggle.svelte`: Allows the user to flag the item for quick access on the dashboard.
* `Badge.svelte`: Used to clearly label key attributes like Spell School (Evocation, Abjuration) or Item Rarity (Legendary, Rare) using the appropriate color tokens.

This design ensures the Compendium is both a powerful data filtration tool and an aesthetically immersive archive.
