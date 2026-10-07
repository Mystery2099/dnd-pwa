# Playable character sheets

Characters belong to the signed-in user. Create a blank sheet at `/characters/new`, open it from `/characters`, and explicitly save changes to the server. Existing character records, inventory, spells, portraits, and unknown statistics are retained; no database migration is needed. Sheet fields live in `stats.sheet`, with `_sheetRevision` used for atomic conflict detection. Saves and deletions are scoped to the authenticated owner. A stale tab receives a conflict rather than overwriting another device's edits.

## Rules implemented

The sheet uses 5e 2014 core calculations: ability modifiers, level-based proficiency, saving-throw proficiency, skill proficiency/expertise, passive perception, initiative, spell attack bonuses and save DCs. Attacks combine the selected ability, proficiency, and an editable extra bonus. Enter the complete damage expression including modifiers. Armor class, speed, maximum HP, spell-slot totals, class/subclass choices, and special bonuses are set by the player.

Damage uses temporary HP before current HP. Healing caps at maximum HP and clears death-save counters when HP is positive. Death saves are tracked manually. Spending a hit die rolls its die plus Constitution, clamps healing at zero, and consumes one die. Long-rest recovery restores HP and spell slots, clears temporary HP and death saves, and restores at least one or half the character's level in hit dice, rounded down. The player/GM decides rest eligibility and applies exhaustion and class-specific recovery manually.

Dice use browser cryptographic randomness and bounded expressions such as `1d20+5` or `2d6-1`. Advantage/disadvantage applies only to a single d20. Rolls are local, not shared or authoritative multiplayer rolls. Expressions are parsed, never evaluated as code.

Equipment, spells, and notes are free-text play records. Existing legacy inventory/spell arrays are shown separately without modification. The compendium remains available for rules lookup.

## Saving and backups

Edits remain in the editor until saved. Unsaved navigation prompts prevent accidental loss; failed network saves keep the editor open. JSON export works locally and includes unsaved changes. Import validates a Grimar sheet, replaces the editor's fields, and still requires Save. Exports contain sheet data, not ownership, IDs, portraits, or the original legacy arrays. Export before leaving if the server is unavailable. This version does not queue sheet mutations offline or guarantee recovery after a browser crash.

## Remaining work toward a Roll20 alternative

This branch makes personal character sheets usable; it is not a finished virtual tabletop. The following remain separate work:

- Campaign membership, invitations, GM access and deliberate sheet sharing.
- Live maps, tokens, fog of war, initiative encounters, group chat and shared rolls.
- Class/subclass feature automation, character-generation choices, multiclass spell slots, pact magic, conditions, and house-rule overrides.
- Structured inventory/spell selection and robust offline editing with conflict reconciliation.

Keep the existing Bun/SvelteKit/SQLite architecture and design tokens. Build each multiplayer flow around server-enforced campaign permissions rather than exposing another user's personal sheet.
