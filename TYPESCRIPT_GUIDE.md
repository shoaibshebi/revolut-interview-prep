# TypeScript Guide — Revolut Interview Prep

This file exists so you don't need a separate "learn TypeScript" project. Every
concept below is actually used somewhere in `src/` — the file path is given so
you can see it in real, working context, not just as an isolated snippet.

Read this once top to bottom before Sep 10, then use it as a lookup during
practice. Each section: **what it is → why it matters → where it's used here.**

---

## 1. `interface` vs `type`

**What:** Two ways to name an object shape.

```ts
interface Transaction { id: string; amount: number }
type Transaction = { id: string; amount: number };
```

**Why both exist / when to use which:**
- `interface` can be **extended** (`interface B extends A`) and **merged**
  (declaring it twice adds fields) — good for data models that might grow.
- `type` is required for **unions, intersections, and primitives** —
  `type Status = 'idle' | 'loading'` cannot be written as an interface.
- Convention used in this project: `interface` for object/data shapes,
  `type` for unions and anything derived (`keyof`, mapped types, etc.).

**Where:** [`task1-fetch-list/types.ts`](src/task1-fetch-list/types.ts) (`Transaction` is an interface,
`TransactionType` is a union `type`).

---

## 2. String literal unions vs `enum`

**What:** `type TransactionType = 'debit' | 'credit' | 'transfer'` instead of
`enum TransactionType { Debit, Credit, Transfer }`.

**Why:** A TS `enum` compiles to a real JavaScript object at runtime and adds a
concept that doesn't exist in plain JS. A string literal union is **zero
runtime cost** — it's erased entirely after type-checking — and it matches
structurally with whatever a JSON API actually sends back (`"credit"` from the
network satisfies the union with no conversion). Most teams (and interviewers)
prefer literal unions for exactly this reason. `enum` still has legitimate uses
(bitflags, when you truly want a runtime lookup object) but default to unions.

**Where:** [`task1-fetch-list/types.ts`](src/task1-fetch-list/types.ts), [`task2-form-validation/types.ts`](src/task2-form-validation/types.ts) (`CurrencyCode`).

---

## 3. Discriminated unions ("make invalid states unrepresentable")

**What:** A union of object shapes that all share one common field (the
"discriminant") with a different literal value in each branch:

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

**Why this matters more than almost anything else in this list:** compare it
to the "flat" alternative:

```ts
// The version to AVOID:
interface AsyncState<T> {
  loading: boolean;
  data?: T;
  error?: string;
}
```

With the flat version, nothing stops `{ loading: true, data: [...], error:
'oops' }` from being constructed — three fields disagreeing about what state
you're in, and the type system has no opinion about it. That's a real bug
waiting to happen (which message do you show — the data or the error?).

With the discriminated union, TypeScript **narrows automatically**: once you
check `if (state.status === 'success')`, TS knows `state.data` exists and
`state.error` doesn't, with zero casts. This is exactly what Revolut's roadmap
means by "type guards to make invalid states impossible."

**Where:** [`shared/asyncState.ts`](src/shared/asyncState.ts), consumed by
[`task1-fetch-list/TransactionList.tsx`](src/task1-fetch-list/TransactionList.tsx) and
[`task4-complex-ux/CardSearch.tsx`](src/task4-complex-ux/CardSearch.tsx).

---

## 4. Type guards

