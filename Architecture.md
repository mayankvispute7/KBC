# ARCHITECTURE.md — Kaun Banega College Pati 👑
*This file is the single source of truth for the project. Re-read it before starting any new build step. If a later decision conflicts with this file, update this file in the same commit — never let the code and this doc drift apart.*

---

## 1. Project Summary
Cinematic, projector-ready, host-controlled live quiz-show web app for a college Teachers' Day event. 12 fixed questions, single host device driving a full-screen display, no live audience input beyond a stage-managed lifeline moment. Next.js + TypeScript + Tailwind + Framer Motion + GSAP, Postgres (Supabase) + Prisma.

## 2. Game State Machine
```
WELCOME → RULES → LIFELINE_INTRO → LADDER_REVEAL
  → QUESTION → TIMER_RUNNING → OPTION_SELECTED → LOCK_CONFIRMATION → LOCKED
    → ANSWER_REVEAL → CORRECT | WRONG   (or TIMER_RUNNING → TIMEOUT if unlocked at 0:00)
      → NEXT_TRANSITION → (loop to QUESTION, chocolate level++)
  → after Q12 correct: FINALE → COMPLETE

Side-states: PAUSED (P key), ADMIN (Shift+A → PIN), RESET (R key, confirm dialog)
```
Central state shape — see `/lib/gameState.ts` (create this file to hold the reducer/store; do not scatter state across components):
```ts
type GameState = {
  currentQuestionIndex: number;
  selectedOption: 'A'|'B'|'C'|'D'|null;
  lockedOption: 'A'|'B'|'C'|'D'|null;
  timerEnd: number | null;            // absolute epoch ms — never a naive countdown int
  remainingAtPauseMs: number | null;
  timerRunning: boolean;
  usedLifelines: { fiftyFifty: boolean; audiencePoll: boolean; askStudent: boolean; hotline: boolean };
  fiftyFiftyRemoved: ('A'|'B'|'C'|'D')[] | null;
  gameStatus: GameStatus;             // the enum listed above
  currentChocolateLevel: number;      // 0–12
  sessionId: string;
};
```
**Timer rule:** timer is always derived as `Math.max(0, timerEnd - Date.now())`, recomputed every render/tick. Never decrement a counter directly.

## 3. Option Visual States
`DEFAULT` · `HOVER` · `SELECTED` · `LOCKED` · `CORRECT` · `WRONG` · `ELIMINATED` (50–50 only, greyed + struck-through, visually distinct from `DISABLED`) · `DISABLED` (general non-interactive, e.g. the 3 non-selected options post-lock)

## 4. Lifeline Rules
- Single use each; used state is permanent-visible, never disappears, resets only on full Reset.
- **50–50 eligibility:** requires ≥2 incorrect options. If a question has 3+ correct options (schema supports this even though the current 12 seed questions don't use it), 50–50 is disabled for that question — show "Not available this question," don't let it fire into a broken state.
- 50–50 removal set must never intersect `correctOptions` — enforce server-side, not just in the admin UI.
- Audience Poll: Q2 uses real deck values (A11/B64/C18/D7); all others use admin-editable auto-generated values (correct option 60–75%, remainder split across the rest, sum = 100).
- Ask a Student / Staffroom Hotline: cinematic overlay + optional free-text `hostNote`, no real audience/telephony integration.

## 5. Database Schema (Prisma)
See `prisma/schema.prisma` — canonical models: `Question`, `GameSession`, `GameSettings`. Full field list and validation rules are in the master build prompt §11 (also paste that section into `prisma/schema.prisma` comments so it isn't lost).

**Persistence rule:** write to `GameSession` on state *transitions* only (select, lock, reveal, next, lifeline-use, pause, reset) — never on a timer tick. Snapshot question content into the session at question-reveal time so a mid-event admin edit never changes an in-progress question.

## 6. Design Tokens
```
bg-void #05070D · bg-navy #0B0F1F · bg-navy-light #141B34
gold #E8C86B · gold-bright #FFE9A8 · gold-deep #B4903B
ink-white #F6F1E4 · blue-glow #3A5AFF
success #3DDC84 · success-glow #8CFFC1
danger #E85B5B · danger-glow #FF9B9B
neutral-line #2A3352
```
Fonts: Cinzel Decorative/Playfair Display (titles) · Poppins (body/options) · Space Grotesk or JetBrains Mono (timer digits only, tabular). No cream/beige backgrounds, no neon/cyberpunk palette, no glassmorphism overload.

## 7. Keyboard Map
`1–4` select · `Enter`/`Space` context-advance (lock → confirm → continue) · `N` next question · `F` fullscreen · `P` pause · `Shift+A` admin PIN · `R` reset. All shortcuts must no-op when focus is inside an input/textarea/contentEditable — test every one, including inside the admin form.

## 8. Content Source
All 12 questions, correct answers, jokes, and finale copy are extracted verbatim from the supplied PPTX and live in `prisma/seed.ts` (or equivalent seed script) — see the master build prompt §10 for the full dataset. Do not invent replacement questions; this file plus the seed data is the content source of truth going forward, not the original PPTX.

## 9. Non-Negotiables
- No real KBC/Sony branding, fonts, or audio — original "College Pati" identity only.
- Highest animation priority: option select → lock → final answer → reveal → chocolate progression → grand finale. These get the most build time of anything in the app.
- App must survive a browser refresh mid-game without losing state (§5/§7 persistence rules).
- Admin panel is PIN-gated (Shift+A → 4-digit PIN), not open-access — prevents an accidental on-stage reveal.

## 10. Decision Log
*(Append here whenever a build step makes a judgment call not already covered above — keeps this file authoritative instead of decisions living only in chat/agent memory.)*
- **Database Provider (Local Dev)**: Switched Prisma schema to SQLite for local development so DB pushing and seeding works without a Postgres container.
- **Ladder Relabeling**: Replaced static `CHOCOLATE_LADDER` array with dynamic `getChocolateLadder()` generating the "Dark Fantasy" prize sequence.
- **Admin Panel & Sounds**: Completed Admin UI with Framer Motion reordering, strict 50-50/Poll validation, and a new Sounds tab for custom URL audio integration. Sounds persist to `GameSettings`.