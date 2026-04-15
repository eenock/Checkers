# Checkers

A polished two-player checkers game built with Next.js, React, TypeScript, and Tailwind CSS.

It includes full turn-based gameplay, forced captures, chain jumps, king promotion, move history, undo support, local progress saving, and responsive UI tuned for desktop and mobile play.

## Features

- Full 8x8 checkers board with classic starting layout
- Forced-capture rule enforcement
- Multi-jump capture chains
- King promotion when a piece reaches the far side
- Win detection when a player has no pieces or no legal moves
- Draw detection after 50 non-capturing moves
- Undo for the last completed turn
- Surrender, reset, and animation toggle controls
- Move history with capture and promotion markers
- First-time tutorial overlay
- Local storage persistence for in-progress games
- Responsive layout with keyboard-friendly interactions

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Gameplay Notes

- Light moves first.
- Regular pieces move diagonally forward.
- Captures are mandatory when available.
- If a jump leads to another available jump, the same piece must continue.
- Reaching the opposite end promotes a piece to a king.
- Kings can move diagonally in both directions.

## Project Structure

```text
app/
  layout.tsx
  page.tsx
components/
  checkers/
    board.tsx
    game.tsx
    game-controls.tsx
    move-history.tsx
    piece.tsx
    square.tsx
    tutorial.tsx
    win-celebration.tsx
lib/
  checkers/
    game-logic.ts
    game-reducer.ts
    types.ts
```

## Quality Checks

The project currently passes:

- `npm run lint`
- `npm run build`
- `npx tsc --noEmit`

## Possible Next Steps

- Add single-player AI
- Add sound effects
- Add difficulty levels
- Add online multiplayer
- Add tests for move generation and reducer behavior
