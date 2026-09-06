# Revolut Interview Prep

A single React + TypeScript project covering all 4 practice tasks from the
Revolut Round 2 technical interview roadmap. No real backend — every "API
call" is simulated (with real delay, real cancellation, and an injectable
failure rate) so every loading/error/retry path can actually be exercised and
tested.

**Start here:** [`TYPESCRIPT_GUIDE.md`](./TYPESCRIPT_GUIDE.md) — every TypeScript concept used in
this codebase, explained with the *why*, and a file reference to see it live.
That file is the TS revision material; this README is the project map.

## Run it

```bash
npm install
npm run dev        # open the app, click between the 4 tasks in the nav
npm test           # run all unit/component tests once
npm run test:watch # re-run on file changes while you practice
npm run test:coverage
```

Coverage is currently ~90% overall (target from the roadmap is 70%+).

## The 4 tasks, and where they live

| # | Roadmap task | Folder | Domain used |
|---|---|---|---|
| 1 | Fetch + Display List | [`src/task1-fetch-list/`](src/task1-fetch-list/) | Transaction history |
| 2 | Form with Validation | [`src/task2-form-validation/`](src/task2-form-validation/) | Send money form |
| 3 | Global State (Redux Toolkit) | [`src/task3-global-state/`](src/task3-global-state/) | Currency watchlist |
| 4 | Complex UX (loading+error+empty) | [`src/task4-complex-ux/`](src/task4-complex-ux/) | Card search |

Each task folder is self-contained: `types.ts` → `api.ts` (fake network) →
a hook → a component → `*.test.ts(x)`. Read them in that order — it's the
same order you should build in during the real interview (types first, per
the roadmap's own communication script).

[`src/shared/`](src/shared/) has two things every task reuses:
- `mockApi.ts` — the fake network layer (delay, abort, injectable failure rate, `ApiError`, type guards).
- `asyncState.ts` — the `AsyncState<T>` discriminated union (idle/loading/success/error).

### Task 1 — Fetch + Display List
- [`useTransactions.ts`](src/task1-fetch-list/useTransactions.ts): fetch-on-mount hook with `AbortController` cancellation (guards against a race if the component unmounts or refetches mid-flight) and a `retry()` escape hatch.
- [`TransactionList.tsx`](src/task1-fetch-list/TransactionList.tsx): all states as explicit `if`s — loading, error+retry, empty, success.
- Tests cover: loading render, success render, empty state, error+retry round-trip, hook-level race-condition guard.

### Task 2 — Form with Validation
- [`validation.ts`](src/task2-form-validation/validation.ts): pure, framework-free validation functions — the part interviewers actually unit test, kept separate from React on purpose.
- [`useSendMoneyForm.ts`](src/task2-form-validation/useSendMoneyForm.ts): real-time per-field validation on every keystroke, full-form validation on submit, double-submit guard.
- Tests cover: each validation rule + edge cases (zero/negative/NaN amount, malformed email, 140-char note cap), real-time error appearance, blocked submit on invalid data, success + error submit paths.

### Task 3 — Global State (Redux Toolkit)
- [`store/watchlistSlice.ts`](src/task3-global-state/store/watchlistSlice.ts): normalized state (`byId` + `allIds`) — see `TYPESCRIPT_GUIDE.md §3` for *why* normalize.
- [`store/selectors.ts`](src/task3-global-state/store/selectors.ts): memoized selectors via `createSelector` — includes a test that asserts the memoized reference doesn't change when nothing relevant did.
- [`WatchlistApp.tsx`](src/task3-global-state/WatchlistApp.tsx): 3 components (`WatchlistSummary`, `AddSymbolForm`, `WatchlistTable`) all reading/writing the same slice with no props passed between them.
- Tests cover: every reducer case + edge cases (duplicate add, remove-unknown, update-unknown) in isolation, selector memoization, and a full integration test rendering against a real store.

> Context API is the other option the roadmap mentions. Redux Toolkit was
> chosen here because it makes normalized state + memoized selectors +
> reducer unit tests concrete and testable in isolation — exactly what's
> being evaluated. If Context comes up in the interview instead, the same
> normalized-state and selector *concepts* still apply; only the plumbing
> (`useReducer` + Context instead of a store) changes.

### Task 4 — Complex UX (Loading + Error + Empty)
- [`useAsyncData.ts`](src/task4-complex-ux/useAsyncData.ts): the generic, on-demand version of the async pattern (contrast with Task 1's fetch-on-mount version) — reusable for any `T`.
- [`CardSearch.tsx`](src/task4-complex-ux/CardSearch.tsx): all 4 states handled explicitly (idle / loading / error / empty / success — yes, that's 5; idle-before-first-search is the one people forget), contextual empty-state message naming the actual search term, retry on error, and a guard against a redundant second search while one is in flight.
- Tests cover: all 4+1 states rendering correctly, retry recovering from an error, and the redundant-action guard (clicking "Search" twice only fires one request).

## Testing patterns used throughout

- **Arrange-Act-Assert** structure in every test.
- **Factory functions** for test data (`buildTransaction`, `buildValues`, etc.) — build the common case once, override only what a given test cares about.
- **Mocking at the module boundary** (`jest.mock('./api')`) rather than mocking global `fetch` — tests stay decoupled from *how* a request is made internally.
- **`jest.mocked(...)`** for typed mock functions instead of casting to `jest.Mock`.
- Every async flow has both a happy-path test and a failure-path test; every reducer/validator has explicit edge-case tests (zero, negative, empty, duplicate, unknown-id).

## Project structure notes (for the interview's "explain your setup" moment)

- **Vite** for dev/build (fast HMR), **Jest + React Testing Library** for tests (per the roadmap's explicit "Unit tests written (jest)" requirement) — these are two separate toolchains on purpose; `ts-jest` compiles test files independently of Vite.
- `strict: true` is on in `tsconfig.app.json` (inherited from the Vite template) — this is what makes `unknown` in catch blocks, no-implicit-`any`, etc. actually enforced.
- `jest.config.cjs` sets a 70% coverage threshold (statements/functions/lines) matching the roadmap's target — `npm run test:coverage` will fail the build if coverage drops below it.
