# Theme Guide

## What You Can Do

Grimar currently supports:

- Selecting any built-in theme
- Importing a theme from JSON
- Applying an imported theme
- Exporting an imported theme back to JSON
- Deleting an imported theme

The current settings UI does not expose a full point-and-click theme editor.

## Built-in Themes

Grimar ships with 12 built-in themes:

- Amethyst
- Arcane
- Nature
- Fire
- Ice
- Ocean
- Void
- Beach
- Necropolis
- Charmed
- Divine
- Underdark

## Change Theme

1. Open `/settings`.
2. Go to the Appearance section.
3. Select a theme card.
4. The new theme applies immediately and is remembered on this device.

## Import a Theme

1. Open `/settings`.
2. In Appearance, choose `Import`.
3. Paste theme JSON or choose a `.json` file.
4. Save the import.

Imported themes are stored locally in your browser.

## Export or Delete an Imported Theme

In the Imported Themes area:

- Use the palette button to apply the theme
- Use the download button to export the theme JSON
- Use the trash button to remove the imported theme

## Theme JSON

Themes must match the app’s schema. A minimal valid theme still needs complete color, typography, animation, and visual effect sections. For the exact developer-facing shape, see [THEMING_DEV.md](/home/mystery/misc-projects/dnd-pwa/docs/THEMING_DEV.md).

## Notes

- Theme choice is local to the browser unless you export and share the JSON.
- Imported themes can look wrong or unreadable if their colors are poorly chosen.
- Built-in themes are part of the application and cannot be deleted.