**What:** A function whose return type is `value is SomeType` (a "type
predicate") instead of plain `boolean`. When you call it in an `if`, TS
narrows the checked value's type inside that branch.

```ts
function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

catch (error: unknown) {
  if (isApiError(error)) {
    // TS now knows `error` is ApiError here — error.status is safely accessible
  }
}
```

**Why:** Anything caught in a `catch` block is typed `unknown` (not `any`) in
modern TS/strict mode — correctly, since JS lets you `throw` anything. A type
guard is the safe way to get back to a usable type, instead of an
`as ApiError` cast (which lies to the compiler if you're wrong) or `any`
(which turns off checking entirely).

**Where:** [`shared/mockApi.ts`](src/shared/mockApi.ts) (`isApiError`, `isError`), used everywhere a
`catch (error: unknown)` block appears.

---

## 5. Generics

**What:** A type parameter (`<T>`) that lets a function/type work over many
concrete types while keeping full type safety — the opposite of `any`, which
gives up type safety to get flexibility.

```ts
function simulateRequest<T>(data: T, options: SimulateOptions = {}): Promise<T> { ... }

// Caller decides what T is:
simulateRequest<Transaction[]>(mockTransactions) // Promise<Transaction[]>
simulateRequest<Card[]>(mockCards)               // Promise<Card[]>
```

**Why:** Without the generic, you'd either write `simulateRequest` once per
data type (duplication) or type it as `any`/`unknown` (losing the guarantee
that what comes out matches what went in).

**Where:** [`shared/mockApi.ts`](src/shared/mockApi.ts) (`simulateRequest<T>`), [`shared/asyncState.ts`](src/shared/asyncState.ts)
(`AsyncState<T>`), [`task4-complex-ux/useAsyncData.ts`](src/task4-complex-ux/useAsyncData.ts) (`useAsyncData<T>()`).

---

## 6. `keyof`, `Partial<T>`, `Record<K, V>` (utility types)

**What:**
- `keyof T` — a union of `T`'s property names as string literals.
- `Partial<T>` — every property of `T` made optional.
- `Record<K, V>` — an object type with keys `K`, all mapped to value type `V`.

```ts
interface SendMoneyFormValues { recipientEmail: string; amount: string; currency: CurrencyCode; note: string }

type FormField = keyof SendMoneyFormValues;
// 'recipientEmail' | 'amount' | 'currency' | 'note' — generated, not hand-written

type FormErrors = Partial<Record<FormField, string>>;
// { recipientEmail?: string; amount?: string; currency?: string; note?: string }
```

**Why:** Hand-writing `type FormField = 'recipientEmail' | 'amount' | ...`
works until someone adds a field to the form and forgets to update the union —
now they silently drift apart. Deriving `FormField` with `keyof` means it's
*impossible* for them to disagree; the compiler enforces it. `Partial<Record<...>>`
for an errors bag is idiomatic because most fields have *no* error most of the
time — you want the key absent, not present-and-`null`.

**Where:** [`task2-form-validation/types.ts`](src/task2-form-validation/types.ts).

---

## 7. `unknown` vs `any`

**What:** Both mean "could be anything," but `unknown` still requires you to
narrow it (via a type guard, `typeof`, `instanceof`) before doing anything with
it. `any` disables type-checking on that value entirely — it's the type-system
equivalent of `// @ts-ignore` sprinkled everywhere it flows.

**Why it's a red flag ("Red flag: using `any` type anywhere" — straight from
the roadmap PDF):** `any` is contagious — once one variable is `any`, anything
derived from it becomes `any` too, silently disabling checks across your whole
file. `unknown` gives you the same "I don't know the type yet" honesty without
that blast radius.

**Where:** every `catch (error: unknown)` block in this project (never `catch
(error: any)`); `simulateRequest`'s generic keeps data typed instead of `any`.

---

## 8. Function return types on exported functions

**What:** Writing `function fetchTransactions(): Promise<Transaction[]>`
instead of letting TS infer it.

**Why:** Inference is fine for local/internal code, but on a function other
files import, an explicit return type is documentation AND a safety net — if
someone edits the body and accidentally changes what it returns, TS flags the
mismatch immediately at the function, not later at some confusing call site.

**Where:** [`task1-fetch-list/api.ts`](src/task1-fetch-list/api.ts), [`task2-form-validation/validation.ts`](src/task2-form-validation/validation.ts).

---

## 9. Typing React event handlers

**What:** `(e: ChangeEvent<HTMLInputElement>) => void`, `(e:
FormEvent<HTMLFormElement>) => void`, etc., from `react`'s type definitions,
instead of leaving the parameter untyped (which TS would infer as `any` in a
plain `.tsx` callback without contextual typing).

**Why:** Typing the event gives you real autocomplete on `e.target.value`
and catches typos (`e.target.valeu`) at compile time instead of as a silent
`undefined` at runtime.

**Where:** [`task2-form-validation/SendMoneyForm.tsx`](src/task2-form-validation/SendMoneyForm.tsx).

---

## 10. `React.FC` vs a plain typed function (and why this project avoids `React.FC`)

**What:** Two ways to type a function component:

```ts
const TransactionList: React.FC<Props> = ({ failureRate }) => { ... };
// vs
function TransactionList({ failureRate }: Props) { ... }
```

**Why the plain function is preferred (current community consensus, and what
this project uses throughout):**
- `React.FC` implicitly adds `children?: ReactNode` to your props even when
  your component doesn't accept children — silently allowing
  `<TransactionList>garbage</TransactionList>` to type-check.
- It doesn't play well with generic components.
- A plain typed function needs no extra import and behaves like normal TS
  function typing everywhere else in your code.

**Where:** every component in this project — see the comment in
[`task1-fetch-list/TransactionList.tsx`](src/task1-fetch-list/TransactionList.tsx) for this exact reasoning, in place.

---

## 11. Typing custom hooks (and hook dependency arrays)

**What:** A custom hook is just a function — type its parameters and let TS
infer the returned object shape (or write it out if it's complex).

```ts
export function useAsyncData<T>() {
  const [state, setState] = useState<AsyncState<T>>(idle());
  // ...
  return { state, run, reset, isLoading: state.status === 'loading' };
}
```

**Why the dependency array matters as much as the types:** `useCallback`,
`useMemo`, and `useEffect` all take a dependency array — TypeScript won't stop
you from getting it wrong (an empty `[]` when you reference outside state is a
type-valid but functionally broken program). This project deliberately depends
on `state.values` in [`task2-form-validation/useSendMoneyForm.ts`](src/task2-form-validation/useSendMoneyForm.ts)'s `submit`
callback — an empty array there would silently submit stale form data.
`eslint-plugin-react-hooks` (already configured here) is the tool that catches
this class of bug in practice — types alone don't.

**Where:** every hook in `task1-fetch-list/`, `task2-form-validation/`,
`task4-complex-ux/`.

---

## 12. Typing Redux Toolkit: `PayloadAction<T>`, `RootState`, `AppDispatch`

**What:**

```ts
// A reducer's action.payload is typed via PayloadAction<T>:
addSymbol: (state, action: PayloadAction<WatchlistItem>) => { ... }

// Store-derived types instead of hand-written ones:
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Why derive `RootState`/`AppDispatch` from the store instead of writing them
by hand:** if you hand-write `interface RootState { watchlist: WatchlistState }`
and later add a second slice to the store, it's easy to forget to update the
hand-written type — now `useSelector` silently doesn't know about the new
slice. Deriving it with `ReturnType<typeof store.getState>` means it's always
in sync, by construction.

**Where:** [`task3-global-state/store/watchlistSlice.ts`](src/task3-global-state/store/watchlistSlice.ts), [`task3-global-state/store/store.ts`](src/task3-global-state/store/store.ts),
[`task3-global-state/store/hooks.ts`](src/task3-global-state/store/hooks.ts) (`useAppSelector`/`useAppDispatch` — pre-typed
wrappers so call sites never repeat `(state: RootState) => ...`).

---

## 13. Memoized selectors (`createSelector`) — not strictly a "type" topic, but always asked alongside typed Redux

**What:** `createSelector([inputSelectors], resultFn)` from `@reduxjs/toolkit`
(re-exported from `reselect`) returns a selector that only recomputes when its
inputs actually change by reference.

**Why:** A plain selector (`state => state.watchlist.allIds.map(id =>
state.watchlist.byId[id])`) builds a **new array every single call**, even if
nothing relevant changed — and because `useSelector` re-renders on reference
change, that means every list item re-renders on every unrelated store update.
`createSelector` fixes this by caching the last inputs/output pair.

**Where:** [`task3-global-state/store/selectors.ts`](src/task3-global-state/store/selectors.ts) — see
`selectors.test.ts` for a test that explicitly asserts the memoized reference
doesn't change when nothing relevant did.

---

## 14. `as const` and narrow inference (where it would apply)

**What:** `const CURRENCIES = ['USD', 'EUR'] as const` infers the *literal*
tuple type `readonly ["USD", "EUR"]` instead of the widened `string[]`.

**Why it's worth knowing even though this project mostly avoids needing it:**
without `as const`, `const x = 'USD'` infers as the type `string`, not the
literal `'USD'` — which breaks assigning it into a place expecting the
`CurrencyCode` union. `as const` (or explicitly annotating the array's type,
as this project does with `const CURRENCIES: CurrencyCode[] = [...]`) is the
fix. Good to say out loud in the interview if you reach for a literal array.

**Where:** [`task2-form-validation/SendMoneyForm.tsx`](src/task2-form-validation/SendMoneyForm.tsx) (`CURRENCIES: CurrencyCode[]`)
shows the explicit-annotation approach.

---

## Quick self-test before the interview

Cover the right column and see if you can say the "why" out loud for each:

| Concept | Where it lives in this project |
|---|---|
| Discriminated union | `shared/asyncState.ts` |
| Type guard | `shared/mockApi.ts` (`isApiError`) |
| Generic function | `shared/mockApi.ts` (`simulateRequest<T>`) |
| `keyof` derived union | `task2-form-validation/types.ts` (`FormField`) |
| `Partial<Record<K,V>>` | `task2-form-validation/types.ts` (`FormErrors`) |
| Typed reducer payload | `task3-global-state/store/watchlistSlice.ts` |
| Store-derived types | `task3-global-state/store/store.ts` |
| Memoized selector | `task3-global-state/store/selectors.ts` |
| Plain function over `React.FC` | any component file |
| `unknown` in catch blocks | any `try/catch` in the project |

If you can explain all ten without opening the file, you're ready.
