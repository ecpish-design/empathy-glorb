# GLORB // EMPATHY MISSION — MOBILE AUDIT REBUILD

This version replaces the accumulated/conflicting phone CSS with one authoritative mobile breakpoint.
Desktop and iPad/tablet rules remain unchanged.

## Main mobile fixes
- Removed percentage-height mobile rows and `height:100%` phone panels.
- Removed the pattern that pushed story navigation to the bottom of an oversized cream panel.
- Phone screens now use natural content height and the app scrolls only when content genuinely needs more room.
- Cover remains a deliberate full-screen composition; all other screens are content-driven.
- Story, intro, briefing, learning, hub, all three missions, completion, certificate and adult information were each given dedicated phone rules.
- Mission 1 artwork is larger and stacked above the clue content on phone.
- Touch controls are at least ~44px high.
- Read aloud remains icon-only on phone; Forward is hidden; More information becomes Info.
- Added cache-busting query strings to `style.css` and `script.js` so GitHub Pages / iOS Safari fetch the new version rather than reusing stale CSS.

## Assets
No mission asset names changed. `assets/cover.png` is included only because it is the custom cover asset.
Keep the rest of your existing `assets/` folder in the branch.

## Upload
Replace these files at the repository root:
- `index.html`
- `style.css`
- `script.js`
- `README.md` (optional)

Keep your existing assets. If `assets/cover.png` is already there, it does not need to be replaced.


## Cover-only tablet/desktop correction
- Rebuilt only the cover for widths above 600px.
- Glorb is now a large left-hand visual anchor.
- Title, signal, decoded message and button form a stronger right-hand hierarchy.
- Phone/mobile layouts and the rest of the game are unchanged.
