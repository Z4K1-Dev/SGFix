# Guidelines

## Architecture & Structure
- Code must be **modular** and follow the **Single Responsibility Principle (SRP)**.
- **Pure UI** components go into `components/ui/`.
- **Layout** (sidebar, navbar, footer) goes into `components/layout/`.
- **Logic & data fetching** should be separated into `hooks/` or `lib/`.
- **Pages** (`app/`) should only act as orchestrators, not contain all logic.
- Use **consistent naming conventions**:
  - Components → PascalCase (`ResidentsTable.tsx`)
  - Hooks → camelCase (`useResidents.ts`)
  - Route folders → kebab-case (`/dashboard/services/page.tsx`)
- Keep file size small:
  - Component < 150 lines
  - Page < 200 lines
  - Hook < 100 lines

## Coding Style & Best Practices
- Always follow **ES6 standards** (`let/const`, arrow functions, async/await, destructuring).
- Use **JSDoc-style comments** for functions, classes, and modules → write descriptions in **Indonesian language**.
- Write code with a **clean, idiomatic style** according to the language/framework.
- Use **best practices**: simple structure, semantic HTML for web.
- Avoid unnecessary boilerplate or repetitive code.
- Use **functional components** (not classes) when working with React/Next.js.
