# AGENTS.md

## Purpose

This repository is an Expo / React Native MVP for TioPet.
Agents should optimize for safe, incremental progress on the current app, not speculative platform architecture.

## Read First

Before changing code, read:

1. `TIOPET_MASTER_CONTEXT.md`
2. `TIOPET_SYSTEM_ARCHITECTURE.md`
3. `CLAUDE_ENGINEERING_GUIDE.md`
4. `PROJECT_TREE.txt`
5. `PROJECT_MEMORY.md` if it exists

Then inspect the actual code before proposing changes.

## Current Reality

- This is currently a client-side Expo app.
- Core state is local-first with Zustand + AsyncStorage.
- Firebase is present mainly for authentication.
- The booking flow, pets flow, and history flow are real.
- Admin, caregiver, QR, payments, notifications, and backend services are not implemented yet.

Agents must plan from the real codebase state, not from the ideal future architecture.

## Working Rules

- Do not rewrite large parts of the app.
- Prefer small, reversible changes.
- Keep compatibility with Expo Router, React Native, and TypeScript strict mode.
- Do not introduce backend assumptions unless the task explicitly requires them.
- Treat Google OAuth as a known blocker and avoid depending on it for unrelated MVP work.
- Preserve the current anonymous/local-first workflow unless asked to change auth.

## Implementation Priorities

Use this order unless the user asks otherwise:

1. Stabilize current MVP flows
2. Extract hardcoded domain logic into typed local modules
3. Improve auth reliability and persistence
4. Prepare clean boundaries for future backend integration
5. Add new MVP features

## Preferred Patterns

- Keep business rules out of screen components when they start growing.
- Extract typed constants, models, selectors, and helpers into `src/` modules.
- Reuse existing UI primitives in `src/ui`.
- Keep stores focused on state, not screen rendering concerns.
- Favor explicit TypeScript types over loose objects.

## Before Coding

For each task:

1. Identify the exact files involved
2. Explain the current problem briefly
3. Make the smallest useful change
4. Verify impact as much as the environment allows
5. Summarize what changed and any remaining risk

## Validation

- Run the smallest relevant validation available after changes.
- Prefer typecheck, lint, or targeted manual verification, depending on the task.
- If validation cannot run in the current environment, state that explicitly.

## Avoid

- Large architectural rewrites
- Premature backend scaffolding
- Mixing new domain rules directly into already-large screens
- Editing unrelated files
- Destructive git commands

## Expected Near-Term Direction

The safest path is:

- keep the app usable with anonymous auth
- extract booking domain data and rules from screens
- tighten local models
- then add a clean persistence boundary for future Firebase or API work
