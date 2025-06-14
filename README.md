# Lemonade Stand Obsidian Plugin

Play the classic 1979 Lemonade Stand business simulation game right inside Obsidian!

## How to Play

1. Click the glass/cup icon in the ribbon to start the game
2. Choose whether to start a new game and how many players
3. Each day, make three key decisions:
   - How many glasses of lemonade to make
   - How many advertising signs to create (15¢ each)
   - What price to charge per glass
4. Watch the weather and adapt your strategy
5. Try to maximize your profits and avoid bankruptcy!

## Game Mechanics

- **Starting Assets**: Each player begins with $2.00
- **Production Costs**: Start at 2¢ per glass, increase over time
- **Weather Impact**: 
  - Sunny days: Normal sales
  - Hot days: Increased demand
  - Cloudy/rainy days: Reduced demand
  - Thunderstorms: All lemonade ruined!
- **Random Events**: Street construction, supply cost changes, etc.

## Installation

### BRAT (Beta Reviewer's Auto-update Tool)
1. Install the BRAT plugin in Obsidian
2. Add this repository URL to BRAT
3. Enable the Lemonade Stand plugin in Settings > Community Plugins

### Manual Installation
1. Download the latest release
2. Extract to your vault's `.obsidian/plugins/lemonade-stand/` folder
3. Enable the plugin in Settings > Community Plugins

## Usage

- Click the ribbon icon to open the game in a new tab
- The game replaces the note area - close the tab when finished
- No settings required - just enable and play!

## About the Original Game

This is based on the classic Lemonade Stand game originally written by Bob Jamison for the Minnesota Educational Computing Consortium and later adapted for Apple computers by Charlie Kellner in 1979. The original BASIC source code is completely open source and has been faithfully converted to modern TypeScript.

## Development

```bash
# Install dependencies
npm install

# Development mode (auto-rebuild)
npm run dev

# Build for production
npm run build
```

## License

MIT License - see LICENSE file for details

## Credits

- Original game by Bob Jamison (Minnesota Educational Computing Consortium)
- Apple adaptation by Charlie Kellner (1979)
- Obsidian plugin adaptation by Matt Reider (2025)