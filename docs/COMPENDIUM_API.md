# Compendium API

## Scope

This document covers the application-facing compendium API exposed by Grimar. It is about the normalized API the app consumes, not the raw upstream Open5e response shape.

## Routes

### `GET /api/compendium/items`

Returns paginated list results for a single compendium type.

Common query parameters:

- `type`
- `search`
- `page`
- `limit`
- `sortBy`
- `sortOrder`
- `gamesystem`
- `document`
- `source`

Type-specific query parameters:

- `creatureType`
- `challengeRating`
- `spellLevel`
- `spellSchool`
- `includeSubclasses`
- `onlySubclasses`

Response shape:

```json
{
  "listSchemaVersion": 1,
  "items": [
    {
      "item": { "...": "base compendium item row" },
      "presentation": {
        "description": "Short card summary",
        "documentLabel": "5e SRD",
        "cardIcon": { "family": "spell-school", "value": "illusion" },
        "badges": [{ "label": "Level 3", "variant": "solid" }]
      }
    }
  ],
  "total": 123,
  "page": 1,
  "pageSize": 50,
  "totalPages": 3,
  "hasMore": true,
  "resultsTruncated": false
}
```

### `GET /api/compendium/stats`

Returns counts by compendium type.

### `GET /api/compendium/[type]/[slug]`

Returns the normalized detail payload used by the compendium detail page.

Response shape:

```json
{
  "detailSchemaVersion": 1,
  "item": { "...": "base compendium item" },
  "presentation": {
    "documentLabel": "5e 2014 Rules",
    "image": { "...": "image and media props" },
    "creatureHeader": { "...": "creature header props" }
  },
  "fields": [
    {
      "key": "script_language",
      "label": "Script Language",
      "value": { "...": "normalized value" }
    }
  ],
  "sections": [
    { "kind": "markdown", "...": "description or higher-level section" },
    { "kind": "benefits", "...": "list or grouped background benefits" },
    { "kind": "spell-classes", "...": "normalized spell class access" },
    { "kind": "class-features", "...": "class progression content" },
    { "kind": "creature-encounter", "...": "combat-facing creature block" },
    { "kind": "creature-set-roster", "...": "creature set roster cards" }
  ]
}
```

## Contract Notes

- `listSchemaVersion` is the explicit version marker for the normalized compendium list payload.
- list `items` now separate the base row from `presentation` data that powers card descriptions, badges, document labels, and dynamic icons.
- `detailSchemaVersion` is the explicit version marker for the normalized detail payload.
- `fields` are curated sidebar/reference values, not a raw dump of `item.data`.
- `sections` are structured content blocks derived by the server-side detail adapter.
- `benefits` sections may render as a simple markdown list or as grouped semantic benefit cards, depending on the source type.
- Markdown-bearing content is discovered from the normalized detail payload and rendered server-side by the detail page loader.

## Current Status

The normalized detail contract is intended for in-repo consumers first. It is versioned and test-backed, but it should still be treated as an internal app API unless the project explicitly commits to external compatibility guarantees.
