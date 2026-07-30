# Walkthrough: Poisoned Pinot Vertical Slice

We have successfully built and verified the complete **Poisoned Pinot** vertical slice case. This mystery exercises all key mechanics of the game's architecture—hotspot exploration, alibi mapping, evidence collections, interrogations, and logic verification.

## Architecture & State Sync Solved

- **Hook Reactivity**: Replaced isolated engine hook instantiations with a centralized singleton communication network. All panel views now react immediately to changes in clues, evidence discoveries, and timeline shifts.
- **Data Integration**: Successfully wired the complete dataset containing the 7 evidence items, 9 observations, 8 observation objects, and 6 timeline events.
- **Dialogue Interrogation**: Wired conditional branch choices using existing engine capabilities (e.g. choices like `[Present Cellar Log]` show up only when in inventory).

---

## Workspace Panels Completed

1. **Map Panel / Locations** ([map-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/map-panel.tsx)): Displays blueprint-styled floor layouts for the Tasting Room, Wine Cellar, and Arthur's Private Office. Restricts entrance to the Private Office until the keycard is retrieved from Elena Rostova.
2. **Evidence Inventory** ([evidence-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/evidence-panel.tsx)): Renders gathered clues, detailed analysis buttons, and lab reports. Analyzing the Cellar security log automatically unlocks timeline nodes.
3. **Observations** ([observation-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/observation-panel.tsx)): Lists hotspots for examination. Unlocks physical inventory evidence and triggers timeline events (e.g. Sommelier's blue lips unlock glass shatter event).
4. **Dialogue Interrogation** ([dialogue-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/dialogue-panel.tsx)): Shows active suspect state (mood, suspicion, trust), alibis, conversation history, and conditional evidence presentation buttons.
5. **Timeline Mapping** ([timeline-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/timeline-panel.tsx)): Allows moving event cards up and down to build chronologies. Calculates contradiction warnings dynamically.
6. **Theory Graph Builder** ([theory-board-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/theory-board-panel.tsx)): Pins suspect, motive, and evidence nodes, allowing players to establish connections and check logic validity.
7. **Notebook & Objectives** ([notebook-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/notebook-panel.tsx) & [objective-panel.tsx](file:///d:/observation%20files/src/features/workspace/components/panels/objective-panel.tsx)): Tracks primary goals and autosaves note cards to localStorage.

---

## Accusation Ending Verification

The user can click the **Accuse Suspect** button in the bottom action bar to confront the murderer.
- **Accusation Parameters**: Player must designate Arthur Sterling as the culprit, state his motive (containing counterfeit details), and attach 4 key evidence items along with the 3 correct scene observations.
- **Grading & Scoring**: Submitting a correct accusation rewards the player with a **100/100 Case Solved** card. Incorrect submissions give detailed forensic feedback from the prosecutor and adjust the score down.

---

## Compilation & Build Verification

The project compiles cleanly and builds a production-ready Next.js layout:

```bash
pnpm typecheck   # Succeeded
pnpm build       # Succeeded (Next.js Turbopack compiled and static pages generated successfully)
```
