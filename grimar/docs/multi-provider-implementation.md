# Multi-Provider System Implementation

## Overview

Implemented a comprehensive multi-provider system for the D&D 5e PWA's
compendium data, allowing the app to sync from multiple sources (Open5e, SRD,
Homebrew) with robust error handling and visual indicators.

## Architecture

### Core Components

1. **Provider Interface** (`src/lib/server/providers/types.ts`)
   - Standard interface for all data providers
   - Methods: `fetchList`, `fetchDetail`, `transformItem`, `healthCheck`, `fetchAllPages`

2. **Provider Implementations**
   - **Open5e Provider** (`open5e.ts`) - API-based provider for Open5e data
   - **SRD Provider** (`srd.ts`) - GraphQL-based provider for D&D 5e SRD
   - **Homebrew Provider** (`homebrew.ts`) - File-based provider for custom content

3. **Provider Registry** (`registry.ts`)
   - Singleton pattern for managing providers
   - Loads configuration from `providers.json`
   - Handles provider lifecycle and health checks

4. **Multi-Provider Sync Service** (`multiProviderSync.ts`)
   - Orchestrates sync from multiple providers
   - Implements retry logic with exponential backoff
   - Handles concurrent sync operations
   - Provides detailed sync results per provider

### Configuration

Configuration is managed via `providers.json`:

```json
{
	"primaryProvider": "open5e",
	"providers": [
		{
			"id": "open5e",
			"name": "Open5e",
			"enabled": true,
			"type": "open5e",
			"baseUrl": "https://api.open5e.com",
			"supportedTypes": ["spell", "monster", "item"]
		},
		{
			"id": "srd",
			"name": "D&D 5e SRD",
			"enabled": false,
			"type": "srd",
			"baseUrl": "https://www.dnd5eapi.co/api",
			"supportedTypes": ["spell", "monster"]
		},
		{
			"id": "homebrew",
			"name": "Homebrew",
			"enabled": true,
			"type": "homebrew",
			"baseUrl": "",
			"supportedTypes": ["spell", "monster"],
			"options": {
				"dataPath": "data/homebrew"
			}
		}
	],
	"sync": {
		"maxConcurrency": 3,
		"retryAttempts": 3,
		"retryDelayMs": 1000
	}
}
```

## Implementation Steps Completed

### Step 1: Multi-Provider Sync Service

- Created `syncAllProviders()` function to sync from all enabled providers
- Added `syncProviderById()` for single provider sync
- Implemented `checkAllProviders()` for health monitoring
- Added retry logic with exponential backoff
- Improved error handling with detailed error reporting

### Step 2: API Integration

- Updated `/api/admin/sync` endpoint to use new service
- Modified response format to include per-provider results
- Updated daily sync scheduler to use multi-provider sync

### Step 3: Error Handling & Retry Logic

- Implemented `withRetry()` wrapper with configurable retries
- Added exponential backoff: 1x → 2x → 4x delay
- Wrapped critical operations in retry logic
- Added transaction support for database operations
- Enhanced logging with operation names and attempt numbers

### Step 4: UI Provider Indicators

- Added source badges to CompendiumListItem component
- Added source badges to CompendiumDetail header
- Updated spells and monsters pages to pass source through
- Implemented color-coded badges:
  - Blue: Open5e
  - Emerald: SRD
  - Amber: Homebrew
  - Purple: Other/Unknown

### Step 5: Testing & Verification

- Created comprehensive test script
- Verified provider registry loads correctly
- Tested health checks
- Verified sync operations work
- Confirmed data is stored with correct source field

## Database Schema

The existing `compendium_items` table already supported multi-provider through
its `source` field:

```sql
CREATE TABLE compendium_items (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,           -- Provider ID (open5e, srd, homebrew)
  type TEXT NOT NULL,            -- Item type (spell, monster, item)
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
		},
		{
			"providerId": "homebrew",
			"spells": 12,
			"monsters": 3,
			"items": 0,
			"totalItems": 15,
			"errors": []
		}
	],
	"summary": {
		"spells": 331,
		"monsters": 53,
		"items": 0,
		"totalItems": 384,
		"providersSynced": 2,
		"providersWithErrors": 0,
		"totalErrors": 0
	}
}
```

## Usage Examples

### Basic Sync

```typescript
import { syncAllProviders } from '$lib/server/services/multiProviderSync';

const db = await getDb();
const results = await syncAllProviders(db);
// Results include sync status for each provider
```

### Sync Specific Provider

```typescript
import { syncProviderById } from '$lib/server/services/multiProviderSync';

const db = await getDb();
const result = await syncProviderById(db, 'homebrew');
```

### Check Provider Health

```typescript
import { checkAllProviders } from '$lib/server/services/multiProviderSync';

const health = await checkAllProviders();
// Returns: { healthy: ['open5e', 'homebrew'], unhealthy: ['srd'] }
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
