# Commands

## Development
- `npm run start` - Run Next.js frontend (port 3090) and API (port 3091)
- `npm run dev` - Run Next.js frontend only
- `npm run build` - Build the Next.js app
- `npm run build:cli` - Build the CLI

## Testing
- `bun test` - Run all tests
- `bun test tests/path/to/file.test.ts` - Run a single test file
- `bun test --watch tests/path/to/file.test.ts` - Run tests in watch mode

## Formatting and Linting
- `npm run format` - Format all files
- `npm run format:check` - Check formatting without modifying files

# Code Style Guidelines

- **File Naming**: Use kebab-case for all filenames
- **Formatting**: 
  - Double quotes for JSX attributes
  - Trailing commas required
  - Semicolons optional but consistent
  - Always use parentheses for arrow functions
  - Bracket spacing enabled
- **Imports**: Use organized imports (auto-sorted by Biome)
- **Error Handling**: 
  - Prefer Go-style error handling (return [result, error] tuples)
  - Avoid try/catch when possible
- **Types**: 
  - TypeScript used throughout the codebase
  - `any` type is allowed when necessary