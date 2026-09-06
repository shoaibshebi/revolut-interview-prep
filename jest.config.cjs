// Jest ki main config file — `npm test` chalane pe yeh file padhi jaati hai.
// ".cjs" extension jaan-boojh kar hai: package.json mein "type": "module" set
// hai (Vite ko ESM chahiye), lekin Jest apni config file ko CommonJS format
// mein padhna prefer karta hai (ts-node ki extra dependency nahi chahiye) —
// isliye ".cjs" use kiya, taaki yeh file हमेशा CommonJS treat ho.

/** @type {import('jest').Config} */
module.exports = {
  // .ts/.tsx test files ko compile karne ke liye ts-jest use karo (Babel nahi) —
  // isse TypeScript ke real type-errors bhi test-run ke waqt pakde jaate hain.
  preset: 'ts-jest',

  // Tests browser jaisa environment expect karte hain (document, window,
  // localStorage waghera) kyunki React components render/test ho rahe hain —
  // "jsdom" ek fake-browser hai jo Node ke andar hi yeh sab simulate karta hai.
  testEnvironment: 'jsdom',

  // Har test file run hone se PEHLE, ek baar yeh setup file chalao —
  // yahan sirf @testing-library/jest-dom import hota hai, jo `toBeInTheDocument()`
  // jaise extra matchers add karta hai jo Jest mein by default nahi hote.
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Agar koi component `import './styles.css'` karta hai, to Jest ko asli CSS
  // parse karne ki zaroorat nahi — "identity-obj-proxy" ek fake module hai jo
  // sirf class-name string wapas kar deta hai, taaki import se test crash na ho.
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },

  // .ts/.tsx files ko test-run se pehle ts-jest se compile karo, aur usme
  // wahi custom tsconfig use karo jo Jest/CommonJS ke liye bana hai
  // (dekho tsconfig.jest.json — normal app config se alag hai).
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },

  // Sirf "*.test.ts" / "*.test.tsx" naam ki files ko test samjho — baaki
  // saare source files (jaise api.ts, types.ts) test ke roop mein run nahi honge.
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],

  // `npm run test:coverage` chalane par yeh batata hai konsi files coverage
  // report mein ginni hain. main.tsx / vite-env.d.ts / setupTests.ts ko
  // exclude kiya kyunki inme koi "testable logic" hai hi nahi (sirf boilerplate/setup).
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/setupTests.ts',
  ],

  // Agar overall coverage in numbers se neeche gira, to `test:coverage`
  // command FAIL ho jayegi (CI mein bhi yehi rokega) — Revolut ke roadmap
  // ka "70%+ coverage target" isi threshold se enforce ho raha hai.
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};
