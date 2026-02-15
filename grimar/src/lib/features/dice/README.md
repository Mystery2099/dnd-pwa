# Dice Rolling Feature

## Overview
Provides 3D physics-based dice rolling using [@3d-dice/dice-box](https://github.com/3d-dice/dice-box) with [rpg-dice-roller](https://github.com/TomTheBear/rpg-dice-roller) fallback for problematic dice types.

## Architecture

### Service Layer (`services/dice-service.ts`)
- Wraps `@3d-dice/dice-box` with lazy loading and retry logic
- Implements fallback to `rpg-dice-roller` for problematic dice (d4, d10, d100)
- Uses Winston logger for error tracking
- Validates assets before initialization
- Retry logic with exponential backoff (up to 3 attempts)

### State Management (`stores/dice-store.svelte.ts`)
- Svelte 5 runes-based reactive state
- Manages roll history (max 50 items)
- Controls tray UI state
- Tracks initialization and rolling states

### Components
- **DiceCanvas.svelte**: Full-screen overlay for 3D dice animation
- **DiceTray.svelte**: Floating action button + tray UI
- **DiceTrayContent.svelte**: Quick roll buttons and custom notation input
- **RollHistory.svelte**: Displays recent rolls

## Known Limitations

### Physics Issues
The following dice types have known collision detection issues in dice-box:
- **d4**: Tetrahedron mesh has gaps
- **d10/d100**: Polyhedral face mapping issues

These automatically use the reliable fallback roller.

### Performance
- Offscreen rendering enabled for better performance
- Lazy loading reduces initial bundle size
- Retry logic with exponential backoff for failed rolls

## Usage

### Basic Roll
```typescript
import { roll } from '$lib/features/dice';

const result = await roll('2d6+5');
console.log(result.total); // e.g., 12
```

### With Callback
```typescript
import { initDiceBox, setOnRollComplete } from '$lib/features/dice';

await initDiceBox('#dice-canvas', {
  themeColor: '#8b5cf6',
  offscreen: true
});

setOnRollComplete((results) => {
  console.log('Roll complete:', results);
});
```

## Testing

```bash
# Run all dice tests
bun run test -- dice

# Run with coverage
bun run test:run -- --coverage
```

## Asset Structure

```
grimar/static/dice-box/
├── ammo/
│   └── ammo.wasm.wasm          # Physics engine
├── themes/
│   └── default/
│       ├── default.json        # 3D mesh data
│       ├── theme.config.json   # Theme configuration
│       ├── diffuse-dark.png    # Dark number textures
│       ├── diffuse-light.png   # Light number textures
│       ├── normal.png          # Normal map
│       └── specular.jpg        # Specular map
└── manifest.json               # Asset manifest
```

## Future Enhancements
- [ ] Additional themes (rust, gemstone)
- [ ] Sound effects for dice rolling
- [ ] Advanced notation via dice-parser-interface
- [ ] Persistent roll history
- [ ] Roll sharing/export
