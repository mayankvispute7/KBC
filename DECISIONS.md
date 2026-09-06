# DECISIONS.md — Kaun Banega College Pati 👑
*Log of architectural and dependency decisions not covered in Architecture.md*

---

## Dependency Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-01-01 | `bcryptjs` for PIN hashing | Lightweight bcrypt implementation, no native compilation needed. Used to hash the 4-digit admin PIN stored in GameSettings. |
| 2024-01-01 | `tsx` for seed script | Allows running TypeScript seed scripts directly without a separate build step. Dev dependency only. |
| 2024-01-01 | `@tailwindcss/forms` | Not currently used but included for admin panel form styling if needed. Can be removed if unused. |

## Architecture Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-01-01 | React Context + useReducer over Zustand | The brief allows either. useReducer is zero-dependency, keeps the state machine logic explicit in a single reducer function, and the app has a single consumer tree (no cross-tab sync needed). |
| 2024-01-01 | Web Audio API oscillator-based placeholder sounds | No external audio files needed for initial build. Synthesized stings give immediate feedback; real audio files can replace them later by swapping the AudioManager's play methods. |
| 2024-01-01 | GSAP for scroll-reveal, Framer Motion for in-game | GSAP ScrollTrigger is purpose-built for scroll-driven sequences (landing). Framer Motion's declarative variants are better for state-driven UI (game options, overlays). Using both avoids fighting either library's paradigm. |
