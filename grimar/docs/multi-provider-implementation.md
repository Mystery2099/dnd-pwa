# Multi-Provider System Implementation

## Overview

Implemented a multi-provider system for the D&D 5e PWA's compendium data,
allowing the app to sync from multiple sources (Open5e, Homebrew) with robust
error handling and visual indicators.

## Architecture

### Core Components

1. **Provider Interface** (`src/lib/server/providers/types.ts`)
   - Standard interface for all data providers
   - Methods: `fetchList`, `fetchDetail`, `transformItem`, `healthCheck`, `fetchAllPages`

2. **Provider Implementations**
   - **Open5e Provider** (`open5e.ts`) - API-based provider for Open5e v2 data
   - **Homebrew Provider** (`homebrew.ts`) - File-based provider for custom content

3. **Provider Registry** (`registry.ts`)
   - Singleton pattern for managing providers
   - Loads configuration from `providers.json`
   - Handles provider lifecycle and health checks

4. **Sync Orchestrator** (`services/sync/orchestrator.ts`)
   - Orchestrates sync from multiple providers
   - Implements retry logic with exponential backoff
   - Handles concurrent sync operations
   - Provides detailed sync results per provider

### Configuration

Configuration is managed via `providers.json`:

```json
{
	"enabled": {
		"open5e": true,
		"homebrew": false
	},
	"primary": "open5e"
}
```

## Database Schema

The `compendium_items` table supports multi-provider through its `source` field:

```sql
CREATE TABLE compendium_items (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,           -- Provider ID (open5e, homebrew)
  type TEXT NOT NULL,             -- Item type (spell, monster, item)
  externalId TEXT,                -- Provider's item ID
  name TEXT NOT NULL,
  summary TEXT,
  details TEXT NOT NULL,          -- JSON with full item data
  -- Type-specific sorting fields
  spellLevel INTEGER,
  spellSchool TEXT,
  challengeRating TEXT,
  monsterSize TEXT,
  monsterType TEXT
);
```

## API Responses

### Sync Endpoint Response

```json
{
	"ok": true,
	"providers": [
		{
			"providerId": "open5e",
			"spells": 319,
			"monsters": 50,
			"items": 0,
			"totalItems": 369,
			"errors": []
		}
	]
}
```

## Benefits

1. **Flexibility**: Easy to add new providers by implementing the interface
2. **Resilience**: Failures in one provider don't affect others
3. **Transparency**: Users can see data source for each item
4. **Scalability**: Can sync concurrently from multiple sources
5. **Maintainability**: Each provider is isolated with clear responsibilities

## Future Enhancements

1. **Provider Priority**: Configure precedence for duplicate items across providers
2. **Incremental Sync**: Track last sync per provider for faster updates
3. **Provider Management UI**: Enable/disable providers from admin dashboard
4. **Custom Providers**: Allow users to add their own data sources
5. **Data Merging**: Intelligently merge duplicate items from different sources
