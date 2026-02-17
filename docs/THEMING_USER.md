# Theme Customization Guide

Grimar features a powerful theme system that lets you personalize the look and feel of your D&D companion app. This guide explains how to create, import, export, and manage custom themes.

## Built-in Themes

Grimar comes with 12 pre-designed themes:

| Theme | Description |
|-------|-------------|
| Amethyst | Deep mystical purple (default) |
| Arcane | Gold runes on dark leather |
| Nature | Bioluminescence in the dark |
| Fire | Magma flowing over cold stone |
| Ice | Deep freeze |
| Ocean | Abyssal depths |
| Void | Cosmic emptiness |
| Beach | Sandy shores |
| Necropolis | Bone & Spirit |
| Charmed | Rose Quartz & Love Potion |
| Divine | Celestial Bronze |
| Underdark | Deep Slate & Spore |

## Changing Your Theme

1. Open **Settings** (gear icon in the header)
2. Navigate to the **Theme** section
3. Select any built-in theme - changes apply instantly

---

## Creating a Custom Theme

### Using the Theme Creator

1. Go to **Settings** → **Theme**
2. Click **Create Theme**
3. Fill in the details:
   - **Theme ID**: Unique identifier (e.g., `my-custom-theme`)
   - **Name**: Display name (e.g., "Dragon's Lair")
   - **Description**: Short description

4. Customize colors using the color pickers:
   - **Background**: Main app background
   - **Card**: Panel/card backgrounds
   - **Accent**: Primary interactive color
   - **Text**: Primary, secondary, and muted text colors
   - **Border**: Default and hover border colors

5. Click **Create Theme** to save

Your new theme will appear in the theme selector alongside the built-in ones.

---

## Importing a Theme

You can share themes with others by importing JSON theme files.

### Import from Text

1. Copy the theme JSON
2. Go to **Settings** → **Theme**
3. Click **Import Theme**
4. Paste the JSON into the text area
5. Click **Import**

### Import from File

1. Obtain a `.json` theme file
2. Go to **Settings** → **Theme**
3. Click **Import Theme**
4. Click **Choose File** and select the JSON file
5. Click **Import**

---

## Exporting a Theme

To share your custom theme:

1. Go to **Settings** → **Theme**
2. Find your custom theme in the selector
3. Click the **Export** button (or use the menu)
4. The JSON will be copied to your clipboard
5. Share the JSON with others or save as a file

---

## Theme JSON Format

A complete theme JSON looks like this:

```json
{
  "id": "dragons-lair",
  "name": "Dragon's Lair",
  "description": "Fiery cavern aesthetic",
  "source": "created",
  "colors": {
    "bgCanvas": "#1a0a0a",
    "bgCard": "rgba(80, 20, 20, 0.6)",
    "bgOverlay": "rgba(120, 30, 30, 0.8)",
    "accent": "#ff4500",
    "accentGlow": "rgba(255, 69, 0, 0.5)",
    "accentRgb": "255, 69, 0",
    "bgOverlayRgb": "120, 30, 30",
    "textPrimary": "#fff5f0",
    "textSecondary": "#ffaa80",
    "textMuted": "#cc6644",
    "textInverted": "#1a0a0a",
    "border": "rgba(255, 100, 50, 0.2)",
    "borderHover": "rgba(255, 69, 0, 0.5)",
    "shadow": "rgba(0, 0, 0, 0.6)",
    "overlayLight": "rgba(255, 200, 150, 0.1)",
    "overlayDark": "rgba(0, 0, 0, 0.4)",
    "effectUrl": ""
  },
  "typography": {
    "display": "Cinzel, serif",
    "body": "Inter, sans-serif"
  },
  "animation": {
    "ease": "cubic-bezier(0.4, 0, 0.2, 1)",
    "duration": { "fast": 150, "slow": 300 }
  },
  "visualEffects": {
    "noiseOpacity": 0.03,
    "borderSeparator": "none"
  }
}
```

### JSON Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (lowercase, hyphens allowed) |
| `name` | Yes | Display name |
| `description` | Yes | Short description |
| `colors.bgCanvas` | Yes | Main background color |
| `colors.bgCard` | Yes | Card background (supports rgba) |
| `colors.bgOverlay` | Yes | Overlay/modal background |
| `colors.accent` | Yes | Primary accent color (hex) |
| `colors.textPrimary` | Yes | Main text color |
| `colors.textSecondary` | Yes | Secondary text color |
| `colors.textMuted` | Yes | Muted text color |
| `colors.border` | Yes | Default border color |
| `colors.borderHover` | Yes | Hover state border |
| `colors.accentGlow` | No | Glow effect color |
| `colors.accentRgb` | No | Accent as RGB (comma-separated) |
| `colors.textInverted` | No | Text on light backgrounds |
| `colors.shadow` | No | Shadow color |
| `colors.overlayLight` | No | Light overlay effect |
| `colors.overlayDark` | No | Dark overlay effect |
| `typography.display` | No | Heading font |
| `typography.body` | No | Body font |
| `animation.ease` | No | CSS easing function |
| `animation.duration.fast` | No | Fast transition (ms) |
| `animation.duration.slow` | No | Slow transition (ms) |
| `visualEffects.noiseOpacity` | No | Texture overlay opacity (0-1) |
| `visualEffects.borderSeparator` | No | CSS gradient for separators |

---

## Managing Custom Themes

- **Edit**: Click the edit icon on your theme to modify colors
- **Delete**: Click the delete icon to remove (cannot delete built-in themes)
- **Export**: Click export to copy JSON to clipboard

## Tips for Theme Creation

1. **Test readability**: Ensure text has enough contrast against backgrounds
2. **Consistent accent**: Use your accent color sparingly for buttons and highlights
3. **Match fonts**: Pair fonts that complement each other (e.g., Cinzel + Cormorant Garamond for fantasy themes)
4. **Subtle effects**: Keep noise opacity low (0.01-0.05) for texture without distraction
